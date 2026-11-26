// Automation workflows: the part that actually runs what the admin drew in Automation → Workflows.
//
// Something happens (a lead comes in, a stage changes, a follow-up falls due, a student replies on
// WhatsApp) → every live workflow listening for that starts a run for that lead → the run walks the
// steps one by one. A "Wait" step parks the run with a resume time; the worker below wakes it later.
// Nothing here ever throws into the caller: a broken automation must never break a form submission.
const mongoose = require('mongoose');
const Workflow = require('../models/Workflow');
const WorkflowRun = require('../models/WorkflowRun');
const Lead = require('../models/Lead');
const Settings = require('../models/Settings');
const Template = require('../models/Template');
const WhatsappEvent = require('../models/WhatsappEvent');

const MAX_STEPS_PER_PASS = 25;       // a sequence can't loop forever
const TICK_MS = 30 * 1000;
const RESUME_PER_TICK = 25;
const WINDOW_MS = 24 * 60 * 60 * 1000; // Meta's free-text window after a student writes to us

const digits = (v) => String(v || '').replace(/\D/g, '');
const clip = (v, n = 300) => String(v == null ? '' : v).slice(0, n);

// {{name}} / {{dreamCountry}} … filled from the lead, anything unknown becomes ''
function fillPlaceholders(text, lead = {}, context = {}) {
  return String(text || '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    const from = path.startsWith('ai.') ? context : lead;
    const value = path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), from);
    return value == null ? '' : String(value);
  });
}

function nextNodeId(workflow, nodeId, branch = '') {
  const outgoing = workflow.edges.filter((e) => e.from === nodeId);
  if (!outgoing.length) return '';
  if (branch) {
    const match = outgoing.find((e) => e.branch === branch);
    if (match) return match.to;
  }
  const plain = outgoing.find((e) => !e.branch) || outgoing[0];
  return plain.to;
}

function delayMs({ duration, unit }) {
  const n = Number(duration) || 0;
  const per = { minutes: 60e3, hours: 3600e3, days: 86400e3, seconds: 1000 };
  return n * (per[unit] || 3600e3);
}

async function lastInboundAt(lead) {
  if (!lead?.phone) return null;
  const last = await WhatsappEvent.findOne({ direction: 'in', phone: new RegExp(`${digits(lead.phone).slice(-10)}$`) })
    .sort({ at: -1 }).select('at text').lean();
  return last || null;
}

// ─── Steps ────────────────────────────────────────────────────────────────────
// Each returns { info, branch?, wait? }. Throwing marks the run failed.
const RUNNERS = {
  async trigger() {
    return { info: 'started' };
  },

  async note({ node, lead }) {
    const text = fillPlaceholders(node.config?.message || node.config?.label, lead);
    lead.activities.push({ type: 'note', comment: clip(text, 1000), performedBy: 'Automation' });
    await lead.save();
    return { info: 'note added' };
  },

  async delay({ node }) {
    const ms = delayMs(node.config || {});
    if (ms <= 0) return { info: 'no wait' };
    return { wait: new Date(Date.now() + ms), info: `waiting ${node.config?.duration} ${node.config?.unit || 'hours'}` };
  },

  async email({ node, lead, run }) {
    if (!lead.email) return { info: 'skipped: no email address' };
    if (lead.unsubscribed) return { info: 'skipped: unsubscribed' };
    const { sendEmail } = require('../utils/email');
    const subject = fillPlaceholders(node.config?.subject || 'UniCoach', lead);
    const body = fillPlaceholders(node.config?.body || node.config?.message || '', lead);
    if (!body.trim()) return { info: 'skipped: empty message' };
    await sendEmail({
      to: lead.email,
      subject,
      html: body.includes('<') ? body : `<p>${body.replace(/\n/g, '<br>')}</p>`,
      text: body.replace(/<[^>]+>/g, ''),
      kind: 'automation',
      sentBy: `Automation: ${run.workflowName || 'workflow'}`,
    });
    lead.activities.push({ type: 'email', comment: clip(`Automation email: ${subject}`, 500), performedBy: 'Automation' });
    await lead.save();
    return { info: `email sent to ${lead.email}` };
  },

  async whatsapp({ node, lead }) {
    if (lead.whatsappOptOut) return { info: 'skipped: opted out of WhatsApp' };
    if (!lead.phone) return { info: 'skipped: no phone number' };
    const templateId = node.config?.template;
    const template = templateId && mongoose.isValidObjectId(templateId)
      ? await Template.findById(templateId).lean()
      : await Template.findOne({ name: templateId }).lean();
    if (!template) return { info: 'skipped: template not found' };
    if (template.metaStatus !== 'APPROVED' || !template.wabaTemplateName) {
      throw new Error(`Template "${template.name}" is not approved by Meta yet`);
    }

    const settings = await Settings.findOne();
    if (!settings?.wabaAccessToken || !settings?.wabaPhoneNumberId) throw new Error('WhatsApp is not connected');

    const { sendComponents } = require('../utils/waTemplate');
    const { sendAndRecord } = require('../controllers/whatsappInboxController');
    const params = String(node.config?.params || '')
      .split('|').map((p) => fillPlaceholders(p.trim(), lead)).filter(Boolean);

    await sendAndRecord({
      settings,
      phone: digits(lead.phone),
      lead,
      sentBy: 'Automation',
      template: template.wabaTemplateName,
      text: '',
      payload: {
        type: 'template',
        template: {
          name: template.wabaTemplateName,
          language: { code: template.wabaLanguageCode || 'en_US' },
          components: sendComponents(template, params),
        },
      },
    });
    return { info: `WhatsApp template "${template.name}" sent` };
  },

  // AI writes the message itself, from this lead's own details.
  async ai_message({ node, lead, run }) {
    if (lead.whatsappOptOut && (node.config?.channel || 'whatsapp') === 'whatsapp') {
      return { info: 'skipped: opted out of WhatsApp' };
    }
    const { generateLeadSmartReply } = require('../utils/aiService');
    const channel = node.config?.channel || 'whatsapp';
    const reply = await generateLeadSmartReply({
      lead,
      channel,
      goal: node.config?.goal || 'book_call',
      customPrompt: fillPlaceholders(node.config?.customPrompt || '', lead, run.context),
    });
    const text = clip(reply?.message || reply?.text || '', 1500).trim();
    if (!text) return { info: 'skipped: AI returned nothing' };
    run.context = { ...run.context, aiMessage: text };

    if (channel === 'email') {
      if (!lead.email || lead.unsubscribed) return { info: 'skipped: no email / unsubscribed' };
      const { sendEmail } = require('../utils/email');
      await sendEmail({
        to: lead.email,
        subject: fillPlaceholders(node.config?.subject || 'About your study abroad plan', lead),
        html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
        text,
        kind: 'automation',
        sentBy: `Automation (AI): ${run.workflowName || 'workflow'}`,
      });
      lead.activities.push({ type: 'email', comment: clip(`AI email: ${text}`, 800), performedBy: 'Automation (AI)' });
      await lead.save();
      return { info: 'AI email sent' };
    }

    // WhatsApp free text is only allowed for 24h after the student last wrote to us.
    const inbound = await lastInboundAt(lead);
    const open = inbound?.at && (Date.now() - new Date(inbound.at).getTime() < WINDOW_MS);
    if (!open) {
      lead.activities.push({
        type: 'note',
        comment: clip(`AI drafted a WhatsApp reply but the 24h window is closed, so it was not sent:\n${text}`, 1500),
        performedBy: 'Automation (AI)',
      });
      await lead.save();
      return { info: 'saved as draft: 24h WhatsApp window closed' };
    }
    const settings = await Settings.findOne();
    if (!settings?.wabaAccessToken || !settings?.wabaPhoneNumberId) throw new Error('WhatsApp is not connected');
    const { sendAndRecord } = require('../controllers/whatsappInboxController');
    await sendAndRecord({
      settings,
      phone: digits(lead.phone),
      lead,
      sentBy: 'Automation (AI)',
      text,
      payload: { type: 'text', text: { body: text, preview_url: true } },
    });
    return { info: 'AI WhatsApp message sent' };
  },

  // AI reads the student's last reply and says what it means.
  async ai_classify({ lead, run, node }) {
    const inbound = await lastInboundAt(lead);
    const message = inbound?.text || run.context?.lastMessage || '';
    if (!message) return { info: 'skipped: no student message to read', branch: 'no' };

    const { callLLM, cleanJsonResponse } = require('../utils/aiService');
    const response = await callLLM([
      {
        role: 'system',
        content: 'You read one WhatsApp reply from a student enquiring about studying abroad. Answer with JSON only: '
          + '{"intent":"interested|wants_price|wants_call|not_now|not_interested|wrong_number|question|other",'
          + '"sentiment":"positive|neutral|negative","summary":"one short line","suggestedStatus":"contacted|qualified|interested|fifty_fifty|not_interested"}',
      },
      { role: 'user', content: `Student wrote: """${clip(message, 1200)}"""` },
    ], { jsonMode: true, maxTokens: 400, temperature: 0.1 });

    let parsed = {};
    try {
      const text = typeof response === 'string' ? response : response?.content || '';
      parsed = JSON.parse(cleanJsonResponse ? cleanJsonResponse(text) : text);
    } catch { parsed = {}; }
    const ai = {
      intent: parsed?.intent || 'other',
      sentiment: parsed?.sentiment || 'neutral',
      summary: clip(parsed?.summary || '', 300),
      suggestedStatus: parsed?.suggestedStatus || '',
    };
    run.context = { ...run.context, ai, lastMessage: clip(message, 500) };

    if (node.config?.apply !== false) {
      const tag = `ai:${ai.intent}`;
      lead.tags = lead.tags.filter((t) => !t.startsWith('ai:'));
      lead.tags.push(tag);
      if (ai.suggestedStatus && lead.status === 'new') lead.status = ai.suggestedStatus;
      lead.activities.push({ type: 'note', comment: clip(`AI read the reply: ${ai.intent} — ${ai.summary}`, 500), performedBy: 'Automation (AI)' });
      await lead.save();
    }
    const wanted = node.config?.expectIntent;
    const branch = wanted ? (ai.intent === wanted ? 'yes' : 'no') : '';
    return { info: `intent: ${ai.intent}`, branch };
  },

  async ai_score({ lead, run }) {
    const { scoreLeadAI } = require('../utils/aiService');
    const score = await scoreLeadAI({ lead });
    if (!score?.score) return { info: 'skipped: no score returned' };
    lead.aiScoring = { ...score, scoredAt: new Date() };
    await lead.save();
    run.context = { ...run.context, score: score.score, category: score.category };
    return { info: `scored ${score.score} (${score.category})` };
  },

  async pipeline({ node, lead }) {
    const stage = node.config?.stage || node.config?.status;
    if (!stage) return { info: 'skipped: no stage chosen' };
    const before = lead.status;
    lead.status = stage;
    lead.activities.push({ type: 'status_change', comment: `Automation moved ${before} → ${stage}`, performedBy: 'Automation' });
    await lead.save();
    return { info: `stage ${before} → ${stage}` };
  },

  async counselor({ node, lead }) {
    const who = node.config?.counselor;
    if (!who) return { info: 'skipped: no counselor chosen' };
    lead.assignedTo = who;
    lead.activities.push({ type: 'note', comment: `Automation assigned to ${who}`, performedBy: 'Automation' });
    await lead.save();
    return { info: `assigned to ${who}` };
  },

  async tag({ node, lead }) {
    const value = String(node.config?.tag || '').trim();
    if (!value) return { info: 'skipped: no tag' };
    if (!lead.tags.includes(value)) lead.tags.push(value);
    await lead.save();
    return { info: `tagged ${value}` };
  },

  async condition({ node, lead, run }) {
    const field = node.config?.field || 'status';
    const op = node.config?.op || 'eq';
    const expected = node.config?.value;
    const source = field.startsWith('ai.') || field === 'score' ? run.context : lead;
    const actual = field.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), source);

    let pass = false;
    const a = actual == null ? '' : actual;
    switch (op) {
      case 'ne': pass = String(a) !== String(expected); break;
      case 'gt': pass = Number(a) > Number(expected); break;
      case 'lt': pass = Number(a) < Number(expected); break;
      case 'contains': pass = Array.isArray(a) ? a.includes(expected) : String(a).toLowerCase().includes(String(expected).toLowerCase()); break;
      case 'exists': pass = Array.isArray(a) ? a.length > 0 : Boolean(a); break;
      default: pass = String(a) === String(expected);
    }
    return { info: `${field} ${op} ${expected} → ${pass ? 'yes' : 'no'}`, branch: pass ? 'yes' : 'no' };
  },

  async webhook({ node, lead, run }) {
    const url = node.config?.url;
    if (!url || !/^https?:\/\//i.test(url)) return { info: 'skipped: no valid URL' };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: run.workflowName,
          lead: { id: String(lead._id), name: lead.name, phone: lead.phone, email: lead.email, status: lead.status },
          context: run.context,
        }),
        signal: controller.signal,
      });
      return { info: `webhook ${res.status}` };
    } finally {
      clearTimeout(timer);
    }
  },
};
RUNNERS.calendar = RUNNERS.note; // old demo node type, kept so saved canvases don't break

// ─── Run walking ──────────────────────────────────────────────────────────────
async function walk(run) {
  const workflow = await Workflow.findById(run.workflow).lean();
  if (!workflow || (!workflow.active && !run.context?.testRun)) {
    run.status = 'stopped';
    run.finishedAt = new Date();
    await run.save();
    return run;
  }

  for (let i = 0; i < MAX_STEPS_PER_PASS; i += 1) {
    if (!run.nodeId) break;
    const node = workflow.nodes.find((n) => n.id === run.nodeId);
    if (!node) break;

    const lead = run.lead ? await Lead.findById(run.lead) : null;
    // A step that saves the lead must not set off more workflows, or two automations could
    // bounce a lead between stages forever.
    if (lead) lead.$locals.skipWorkflowTriggers = true;
    if (!lead) {
      run.status = 'stopped';
      run.steps.push({ nodeId: node.id, type: node.type, label: 'lead missing', ok: false });
      break;
    }

    const runner = RUNNERS[node.type];
    if (!runner) {
      run.steps.push({ nodeId: node.id, type: node.type, label: node.config?.label || node.type, ok: false, info: 'unknown step type, skipped' });
      run.nodeId = nextNodeId(workflow, node.id);
      continue;
    }

    try {
      const out = await runner({ node, lead, run, workflow }) || {};
      run.steps.push({ nodeId: node.id, type: node.type, label: node.config?.label || node.type, ok: true, info: clip(out.info, 300) });
      if (out.wait) {
        run.status = 'waiting';
        run.resumeAt = out.wait;
        run.nodeId = nextNodeId(workflow, node.id);
        await run.save();
        return run;
      }
      run.nodeId = nextNodeId(workflow, node.id, out.branch);
    } catch (err) {
      run.status = 'failed';
      run.error = clip(err.message, 300);
      run.finishedAt = new Date();
      run.steps.push({ nodeId: node.id, type: node.type, label: node.config?.label || node.type, ok: false, info: clip(err.message, 300) });
      await run.save();
      await Workflow.updateOne({ _id: workflow._id }, { $inc: { 'stats.failed': 1 }, $set: { lastError: clip(err.message, 300) } });
      return run;
    }
  }

  if (run.status === 'running') {
    run.status = 'done';
    run.finishedAt = new Date();
    await Workflow.updateOne({ _id: workflow._id }, { $inc: { 'stats.completed': 1 } });
  }
  await run.save();
  return run;
}

async function startRun(workflow, lead, { dedupeKey, context = {} } = {}) {
  const first = workflow.nodes.find((n) => n.type === 'trigger') || workflow.nodes[0];
  if (!first) return null;
  let run;
  try {
    run = await WorkflowRun.create({
      workflow: workflow._id,
      workflowName: workflow.name,
      lead: lead._id,
      leadName: lead.name,
      nodeId: first.id,
      context,
      dedupeKey: dedupeKey || undefined,
    });
  } catch (err) {
    if (err.code === 11000) return null; // already ran for this lead and reason
    throw err;
  }
  await Workflow.updateOne({ _id: workflow._id }, { $inc: { 'stats.runs': 1 }, $set: { 'stats.lastRunAt': new Date() } });
  return walk(run);
}

function triggerMatches(workflow, type, payload = {}) {
  if (workflow.trigger?.type !== type) return false;
  const cfg = workflow.trigger.config || {};
  if (type === 'lead_stage_changed' && cfg.stage && cfg.stage !== payload.stage) return false;
  if (type === 'lead_created' && cfg.source && cfg.source !== payload.source) return false;
  return true;
}

// Called from controllers. Never awaited by a request path, never throws.
async function fireTrigger(type, { lead, ...payload } = {}) {
  try {
    if (!lead?._id || mongoose.connection.readyState !== 1) return;
    const workflows = await Workflow.find({ active: true, 'trigger.type': type }).lean();
    for (const wf of workflows) {
      if (!triggerMatches(wf, type, payload)) continue;
      await startRun(wf, lead, { dedupeKey: payload.dedupeKey, context: payload.context || {} });
    }
  } catch (err) {
    console.error('[Workflows] trigger error:', err.message);
  }
}

// ─── Worker ───────────────────────────────────────────────────────────────────
async function resumeWaiting() {
  const due = await WorkflowRun.find({ status: 'waiting', resumeAt: { $lte: new Date() } })
    .sort({ resumeAt: 1 }).limit(RESUME_PER_TICK);
  for (const run of due) {
    run.status = 'running';
    await run.save();
    await walk(run);
  }
}

async function fireScheduledTriggers() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const followUpFlows = await Workflow.find({ active: true, 'trigger.type': 'followup_due' }).lean();
  if (followUpFlows.length) {
    const leads = await Lead.find({ nextFollowUpDate: { $lte: now }, unsubscribed: { $ne: true } }).limit(100);
    for (const lead of leads) {
      for (const wf of followUpFlows) await startRun(wf, lead, { dedupeKey: `followup:${today}` });
    }
  }

  const quietFlows = await Workflow.find({ active: true, 'trigger.type': 'no_reply' }).lean();
  for (const wf of quietFlows) {
    const days = Number(wf.trigger?.config?.days) || 3;
    const cutoff = new Date(now - days * 86400e3);
    const leads = await Lead.find({
      status: { $in: wf.trigger?.config?.statuses?.length ? wf.trigger.config.statuses : ['new', 'contacted'] },
      updatedAt: { $lte: cutoff },
      unsubscribed: { $ne: true },
    }).limit(100);
    for (const lead of leads) await startRun(wf, lead, { dedupeKey: `noreply:${days}d` });
  }
}

let busy = false;
async function tick() {
  if (busy || mongoose.connection.readyState !== 1) return;
  busy = true;
  try {
    await resumeWaiting();
    await fireScheduledTriggers();
  } catch (err) {
    console.error('[Workflows] worker error:', err.message);
  } finally {
    busy = false;
  }
}

let timer = null;
function startWorker() {
  if (timer || process.env.DISABLE_WORKFLOW_WORKER === 'true') return;
  timer = setInterval(tick, TICK_MS);
  if (timer.unref) timer.unref();
  console.log('[Workflows] worker started');
}
function stopWorker() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { fireTrigger, startRun, walk, tick, startWorker, stopWorker, RUNNERS, fillPlaceholders, nextNodeId };

// WhatsApp chatbot: runs the flows drawn in the admin flow builder.
//
// A student's message either (1) presses a button / list row the bot sent earlier, so we follow that
// branch, (2) matches a flow's keywords ("hi", "hello"), so that flow starts, or (3) matches nothing,
// so the default flow runs (at most once a day per person). Messages, media, links and contact cards
// are sent one after another; a buttons or list step sends and then waits for the press.
// "Talk to an agent" stops the bot for that person for 24 hours and flags the chat in the Inbox.
const ChatFlow = require('../models/ChatFlow');
const WhatsappContact = require('../models/WhatsappContact');
const Settings = require('../models/Settings');
const { sendAndRecord } = require('../controllers/whatsappInboxController');

const MAX_STEPS = 12;
const STEP_GAP_MS = 700; // keeps messages in order on the student's phone
const PAUSE_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EVERY_MS = 24 * 60 * 60 * 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clip = (s, n) => String(s || '').trim().slice(0, n);
const norm = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const buttonId = (flowId, nodeId, handle) => `f:${flowId}:${nodeId}:${handle}`;

const mediaObject = (d) => {
  let link = clip(d.mediaUrl, 1000);
  if (!link) return null;
  // Files kept on our own server come back as /uploads/…; WhatsApp needs the full https address
  if (link.startsWith('/')) link = `${(process.env.API_PUBLIC_URL || 'https://api.unicoach.com').replace(/\/+$/, '')}${link}`;
  const kind = ['image', 'video', 'document'].includes(d.mediaType) ? d.mediaType : 'image';
  return { kind, link, filename: kind === 'document' ? clip(d.fileName || 'document.pdf', 200) : undefined };
};

const headerFor = (d) => {
  const m = mediaObject(d);
  if (m) return { type: m.kind, [m.kind]: { link: m.link, ...(m.filename ? { filename: m.filename } : {}) } };
  if (d.header) return { type: 'text', text: clip(d.header, 60) };
  return undefined;
};

/** Cloud API payload for one node, plus a short text for the Inbox */
function payloadFor(flow, node) {
  const d = node.data || {};
  const body = clip(d.text, 1024);
  switch (node.type) {
    case 'text':
      if (!body) return null;
      return { payload: { type: 'text', text: { body, preview_url: true } }, summary: body };
    case 'media': {
      const m = mediaObject(d);
      if (!m) return null;
      const caption = clip(d.text, 1024);
      return {
        payload: { type: m.kind, [m.kind]: { link: m.link, ...(caption && m.kind !== 'audio' ? { caption } : {}), ...(m.filename ? { filename: m.filename } : {}) } },
        summary: `[${m.kind}] ${caption}`.trim(),
      };
    }
    case 'buttons': {
      const buttons = (d.buttons || []).filter((b) => b && b.label).slice(0, 3);
      if (!body || !buttons.length) return null;
      return {
        payload: {
          type: 'interactive',
          interactive: {
            type: 'button',
            ...(headerFor(d) ? { header: headerFor(d) } : {}),
            body: { text: body },
            ...(d.footer ? { footer: { text: clip(d.footer, 60) } } : {}),
            action: { buttons: buttons.map((b) => ({ type: 'reply', reply: { id: buttonId(flow._id, node.id, b.id), title: clip(b.label, 20) } })) },
          },
        },
        summary: `${body}\n${buttons.map((b) => `[${b.label}]`).join(' ')}`,
        waits: true,
      };
    }
    case 'list': {
      const rows = (d.rows || []).filter((r) => r && r.label).slice(0, 10);
      if (!body || !rows.length) return null;
      return {
        payload: {
          type: 'interactive',
          interactive: {
            type: 'list',
            ...(d.header ? { header: { type: 'text', text: clip(d.header, 60) } } : {}),
            body: { text: body },
            ...(d.footer ? { footer: { text: clip(d.footer, 60) } } : {}),
            action: {
              button: clip(d.buttonLabel || 'Choose', 20),
              sections: [{ title: clip(d.sectionTitle || 'Options', 24), rows: rows.map((r) => ({ id: buttonId(flow._id, node.id, r.id), title: clip(r.label, 24), ...(r.description ? { description: clip(r.description, 72) } : {}) })) }],
            },
          },
        },
        summary: `${body}\n${rows.map((r) => `• ${r.label}`).join('\n')}`,
        waits: true,
      };
    }
    case 'link': {
      const url = clip(d.url, 2000);
      if (!body || !/^https:\/\//i.test(url)) return null;
      return {
        payload: {
          type: 'interactive',
          interactive: {
            type: 'cta_url',
            ...(headerFor(d) ? { header: headerFor(d) } : {}),
            body: { text: body },
            action: { name: 'cta_url', parameters: { display_text: clip(d.buttonLabel || 'Open', 20), url } },
          },
        },
        summary: `${body}\n[${d.buttonLabel || 'Open'}] ${url}`,
      };
    }
    case 'contact': {
      const phone = String(d.phone || '').replace(/[^\d+]/g, '');
      if (!phone) return null;
      const name = clip(d.contactName || 'UniCoach', 100);
      return {
        payload: { type: 'contacts', contacts: [{ name: { formatted_name: name, first_name: name }, phones: [{ phone, type: 'WORK' }] }] },
        summary: `[contact] ${name} ${phone}`,
      };
    }
    case 'handoff':
      return { payload: { type: 'text', text: { body: body || 'Thanks! Someone from our team will reply here soon.' } }, summary: body || 'Handed to the team', handoff: true };
    default:
      return null;
  }
}

const nextNodeId = (flow, nodeId, handle) => {
  const edge = (flow.edges || []).find((e) => e.source === nodeId && (handle ? e.sourceHandle === handle : true));
  return edge?.target || null;
};

async function runFrom(flow, startNodeId, ctx) {
  let nodeId = startNodeId;
  for (let step = 0; nodeId && step < MAX_STEPS; step += 1) {
    const node = (flow.nodes || []).find((n) => n.id === nodeId);
    if (!node) return;
    const built = payloadFor(flow, node);
    if (built) {
      if (step > 0) await sleep(STEP_GAP_MS);
      await sendAndRecord({ settings: ctx.settings, phone: ctx.phone, lead: ctx.lead, sentBy: `Bot: ${flow.name}`, text: built.summary, payload: built.payload });
    }
    if (built?.handoff) {
      await WhatsappContact.updateOne({ phone: ctx.phone }, { $set: { needsAgent: true, needsAgentAt: new Date(), botPausedUntil: new Date(Date.now() + PAUSE_MS), waitingNode: null } });
      return;
    }
    if (built?.waits) {
      await WhatsappContact.updateOne({ phone: ctx.phone }, { $set: { flow: flow._id, waitingNode: node.id } });
      return;
    }
    nodeId = nextNodeId(flow, node.id);
  }
  await WhatsappContact.updateOne({ phone: ctx.phone }, { $set: { waitingNode: null } });
}

const startNodeOf = (flow) => (flow.nodes || []).find((n) => n.type === 'start');

async function startFlow(flow, ctx) {
  const start = startNodeOf(flow);
  const first = start && nextNodeId(flow, start.id);
  if (!first) return false;
  await ChatFlow.updateOne({ _id: flow._id }, { $inc: { runs: 1 } });
  await runFrom(flow, first, ctx);
  return true;
}

/**
 * Called by the webhook for every message a student sends.
 * `replyId` is the id of the button / list row they pressed, if any.
 */
async function handleInbound({ phone, name, text, replyId, lead }) {
  const settings = await Settings.findOne();
  if (!settings?.wabaAccessToken || !settings?.wabaPhoneNumberId) return;
  const contact = await WhatsappContact.findOneAndUpdate(
    { phone },
    { $set: { ...(name ? { name } : {}) } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  // A person is handling this chat
  if (contact.botPausedUntil && contact.botPausedUntil > new Date()) return;
  const ctx = { settings, phone, lead };

  // 1. A button or list row from one of our flows
  const m = /^f:([a-f0-9]{24}):([^:]+):(.+)$/.exec(replyId || '');
  if (m) {
    const flow = await ChatFlow.findOne({ _id: m[1], active: true }).lean();
    if (flow) {
      const target = nextNodeId(flow, m[2], m[3]);
      if (target) await runFrom(flow, target, ctx);
      return;
    }
  }

  // 2. Keywords
  const said = norm(text);
  if (said) {
    const flows = await ChatFlow.find({ active: true, keywords: { $exists: true, $ne: [] } }).lean();
    const hit = flows.find((f) => (f.keywords || []).some((k) => {
      const kw = norm(k);
      if (!kw) return false;
      return f.matchType === 'contains' ? ` ${said} `.includes(` ${kw} `) : said === kw;
    }));
    if (hit) {
      await startFlow(hit, ctx);
      return;
    }
  }

  // 3. Default reply, once a day per person, and not while they are mid-flow
  if (contact.waitingNode) return;
  if (contact.lastDefaultAt && Date.now() - contact.lastDefaultAt.getTime() < DEFAULT_EVERY_MS) return;
  const fallback = await ChatFlow.findOne({ active: true, isDefault: true }).lean();
  if (fallback) {
    await WhatsappContact.updateOne({ phone }, { $set: { lastDefaultAt: new Date() } });
    await startFlow(fallback, ctx);
  }
}

/** Checks a flow before it can be switched on; returns a list of problems in plain words */
function validateFlow(flow) {
  const problems = [];
  const nodes = flow.nodes || [];
  const start = nodes.find((n) => n.type === 'start');
  if (!start) problems.push('Add a Flow Start step.');
  else if (!(flow.edges || []).some((e) => e.source === start.id)) problems.push('Connect Flow Start to the first message.');
  if (!flow.isDefault && !(flow.keywords || []).length) problems.push('Add at least one keyword on Flow Start (e.g. hi), or make this the default reply.');
  for (const n of nodes) {
    if (n.type === 'start') continue;
    const label = n.data?.title || n.type;
    if (!payloadFor({ _id: flow._id || '000000000000000000000000' }, n)) {
      if (n.type === 'link') problems.push(`"${label}": needs text and an https:// link.`);
      else if (n.type === 'media') problems.push(`"${label}": add an image, video or PDF.`);
      else if (n.type === 'buttons') problems.push(`"${label}": needs text and at least one button.`);
      else if (n.type === 'list') problems.push(`"${label}": needs text and at least one option.`);
      else if (n.type === 'contact') problems.push(`"${label}": add a phone number.`);
      else if (n.type !== 'handoff') problems.push(`"${label}": add a message.`);
    }
  }
  return problems;
}

module.exports = { handleInbound, validateFlow, payloadFor };

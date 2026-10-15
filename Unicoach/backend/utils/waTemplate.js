// Building WhatsApp template messages: what Meta needs when we submit a template for review, and the
// "components" that go with each send (body variables, plus the header image / video / PDF link).
const API_PUBLIC_URL = () => (process.env.API_PUBLIC_URL || 'https://api.unicoach.com').replace(/\/+$/, '');
const absoluteUrl = (u) => (u && u.startsWith('/') ? `${API_PUBLIC_URL()}${u}` : u);

const MEDIA_FORMATS = { image: 'IMAGE', video: 'VIDEO', document: 'DOCUMENT' };

/** Components to attach when sending an approved template */
function sendComponents(template, bodyParams = []) {
  const components = [];
  const kind = template.headerType;
  if (MEDIA_FORMATS[kind] && template.headerMediaUrl) {
    components.push({ type: 'header', parameters: [{ type: kind, [kind]: { link: absoluteUrl(template.headerMediaUrl) } }] });
  }
  if (bodyParams.length) components.push({ type: 'body', parameters: bodyParams.map((p) => ({ type: 'text', text: String(p || '-') })) });
  return components;
}

/**
 * Meta wants an example of a media header as an "upload handle": we fetch the file and push it
 * through Meta's resumable upload for our app, then pass the handle with the template.
 */
async function uploadHeaderExample({ url, appId, token }) {
  const fileRes = await fetch(absoluteUrl(url));
  if (!fileRes.ok) throw new Error('Could not read the header file');
  const buf = Buffer.from(await fileRes.arrayBuffer());
  if (buf.length > 16 * 1024 * 1024) throw new Error('Header file is too big (16 MB max)');
  const type = (fileRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
  const start = await fetch(`https://graph.facebook.com/v20.0/${appId}/uploads?file_length=${buf.length}&file_type=${encodeURIComponent(type)}&access_token=${encodeURIComponent(token)}`, { method: 'POST' });
  const s = await start.json().catch(() => ({}));
  if (!start.ok || !s.id) throw new Error(s?.error?.message || 'Meta upload could not start');
  const up = await fetch(`https://graph.facebook.com/v20.0/${s.id}`, {
    method: 'POST',
    headers: { Authorization: `OAuth ${token}`, file_offset: '0' },
    body: buf,
  });
  const u = await up.json().catch(() => ({}));
  if (!up.ok || !u.h) throw new Error(u?.error?.message || 'Meta upload failed');
  return u.h;
}

/** Components for submitting a template (header / body / footer / buttons) */
async function reviewComponents(template, bodyComponent, { appId, token }) {
  const out = [];
  if (template.headerType === 'text' && template.headerText) {
    if (/\{/.test(template.headerText)) throw new Error('Keep the header text without variables');
    out.push({ type: 'HEADER', format: 'TEXT', text: String(template.headerText).slice(0, 60) });
  } else if (MEDIA_FORMATS[template.headerType]) {
    if (!template.headerMediaUrl) throw new Error('Upload the header image / video / PDF first');
    if (!appId) throw new Error('Add the Meta App ID in Settings (needed for media headers)');
    const handle = await uploadHeaderExample({ url: template.headerMediaUrl, appId, token });
    out.push({ type: 'HEADER', format: MEDIA_FORMATS[template.headerType], example: { header_handle: [handle] } });
  }
  out.push(bodyComponent);
  if (template.footer) out.push({ type: 'FOOTER', text: String(template.footer).slice(0, 60) });
  const buttons = (template.buttons || []).filter((b) => b && b.text).slice(0, 10).map((b) => {
    const text = String(b.text).slice(0, 25);
    if (b.type === 'URL') {
      if (!/^https:\/\//i.test(b.url || '')) throw new Error(`Button "${text}": link must start with https://`);
      return { type: 'URL', text, url: b.url };
    }
    if (b.type === 'PHONE_NUMBER') {
      const phone = String(b.phone || '').replace(/[^\d+]/g, '');
      if (phone.replace(/\D/g, '').length < 10) throw new Error(`Button "${text}": add the phone number with country code`);
      return { type: 'PHONE_NUMBER', text, phone_number: phone.startsWith('+') ? phone : `+${phone}` };
    }
    return { type: 'QUICK_REPLY', text };
  });
  if (buttons.length) out.push({ type: 'BUTTONS', buttons });
  return out;
}

module.exports = { sendComponents, reviewComponents, absoluteUrl };

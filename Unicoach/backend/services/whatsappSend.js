/**
 * Send one approved WhatsApp template message.
 *
 * WhatsApp only lets a business start a conversation with a template Meta has approved, so this
 * refuses anything that is not APPROVED rather than firing a request Meta will reject.
 *
 * Everything that sends WhatsApp outside the admin's own bulk screens should go through here, so
 * the opt-out check, the phone formatting and the inbox record stay in one place.
 */

const GRAPH = 'https://graph.facebook.com/v20.0';

/**
 * Phone numbers reach us typed by hand: "8221056537", "+353 899588550", "091-98765 43210".
 * Meta wants digits only, with the country code. A bare 10-digit number is Indian.
 * Returns '' when there is nothing usable, so callers can skip instead of sending nowhere.
 */
const toWhatsappNumber = (raw) => {
  const hadPlus = String(raw || '').trim().startsWith('+');
  let digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';

  if (!hadPlus) {
    // 0 then the number, as people write local numbers
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    // a plain Indian mobile
    if (digits.length === 10) digits = `91${digits}`;
    // "0091..." written out
    if (digits.startsWith('00')) digits = digits.slice(2);
  }

  // Shorter than this is not a dialable international number
  return digits.length >= 10 && digits.length <= 15 ? digits : '';
};

/**
 * @param {Object} opts
 * @param {string} opts.templateName  template.name in our database (not Meta's slug)
 * @param {string} opts.to            phone in any format
 * @param {Object} opts.values        { variableName: 'value' } for the template's variables
 * @param {Object} [opts.meta]        { bookingRef, audience } recorded on the inbox entry
 * @returns {Promise<{sent: boolean, skipped?: string, error?: string, waMessageId?: string}>}
 *          Never throws: a reminder that cannot be sent must not break the run that sends the rest.
 */
async function sendTemplateMessage({ templateName, to, values = {}, meta = {} }) {
  try {
    const Template = require('../models/Template');
    const Settings = require('../models/Settings');

    const phone = toWhatsappNumber(to);
    if (!phone) return { sent: false, skipped: 'no usable phone number' };

    const [template, settings] = await Promise.all([
      Template.findOne({ name: templateName, type: 'whatsapp' }).lean(),
      Settings.findOne().lean(),
    ]);

    if (!template) return { sent: false, skipped: `template "${templateName}" not found` };
    if (!template.wabaTemplateName || template.metaStatus !== 'APPROVED') {
      return { sent: false, skipped: `template "${templateName}" is not approved by Meta yet` };
    }
    if (!settings?.wabaAccessToken || !settings?.wabaPhoneNumberId) {
      return { sent: false, skipped: 'WhatsApp is not connected in Settings' };
    }

    // Someone who replied STOP never hears from us again. The flag sits on their Lead, matched the
    // same way the webhook matches an incoming reply: on the last 10 digits.
    const tail = phone.slice(-10);
    if (tail.length === 10) {
      const lead = await require('../models/Lead')
        .findOne({ phone: { $regex: `${tail}$` }, whatsappOptOut: true })
        .select('_id').lean().catch(() => null);
      if (lead) return { sent: false, skipped: 'replied STOP' };
    }

    // The template stores its variables in the order Meta expects them
    const keys = String(template.wabaParameters || '').split(',').map((k) => k.trim()).filter(Boolean);
    const params = keys.map((k) => String(values[k] ?? ''));

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'template',
      template: {
        name: template.wabaTemplateName,
        language: { code: template.wabaLanguageCode || 'en_US' },
        components: require('../utils/waTemplate').sendComponents(template, params),
      },
    };

    const res = await fetch(`${GRAPH}/${settings.wabaPhoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${settings.wabaAccessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { sent: false, error: data?.error?.message || `Meta API error ${res.status}` };
    }

    const waMessageId = data?.messages?.[0]?.id;

    // Show it in the WhatsApp Inbox, so a reply lands in the same conversation
    await require('../models/WhatsappEvent').create({
      kind: 'message',
      direction: 'out',
      waMessageId,
      phone,
      name: meta.name || '',
      template: template.name,
      text: params.join(' · '),
      sentBy: meta.sentBy || 'session reminder',
      status: 'sent',
    }).catch(() => { /* the message went out; the inbox copy is not worth failing for */ });

    return { sent: true, waMessageId };
  } catch (err) {
    return { sent: false, error: err.message };
  }
}

module.exports = { sendTemplateMessage, toWhatsappNumber, GRAPH };

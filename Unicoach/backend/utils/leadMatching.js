const { normalizePhone } = require('./twilio');

function phoneVariants(rawPhone) {
  const variants = new Set();
  const digitsOnly = String(rawPhone || '').replace(/\D/g, '');
  const normalized = normalizePhone(rawPhone);

  if (normalized) variants.add(normalized);
  if (digitsOnly) {
    const last10 = digitsOnly.slice(-10);
    variants.add(digitsOnly);
    variants.add(last10);
    variants.add(`+${digitsOnly}`);
    variants.add(`+91${last10}`);
    variants.add(`91${last10}`);
    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      variants.add(digitsOnly.slice(2));
      variants.add(`+91${digitsOnly.slice(2)}`);
    }
  }

  if (normalized && normalized.startsWith('+91')) {
    const local = normalized.slice(3);
    variants.add(local);
    variants.add(`+${local}`);
    variants.add(`91${local}`);
  }

  return [...variants].filter(Boolean);
}

function buildLeadMatchQuery(phone, email) {
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const conditions = [];

  const phones = phoneVariants(phone);
  if (phones.length) conditions.push({ phone: { $in: phones } });
  if (cleanEmail.includes('@')) conditions.push({ email: cleanEmail });

  return conditions.length ? { $or: conditions } : {};
}

function leadMatchQuery({ phone, email }) {
  return buildLeadMatchQuery(phone, email);
}

async function findLeadByContact(LeadModel, { phone, email }) {
  const exactQuery = buildLeadMatchQuery(phone, email);
  if (Object.keys(exactQuery).length === 0) return null;
  return LeadModel.findOne(exactQuery);
}

async function findLeadsByContact(LeadModel, { phone, email }) {
  const query = buildLeadMatchQuery(phone, email);
  if (Object.keys(query).length === 0) return [];
  const result = LeadModel.find(query);
  if (Array.isArray(result)) return result;
  return result.lean ? result.lean() : result;
}

async function linkLeadToDuplicates(LeadModel, lead, matches) {
  const existing = (matches || []).filter((match) => String(match._id) !== String(lead._id));
  if (!existing.length) return;

  const oldest = existing
    .slice()
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))[0];
  const groupId = oldest.duplicateGroupId || oldest._id;

  lead.duplicateGroupId = groupId;
  if (typeof LeadModel.updateMany === 'function') {
    await LeadModel.updateMany(
      { _id: { $in: existing.map((match) => match._id) } },
      { $set: { duplicateGroupId: groupId } }
    );
  }
}

module.exports = {
  phoneVariants,
  buildLeadMatchQuery,
  leadMatchQuery,
  findLeadByContact,
  findLeadsByContact,
  linkLeadToDuplicates,
};

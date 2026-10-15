// Turns the campaign audience filters from the admin panel into a Lead query.
// Filters inside one group are OR (any of these countries); groups are AND (country AND status).
const clean = (list) => (Array.isArray(list) ? list.map((v) => String(v).trim()).filter(Boolean).slice(0, 50) : []);

function buildAudienceQuery(audience = {}, { forEmail = false } = {}) {
  const and = [];
  const statuses = clean(audience.statuses);
  if (statuses.length) and.push({ status: { $in: statuses } });
  const counselors = clean(audience.counselors);
  if (counselors.length) and.push({ assignedTo: { $in: counselors } });
  const anyTags = clean(audience.tagsAny);
  if (anyTags.length) and.push({ $or: [{ tags: { $in: anyTags } }, { autoTags: { $in: anyTags } }] });
  clean(audience.tagsAll).forEach((tag) => and.push({ $or: [{ tags: tag }, { autoTags: tag }] }));
  const without = clean(audience.tagsNone);
  if (without.length) and.push({ tags: { $nin: without } }, { autoTags: { $nin: without } });
  const countries = clean(audience.countries);
  if (countries.length) and.push({ dreamCountry: { $in: countries } });
  const followUps = clean(audience.followUps);
  if (followUps.length) and.push({ followUp: { $in: followUps } });
  if (audience.verifiedOnly) and.push({ verified: true });
  // People who unsubscribed never get promotional emails
  if (forEmail) and.push({ unsubscribed: { $ne: true } });
  return and.length ? { $and: and } : {};
}

module.exports = { buildAudienceQuery };

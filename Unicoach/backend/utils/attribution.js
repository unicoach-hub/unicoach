const { z } = require('zod');

/**
 * Ad attribution sent by the website (frontend/src/utils/adTracking.js) with lead and signup requests:
 * where the visitor came from (utm_*, gclid, fbclid, …), Meta cookies and an event id shared with the
 * browser pixel so Meta counts the browser + Conversions API copy of an event once.
 */

const str = (max) => z.string().trim().max(max).optional();

const touchSchema = z.object({
  utm_source: str(300),
  utm_medium: str(300),
  utm_campaign: str(300),
  utm_term: str(300),
  utm_content: str(300),
  gclid: str(300),
  gbraid: str(300),
  wbraid: str(300),
  fbclid: str(300),
  landingPage: str(500),
  referrer: str(500),
  capturedAt: str(40)
}).strip();

const attributionSchema = z.object({
  firstTouch: touchSchema.optional(),
  lastTouch: touchSchema.optional(),
  fbp: str(200),
  fbc: str(400),
  pageUrl: str(500),
  eventId: str(100)
}).strip();

/** Zod field to add to request schemas; bad attribution never fails the request, it is just dropped. */
const attributionField = attributionSchema.optional().catch(undefined);

/** Validated attribution from a request body (for routes without Zod validation). */
const readAttribution = (body) => {
  const parsed = attributionSchema.safeParse(body?.attribution);
  return parsed.success ? parsed.data : undefined;
};

const toTouch = (touch) => {
  if (!touch || !Object.keys(touch).length) return undefined;
  const { capturedAt, ...rest } = touch;
  const date = capturedAt ? new Date(capturedAt) : null;
  return { ...rest, capturedAt: date && !Number.isNaN(date.getTime()) ? date : new Date() };
};

/** Stores attribution on a Lead document: first touch is kept once set, last touch is refreshed. */
const applyAttributionToLead = (lead, attribution) => {
  if (!lead || !attribution) return;
  const firstTouch = toTouch(attribution.firstTouch);
  const lastTouch = toTouch(attribution.lastTouch);
  if (!firstTouch && !lastTouch) return;
  const current = lead.attribution || {};
  lead.attribution = {
    firstTouch: current.firstTouch?.capturedAt ? current.firstTouch : (firstTouch || lastTouch),
    lastTouch: lastTouch || current.lastTouch || firstTouch
  };
};

module.exports = { attributionField, readAttribution, applyAttributionToLead };

const Lead = require('../models/Lead');
const { normalizePhone } = require('../utils/twilio');
const { findLeadsByContact, linkLeadToDuplicates } = require('../utils/leadMatching');
const { readAttribution, applyAttributionToLead } = require('../utils/attribution');
const { sendMetaEvent } = require('../services/metaConversions');

// Service-page forms → the matching Admin → Support Requests category pill
const SUPPORT_CATEGORY_BY_SOURCE = {
  'Education Loan Enquiry': 'Education Loan Assistance',
  'Visa & Pre-Departure Enquiry': 'Visa Counseling',
};

/**
 * POST /api/leads/submit
 * Submit eligibility / consultation form. No OTP: the lead is saved straight away and no SMS is sent.
 * `verified` now means "the student left complete contact details through a site form" (the same
 * meaning /book-consultation and event registrations already use), so the admin "Verified" counts
 * keep counting real, contactable enquiries. It never signs anyone in.
 */
exports.submitLead = async (req, res) => {
  try {
    const { dreamCountry, preferredIntake, highestEducation, currentCity, name, email, phone, source, university } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const matchingLeads = await findLeadsByContact(Lead, { phone: normalizedPhone, email: cleanEmail });
    const isRepeat = matchingLeads.length > 0;

    // Extract university name from explicit parameter or from source string (e.g. "University Card: Oxford")
    const uniName = university || (source && source.includes(':') ? source.split(':')[1].trim() : null);
    const sourceDesc = String(source || 'Check Eligibility Modal').slice(0, 80);
    const lead = new Lead({
      dreamCountry: dreamCountry || 'Undecided',
      preferredIntake: preferredIntake || '2026',
      highestEducation: highestEducation || 'Not specified',
      currentCity: currentCity || 'Not specified',
      name,
      email: cleanEmail,
      phone: normalizedPhone,
      source: sourceDesc,
      latestSource: sourceDesc,
      totalInquiries: 1,
      lastInquiryAt: new Date(),
      verified: true,
      status: 'new',
      activities: [{
        type: 'note',
        comment: `${isRepeat ? 'Repeat' : 'First'} inquiry via ${sourceDesc}${uniName ? ` for ${uniName}` : ''}`,
        date: new Date(),
        performedBy: 'System'
      }],
      interestedUniversities: uniName ? [{
        name: uniName,
        country: dreamCountry || 'Undecided',
        source: sourceDesc,
        date: new Date()
      }] : []
    });
    await linkLeadToDuplicates(Lead, lead, matchingLeads);
    applyAttributionToLead(lead, req.body.attribution);
    await lead.save();

    sendMetaEvent({
      eventName: 'Lead',
      eventId: req.body.attribution?.eventId,
      user: { email: cleanEmail, phone: normalizedPhone, name, externalId: lead._id },
      req,
      attribution: req.body.attribution,
      customData: { content_name: lead.latestSource || lead.source }
    });

    return res.status(200).json({
      success: true,
      message: isRepeat ? 'Enquiry received as a new linked lead.' : 'Enquiry received.',
      leadId: lead._id,
      isRepeat
    });
  } catch (err) {
    console.error('Submit lead error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/leads/book-consultation
 * Direct consultation booking from website (Contact Page & Popups)
 * Saves directly into MongoDB CRM with AI lead scoring
 */
exports.bookConsultation = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      destination, 
      intake, 
      university, 
      query,
      source: rawSource
    } = req.body;
    // Public endpoint: the form name is shown in admin, so keep it short and a plain string
    const source = (typeof rawSource === 'string' && rawSource.trim().slice(0, 80)) || 'Website Booking Form';

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone number are required.' });
    }

    const normalizedPhone = normalizePhone(phone);
    const cleanEmail = email.trim().toLowerCase();

    const matchingLeads = await findLeadsByContact(Lead, { phone: normalizedPhone, email: cleanEmail });
    const isRepeat = matchingLeads.length > 0;
    const hasTargetUni = university && university.trim() !== 'None' && university.trim() !== 'Not specified';
    const lead = new Lead({
      name: name.trim(),
      email: cleanEmail,
      phone: normalizedPhone,
      dreamCountry: destination || 'Undecided',
      preferredIntake: intake || '2026',
      highestEducation: 'Not specified',
      currentCity: 'Not specified',
      source,
      latestSource: source,
      verified: true,
      status: 'new',
      totalInquiries: 1,
      lastInquiryAt: new Date(),
      notes: `Target University: ${university || 'Not specified'}\nStudent Query: ${query || 'None'}`,
      activities: [{
        type: 'note',
        comment: `Booked consultation via ${source}`,
        date: new Date(),
        performedBy: 'System'
      }],
      interestedUniversities: hasTargetUni ? [{
        name: university.trim(),
        country: destination || 'Undecided',
        course: query || '',
        source,
        date: new Date()
      }] : []
    });
    await linkLeadToDuplicates(Lead, lead, matchingLeads);

    try {
      const { scoreLeadAI } = require('../utils/aiService');
      const aiScore = await scoreLeadAI(lead);
      if (aiScore && aiScore.score) {
        lead.aiScoring = aiScore;
      }
    } catch (aiErr) {
      console.warn('AI lead scoring skipped for direct booking:', aiErr.message);
    }

    const attribution = readAttribution(req.body);
    applyAttributionToLead(lead, attribution);
    await lead.save();

    sendMetaEvent({
      eventName: 'Lead',
      eventId: attribution?.eventId,
      user: { email: cleanEmail, phone: normalizedPhone, name, externalId: lead._id },
      req,
      attribution,
      customData: { content_name: source }
    });

    // ── Also sync to SupportRequest so it appears in Admin -> Support Requests (/requests) ──
    try {
      const SupportRequest = require('../models/SupportRequest');
      // Service pages send "Label: value | Label: value"; one per line reads better for the counsellor
      const queryLines = String(query || 'None').split(' | ').join('\n');
      await SupportRequest.create({
        name: name.trim(),
        email: cleanEmail,
        phone: normalizedPhone,
        category: SUPPORT_CATEGORY_BY_SOURCE[source] || 'Consultation Booking',
        message: `Form: ${source}${isRepeat ? ' (linked repeat enquiry)' : ''}\nTarget University: ${university || 'Not specified'}\nPreferred Intake: ${intake || 'Not specified'}\nDestination: ${destination || 'Not specified'}\n${queryLines}`,
        status: 'New',
        isBooked: true
      });
    } catch (srErr) {
      console.warn('Auto-sync to SupportRequest skipped/failed:', srErr.message);
    }

    return res.status(201).json({
      success: true,
      message: isRepeat
        ? 'Consultation request booked as a new linked lead.'
        : 'Consultation request booked and logged into CRM successfully.',
      leadId: lead._id,
      isRepeat
    });
  } catch (err) {
    console.error('Book consultation error:', err);
    return res.status(500).json({ error: 'Failed to book consultation' });
  }
};

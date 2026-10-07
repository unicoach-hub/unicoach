const { sendEmail } = require('../../utils/email');

/**
 * Sends a clean, branded email to the student with session date/time and Google Meet/Zoom link.
 */
async function sendBookingConfirmationEmail(booking, mentor, service) {
  try {
    if (!booking || !booking.studentEmail) {
      console.warn('[NotificationService] No student email found on booking object.');
      return { success: false, error: 'No student email available.' };
    }

    const studentName = booking.studentName || 'Student';
    const mentorName = mentor?.name || booking.mentorId?.name || 'Your Mentor';
    const serviceTitle = service?.title || booking.serviceId?.title || '1:1 Mentorship Session';
    const joinUrl = booking.meeting?.joinUrl || '';
    const platform = booking.meeting?.platform || 'Google Meet';

    // Format readable datetime in IST
    let formattedDate = 'Scheduled Session';
    if (booking.startUtc) {
      try {
        formattedDate = new Date(booking.startUtc).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) + ' IST';
      } catch (e) {
        formattedDate = new Date(booking.startUtc).toUTCString();
      }
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Session Confirmed: ${serviceTitle}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-collapse: collapse; }
        a { text-decoration: none; }
      </style>
    </head>
    <body style="background-color: #f8fafc; padding: 32px 16px; margin: 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.06);">
              
              <!-- Brand Header Bar -->
              <tr>
                <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="left">
                        <div style="font-size: 21px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                          UniCoach<span style="color: #4f46e5;">.</span>
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 0.6px; text-transform: uppercase; margin-top: 2px;">
                          Global Mentorship &amp; Advisory
                        </div>
                      </td>
                      <td align="right">
                        <span style="display: inline-block; background-color: #f5f3ff; color: #6d28d9; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px; border: 1px solid #ddd6fe;">
                          ● Session Confirmed
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Hero Heading -->
              <tr>
                <td style="padding: 32px 32px 20px;">
                  <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1.3;">
                    Your 1:1 Advisory Call is Booked
                  </h1>
                  <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
                    Hi <strong>${studentName}</strong>, your mentorship session with <strong>${mentorName}</strong> has been successfully scheduled. Here are your meeting access details.
                  </p>
                </td>
              </tr>

              <!-- Details Ledger Box -->
              <tr>
                <td style="padding: 0 32px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
                    <tr>
                      <td colspan="2" style="padding: 14px 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #475569;">
                          Session Information
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9; width: 38%;">Service</td>
                      <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${serviceTitle}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Mentor</td>
                      <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${mentorName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Date &amp; Time</td>
                      <td style="padding: 12px 20px; font-size: 14px; font-weight: 700; color: #4f46e5; border-bottom: 1px solid #f1f5f9; text-align: right;">${formattedDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Platform</td>
                      <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${platform}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b;">Booking Ref</td>
                      <td style="padding: 12px 20px; text-align: right;">
                        <code style="background-color: #ffffff; padding: 4px 8px; border-radius: 6px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12.5px; color: #334155; border: 1px solid #cbd5e1;">${booking.bookingRef}</code>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Primary Action CTA -->
              <tr>
                <td style="padding: 0 32px 28px; text-align: center;">
                  ${joinUrl ? `
                  <a href="${joinUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 6px 20px rgba(79, 70, 229, 0.28); letter-spacing: 0.2px;">
                    👉 Join Video Meeting
                  </a>
                  <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">
                    Direct link: <a href="${joinUrl}" style="color: #4f46e5; text-decoration: underline; word-break: break-all;">${joinUrl}</a>
                  </p>
                  ` : `
                  <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 20px; font-size: 13.5px; color: #1e40af;">
                    ⏳ Your mentor will generate and update the meeting URL shortly. You will receive an updated ping.
                  </div>
                  `}
                </td>
              </tr>

              <!-- Preparation Checklist Box -->
              <tr>
                <td style="padding: 0 32px 32px;">
                  <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 16px 20px;">
                    <div style="font-size: 12px; font-weight: 800; color: #6b21a8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      💡 Quick Checklist Before Your Call:
                    </div>
                    <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #581c87; line-height: 1.6;">
                      <li>Ensure a quiet space with a stable internet connection.</li>
                      <li>Have your target universities, resume, or SOP draft open.</li>
                      <li>Please join 2 minutes prior to start time to test your microphone and camera.</li>
                    </ul>
                  </div>
                </td>
              </tr>

              <!-- Trust & Security Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                    Need to reschedule or have questions? Email our concierge team at <a href="mailto:unicoachedu@gmail.com" style="color: #4f46e5; text-decoration: underline;">unicoachedu@gmail.com</a>
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                    &copy; ${new Date().getFullYear()} UniCoach Global Advisory • 🔒 Verified 1:1 Mentorship Platform
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // 2. Prepare Mentor & Admin notification email
    const rawMentorEmail = mentor?.email || booking.mentorId?.email;
    const adminInbox = process.env.SMTP_USER || 'unicoachedu@gmail.com';
    
    // Check if mentor has a valid external email address (not a placeholder @unicoach.in or @example.com)
    const hasValidExternalEmail = rawMentorEmail && 
      !rawMentorEmail.endsWith('@unicoach.in') && 
      !rawMentorEmail.endsWith('@example.com') &&
      rawMentorEmail.includes('@');

    const primaryMentorRecipient = hasValidExternalEmail ? rawMentorEmail : adminInbox;
    const ccRecipient = (hasValidExternalEmail && rawMentorEmail !== adminInbox) ? adminInbox : undefined;

    let mentorHtml = '';
    if (primaryMentorRecipient) {
      mentorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New 1:1 Session Booked</title>
        <style>
          body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          table { border-collapse: collapse; }
          a { text-decoration: none; }
        </style>
      </head>
      <body style="background-color: #f8fafc; padding: 32px 16px; margin: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.06);">
                
                <!-- Brand Header Bar -->
                <tr>
                  <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left">
                          <div style="font-size: 21px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                            UniCoach<span style="color: #4f46e5;">.</span>
                          </div>
                          <div style="font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 0.6px; text-transform: uppercase; margin-top: 2px;">
                            Creator &amp; Mentor Studio
                          </div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px; border: 1px solid #fde68a;">
                            ● New Mentorship Booking
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Hero Heading -->
                <tr>
                  <td style="padding: 32px 32px 20px;">
                    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1.3;">
                      New 1:1 Student Call Scheduled!
                    </h1>
                    <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
                      Hi <strong>${mentorName}</strong>, <strong>${studentName}</strong> has booked a <strong>${serviceTitle}</strong> session with you on UniCoach.
                    </p>
                  </td>
                </tr>

                <!-- Details Ledger Box -->
                <tr>
                  <td style="padding: 0 32px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
                      <tr>
                        <td colspan="2" style="padding: 14px 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #475569;">
                            Candidate &amp; Schedule Details
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9; width: 38%;">Student</td>
                        <td style="padding: 12px 20px; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${studentName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Student Email</td>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #4f46e5; border-bottom: 1px solid #f1f5f9; text-align: right;">
                          <a href="mailto:${booking.studentEmail}" style="color: #4f46e5; text-decoration: underline;">${booking.studentEmail}</a>
                        </td>
                      </tr>
                      ${booking.studentPhone ? `
                      <tr>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Phone / WhatsApp</td>
                        <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${booking.studentPhone}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Date &amp; Time</td>
                        <td style="padding: 12px 20px; font-size: 14px; font-weight: 700; color: #059669; border-bottom: 1px solid #f1f5f9; text-align: right;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Booking Ref</td>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #f1f5f9; text-align: right;">
                          <code style="background-color: #ffffff; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #334155; border: 1px solid #cbd5e1;">${booking.bookingRef}</code>
                        </td>
                      </tr>
                      ${booking.studentNotes ? `
                      <tr>
                        <td colspan="2" style="padding: 14px 20px; background-color: #ffffff;">
                          <div style="font-size: 11.5px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Student's Target Goals / Notes:</div>
                          <div style="font-size: 13.5px; color: #334155; font-style: italic; line-height: 1.5;">"${booking.studentNotes}"</div>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>

                <!-- Action Button -->
                <tr>
                  <td style="padding: 0 32px 28px; text-align: center;">
                    ${joinUrl ? `
                    <a href="${joinUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.2); letter-spacing: 0.2px;">
                      👉 Join Google Meet with ${studentName}
                    </a>
                    ` : ''}
                  </td>
                </tr>

                <!-- Mentor SLA Note -->
                <tr>
                  <td style="padding: 0 32px 32px;">
                    <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 0 10px 10px 0; padding: 14px 18px; font-size: 13px; color: #475569; line-height: 1.6;">
                      💡 <strong>Mentor Advisory Tip:</strong> Please review any target course details mentioned by the student and join 2 minutes early to ensure high audio/video quality.
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                      &copy; ${new Date().getFullYear()} UniCoach Creator Studio • 1:1 Mentorship Platform
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `;
    }

    // 3. Dispatch concurrently to BOTH student and mentor/admin in parallel
    const emailPromises = [
      sendEmail({
        to: booking.studentEmail,
        subject: `🗓️ 1:1 Session Confirmed: Meeting Link with ${mentorName} (${serviceTitle})`,
        html: htmlContent
      }).then(res => {
        console.log(`[NotificationService] 1:1 confirmation sent to student ${booking.studentEmail}`);
        return { success: true, res };
      }).catch(studentErr => {
        console.warn('⚠️ [NotificationService] Student email delivery warning:', studentErr.message);
        return { success: false, warning: studentErr.message, simulated: true };
      })
    ];

    if (primaryMentorRecipient && mentorHtml) {
      emailPromises.push(
        sendEmail({
          to: primaryMentorRecipient,
          cc: ccRecipient,
          subject: `🚀 New 1:1 Student Booking Alert: ${studentName} booked ${serviceTitle}`,
          html: mentorHtml
        }).then(res => {
          console.log(`[NotificationService] 1:1 alert sent to mentor/admin ${primaryMentorRecipient}`);
          return { success: true, res };
        }).catch(mentorErr => {
          console.warn('⚠️ [NotificationService] Mentor email delivery warning:', mentorErr.message);
          return { success: false, warning: mentorErr.message, simulated: true };
        })
      );
    }

    const [studentDelivery, mentorDelivery = { success: false, skipped: true }] = await Promise.all(emailPromises);

    return { 
      success: true, 
      studentDelivery,
      mentorDelivery,
      joinUrl,
      studentEmail: booking.studentEmail,
      mentorEmail: primaryMentorRecipient
    };
  } catch (err) {
    console.error('❌ [NotificationService] Error in sendBookingConfirmationEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends confirmation emails for direct service purchases, SOP/Resume reviews, and Priority DMs
 */
async function sendDirectOrderConfirmationEmail(booking, mentor, service) {
  try {
    if (!booking || !booking.studentEmail) {
      console.warn('[NotificationService] No student email found on booking object.');
      return { success: false, error: 'No student email available.' };
    }

    const studentName = booking.studentName || 'Student';
    const mentorName = mentor?.name || booking.mentorId?.name || 'Your Mentor';
    const serviceTitle = service?.title || booking.serviceId?.title || 'Academic & Admission Service';
    const amountPaid = booking.amountPaid || 0;
    const currency = booking.currency === 'INR' ? '₹' : (booking.currency || '₹');
    const bookingRef = booking.bookingRef;
    const siteUrl = (process.env.FRONTEND_URL || 'https://www.unicoach.com').replace(/\/+$/, '');
    const trackingUrl = `${siteUrl}/unicoach/track/${bookingRef}`;
    const dashboardUrl = `${siteUrl}/unicoach/dashboard`;

    // ── 1. Student Confirmation Email (Ultra-Premium Receipt Aesthetic) ──
    const studentHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Receipt: ${serviceTitle}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-collapse: collapse; }
        a { text-decoration: none; }
      </style>
    </head>
    <body style="background-color: #f8fafc; padding: 32px 16px; margin: 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.06);">
              
              <!-- Brand Header Bar -->
              <tr>
                <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="left">
                        <div style="font-size: 21px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                          UniCoach<span style="color: #4f46e5;">.</span>
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 0.6px; text-transform: uppercase; margin-top: 2px;">
                          Global Mentorship &amp; Advisory
                        </div>
                      </td>
                      <td align="right">
                        <span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px; border: 1px solid #a7f3d0;">
                          ● Order Confirmed
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Hero Heading -->
              <tr>
                <td style="padding: 32px 32px 20px;">
                  <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1.3;">
                    Thank you for your order!
                  </h1>
                  <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
                    Hi <strong>${studentName}</strong>, your request for <strong>"${serviceTitle}"</strong> has been received and confirmed with <strong>${mentorName}</strong>.
                  </p>
                </td>
              </tr>

              <!-- Details Ledger Box -->
              <tr>
                <td style="padding: 0 32px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
                    <tr>
                      <td colspan="2" style="padding: 14px 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #475569;">
                          Order Summary
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9; width: 38%;">Service</td>
                      <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${serviceTitle}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Assigned Mentor</td>
                      <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${mentorName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Reference ID</td>
                      <td style="padding: 12px 20px; border-bottom: 1px solid #f1f5f9; text-align: right;">
                        <code style="background-color: #ffffff; padding: 4px 8px; border-radius: 6px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12.5px; color: #334155; border: 1px solid #cbd5e1;">${bookingRef}</code>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Turnaround SLA</td>
                      <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">24 – 48 Hours</td>
                    </tr>
                    ${booking.studentPhone ? `
                    <tr>
                      <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Contact Phone</td>
                      <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${booking.studentPhone}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 16px 20px; font-size: 15px; font-weight: 700; color: #0f172a;">Amount Paid</td>
                      <td style="padding: 16px 20px; font-size: 20px; font-weight: 800; color: #059669; text-align: right;">${currency}${amountPaid}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Primary Action CTA -->
              <tr>
                <td style="padding: 0 32px 28px; text-align: center;">
                  <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.2); letter-spacing: 0.2px;">
                    View Order Tracking &amp; Deliverables &rarr;
                  </a>
                </td>
              </tr>

              <!-- What Happens Next Box -->
              <tr>
                <td style="padding: 0 32px 32px;">
                  <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 0 10px 10px 0; padding: 16px 20px; font-size: 13.5px; color: #334155; line-height: 1.6;">
                    <strong style="color: #0f172a;">📌 What happens next?</strong><br/>
                    ${mentorName} will review your details and analyze your draft against global university standards. You will receive comprehensive feedback, inline edits, and advisory notes directly on your tracking portal and registered email.
                  </div>
                </td>
              </tr>

              <!-- Trust & Security Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                    Need help with your order? Contact our advisory concierge at <a href="mailto:unicoachedu@gmail.com" style="color: #4f46e5; text-decoration: underline;">unicoachedu@gmail.com</a>
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                    &copy; ${new Date().getFullYear()} UniCoach Global Advisory • 🔒 Secure 256-Bit SSL Encrypted Transaction
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // ── 2. Mentor & Admin Alert Email (Executive SaaS Notification) ──
    const rawMentorEmail = mentor?.email || booking.mentorId?.email;
    const adminInbox = process.env.SMTP_USER || 'unicoachedu@gmail.com';

    const hasValidExternalEmail = rawMentorEmail && 
      !rawMentorEmail.endsWith('@unicoach.in') && 
      !rawMentorEmail.endsWith('@example.com') &&
      rawMentorEmail.includes('@');

    const primaryMentorRecipient = hasValidExternalEmail ? rawMentorEmail : adminInbox;
    const ccRecipient = (hasValidExternalEmail && rawMentorEmail !== adminInbox) ? adminInbox : undefined;

    let mentorHtml = '';
    if (primaryMentorRecipient) {
      mentorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Received: ${serviceTitle}</title>
        <style>
          body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          table { border-collapse: collapse; }
          a { text-decoration: none; }
        </style>
      </head>
      <body style="background-color: #f8fafc; padding: 32px 16px; margin: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.06);">
                
                <!-- Brand Header Bar -->
                <tr>
                  <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left">
                          <div style="font-size: 21px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                            UniCoach<span style="color: #4f46e5;">.</span>
                          </div>
                          <div style="font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 0.6px; text-transform: uppercase; margin-top: 2px;">
                            Creator &amp; Mentor Studio
                          </div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px; border: 1px solid #bfdbfe;">
                            ● New Paid Order
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Hero Heading -->
                <tr>
                  <td style="padding: 32px 32px 20px;">
                    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1.3;">
                      New Order Received!
                    </h1>
                    <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
                      Hi <strong>${mentorName}</strong>, <strong>${studentName}</strong> has purchased your <strong>"${serviceTitle}"</strong> service on UniCoach.
                    </p>
                  </td>
                </tr>

                <!-- Details Ledger Box -->
                <tr>
                  <td style="padding: 0 32px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
                      <tr>
                        <td colspan="2" style="padding: 14px 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #475569;">
                            Candidate &amp; Payout Summary
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9; width: 38%;">Student</td>
                        <td style="padding: 12px 20px; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${studentName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Student Email</td>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #4f46e5; border-bottom: 1px solid #f1f5f9; text-align: right;">
                          <a href="mailto:${booking.studentEmail}" style="color: #4f46e5; text-decoration: underline;">${booking.studentEmail}</a>
                        </td>
                      </tr>
                      ${booking.studentPhone ? `
                      <tr>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Phone / WhatsApp</td>
                        <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${booking.studentPhone}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 12px 20px; font-size: 13.5px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Order Reference</td>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #f1f5f9; text-align: right;">
                          <code style="background-color: #ffffff; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #334155; border: 1px solid #cbd5e1;">${bookingRef}</code>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 20px; font-size: 14px; font-weight: 700; color: #0f172a;">Net Creator Payout</td>
                        <td style="padding: 16px 20px; font-size: 18px; font-weight: 800; color: #059669; text-align: right;">
                          ${currency}${booking.mentorEarning || amountPaid} <span style="font-size: 11px; font-weight: 600; color: #64748b;">(0% Platform Fee)</span>
                        </td>
                      </tr>
                      ${booking.studentNotes ? `
                      <tr>
                        <td colspan="2" style="padding: 14px 20px; background-color: #ffffff;">
                          <div style="font-size: 11.5px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Candidate's Submission Notes:</div>
                          <div style="font-size: 13.5px; color: #334155; font-style: italic; line-height: 1.5;">"${booking.studentNotes}"</div>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>

                <!-- Action Button -->
                <tr>
                  <td style="padding: 0 32px 28px; text-align: center;">
                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.2); letter-spacing: 0.2px;">
                      👉 Open Creator Dashboard to Fulfill
                    </a>
                  </td>
                </tr>

                <!-- SLA reminder -->
                <tr>
                  <td style="padding: 0 32px 32px;">
                    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 10px 10px 0; padding: 14px 18px; font-size: 13px; color: #475569; line-height: 1.6;">
                      ⚡ <strong>SLA Guarantee:</strong> Please deliver your reviewed feedback document within 24–48 hours to maintain your UniCoach Top Rated badge.
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                      &copy; ${new Date().getFullYear()} UniCoach Creator Studio • 1:1 Mentorship Platform
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `;
    }

    // ── 3. Dispatch concurrently to BOTH student and mentor/admin in parallel ──
    const emailPromises = [
      sendEmail({
        to: booking.studentEmail,
        subject: `✨ Order Confirmed: ${serviceTitle} with ${mentorName} (${bookingRef})`,
        html: studentHtml
      }).then(res => {
        console.log(`[NotificationService] Direct order confirmation sent to student ${booking.studentEmail}`);
        return { success: true, res };
      }).catch(studentErr => {
        console.warn('⚠️ [NotificationService] Student direct order delivery warning:', studentErr.message);
        return { success: false, warning: studentErr.message, simulated: true };
      })
    ];

    if (primaryMentorRecipient && mentorHtml) {
      emailPromises.push(
        sendEmail({
          to: primaryMentorRecipient,
          cc: ccRecipient,
          subject: `🚀 New Order Alert: ${studentName} booked ${serviceTitle} (${currency}${amountPaid})`,
          html: mentorHtml
        }).then(res => {
          console.log(`[NotificationService] Direct order alert sent to mentor/admin ${primaryMentorRecipient}`);
          return { success: true, res };
        }).catch(mentorErr => {
          console.warn('⚠️ [NotificationService] Mentor direct order delivery warning:', mentorErr.message);
          return { success: false, warning: mentorErr.message, simulated: true };
        })
      );
    }

    const [studentDelivery, mentorDelivery = { success: false, skipped: true }] = await Promise.all(emailPromises);

    return {
      success: true,
      studentDelivery,
      mentorDelivery,
      studentEmail: booking.studentEmail,
      mentorEmail: primaryMentorRecipient
    };
  } catch (err) {
    console.error('❌ [NotificationService] Error in sendDirectOrderConfirmationEmail:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendBookingConfirmationEmail,
  sendDirectOrderConfirmationEmail
};


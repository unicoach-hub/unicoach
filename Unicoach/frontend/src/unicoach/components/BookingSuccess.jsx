import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Video, Calendar, ArrowRight, Download, Share2, FileText, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';

const BookingSuccess = ({ booking, onClose }) => {
  if (!booking) return null;

  const isDigitalAsset = Boolean(booking.digitalAsset || booking.digitalAssetDelivery);
  const isPriorityDm = Boolean(booking.priorityDm);
  const digitalAsset = booking.digitalAsset || booking.digitalAssetDelivery;

  const handleDownloadIcs = () => {
    if (!booking.startUtc) return;
    const startDate = new Date(booking.startUtc);
    const endDate = new Date(booking.endUtc);

    const pad = (n) => String(n).padStart(2, '0');
    const toIcsDate = (d) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UniCoach//UniCoach Mentorship//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${booking.bookingRef}@unicoach.com`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(startDate)}`,
      `DTEND:${toIcsDate(endDate)}`,
      `SUMMARY:UniCoach 1:1 Session with ${booking.mentorName}`,
      `DESCRIPTION:Your mentorship session: ${booking.service || booking.serviceTitle}. Join link: ${booking.meetingUrl}`,
      `LOCATION:${booking.meetingUrl}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `UniCoach-Session-${booking.bookingRef}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center max-w-xl mx-auto shadow-sm animate-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
        {isDigitalAsset ? 'Instant Access Ready!' : isPriorityDm ? 'Question Dispatched!' : 'Booking Confirmed!'}
      </span>

      <h2 className="text-2xl font-bold text-slate-900 mt-2 mb-1">
        {isDigitalAsset
          ? `Your Resource is Ready to Download`
          : isPriorityDm
          ? `Priority Question Sent to ${booking.mentorName}`
          : `You're all set with ${booking.mentorName}`}
      </h2>

      <p className="text-xs text-slate-500 mb-6">
        Reference ID: <strong className="font-mono text-slate-700">{booking.bookingRef}</strong>
      </p>

      {/* Details Box */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70 text-left mb-6 space-y-2.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Service:</span>
          <strong className="text-slate-900">{booking.serviceTitle || booking.service}</strong>
        </div>

        {booking.startUtc && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Date & Time:</span>
            <strong className="text-slate-900">
              {new Date(booking.startUtc).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </strong>
          </div>
        )}

        {isPriorityDm && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Guaranteed Response SLA:</span>
            <strong className="text-amber-700 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Within {booking.priorityDm.maxDeliveryHours || 48} Hours
            </strong>
          </div>
        )}

        {isDigitalAsset && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Resource File:</span>
            <strong className="text-slate-900 truncate max-w-[200px]">
              {digitalAsset.fileName || 'Digital Download'}
            </strong>
          </div>
        )}

        <div className="flex justify-between text-xs pt-2 border-t border-slate-200/60">
          <span className="text-slate-500">Amount Paid:</span>
          <strong className="text-emerald-700 font-bold">₹{booking.amountPaid}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Digital Asset Download Button */}
        {isDigitalAsset && (
          <a
            href={digitalAsset.fileUrl}
            target="_blank"
            rel="noreferrer"
            download={digitalAsset.fileName}
            className="w-full py-4 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Resource ({digitalAsset.fileName || 'File'})
          </a>
        )}

        {/* 1:1 Meet Link */}
        {!isDigitalAsset && !isPriorityDm && booking.meetingUrl && (
          <a
            href={booking.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" />
            Open Google Meet Session Link
          </a>
        )}

        {/* Priority DM Note */}
        {isPriorityDm && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-900 text-xs text-left mb-2">
            <p className="font-semibold mb-0.5">Track Your Answer:</p>
            <p className="text-[11px] text-amber-800">
              Your question is actively pending in the mentor's studio inbox. You can check your answer status anytime using reference ID <strong>{booking.bookingRef}</strong>.
            </p>
          </div>
        )}

        {/* Public Tracking & Receipt Link */}
        <Link
          to={booking.mentorHandle ? `/@${booking.mentorHandle}/query/${booking.bookingRef}` : `/unicoach/track/${booking.bookingRef}`}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>{isPriorityDm ? 'Open Live SLA & Response Tracking Page' : 'View Public Order Tracking & Details'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <div className="flex flex-col sm:flex-row gap-2.5">
          {!isDigitalAsset && !isPriorityDm && booking.startUtc && (
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Add to Calendar (.ics)
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            Done / Return to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;

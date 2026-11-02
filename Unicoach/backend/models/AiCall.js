const mongoose = require('mongoose');

// One phone call, shown in admin → AI Calls:
//  - kind 'ai': Riya (auto calls to new leads, calls started from admin, inbound calls to Riya's
//    number). On Bolna, filled from Bolna's webhook (controllers/bolnaController); with provider
//    'elevenlabs', from our own Vobiz ⇄ ElevenLabs bridge (services/riyaCalls).
//  - kind 'human': a team member on the admin softphone (Vobiz WebRTC), filled from Vobiz callbacks
//    (controllers/vobizController). executionId is then Vobiz's CallUUID.
const aiCallSchema = new mongoose.Schema({
  executionId: { type: String, required: true, unique: true },
  kind: { type: String, enum: ['ai', 'human'], default: 'ai', index: true },
  provider: { type: String, enum: ['bolna', 'elevenlabs', 'vobiz'], default: 'bolna', index: true },
  // ElevenLabs calls (services/riyaCalls): conversation to read back, the Vobiz call, dial attempts
  conversationId: { type: String, default: '' },
  vobizCallUuid: { type: String, default: '', index: true },
  vobizRequestUuid: { type: String, default: '' },
  phoneRecordingUrl: { type: String, default: '' }, // Vobiz's recording: what the student heard
  attempts: { type: Number, default: 0 },
  dynamicVars: { type: mongoose.Schema.Types.Mixed, default: {} }, // student details given to the agent
  staffName: { type: String, default: '' }, // team member on a softphone call
  recordingId: { type: String, default: '' }, // Vobiz recording id (links the transcription callback)
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
  direction: { type: String, enum: ['outbound', 'inbound'], default: 'outbound', index: true },
  trigger: { type: String, enum: ['auto', 'manual', 'batch', 'inbound', 'softphone'], default: 'auto', index: true },
  phone: { type: String, index: true },
  name: { type: String, default: '' },
  agentId: { type: String, default: '' },
  // scheduled, queued, dialing, ringing, in-progress, completed, no-answer, busy, failed, ...
  status: { type: String, default: 'queued', index: true },
  // consultation_yes | callback | not_interested | do_not_call | wrong_number | no_conversation
  outcome: { type: String, default: '', index: true },
  customInstructions: { type: String, default: '' },
  requestedBy: { type: String, default: 'System' },
  scheduledFor: { type: Date },
  endedAt: { type: Date },
  durationSec: { type: Number, default: 0 },
  recordingUrl: { type: String, default: '' },
  transcript: { type: String, default: '' },
  summary: { type: String, default: '' },
  extracted: { type: mongoose.Schema.Types.Mixed, default: {} },
  hangupBy: { type: String, default: '' },
  error: { type: String, default: '' },
}, { timestamps: true });

aiCallSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AiCall', aiCallSchema);

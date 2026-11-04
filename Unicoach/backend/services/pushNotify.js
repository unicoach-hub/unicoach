const User = require('../models/User');

/**
 * Phone notifications for the UniCoach mobile app, sent through Expo's push service
 * (https://docs.expo.dev/push-notifications/sending-notifications/). The app registers its Expo push
 * token with POST /api/student/push-token; tokens the service reports as dead are removed.
 * Never throws: a failed notification must not break the request that triggered it.
 */
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const sendPushToUser = async (userId, { title, body, data = {} }) => {
  try {
    const user = await User.findById(userId).select('pushTokens').lean();
    const tokens = (user?.pushTokens || []).map((t) => t.token).filter(Boolean);
    if (!tokens.length) return;

    const messages = tokens.map((to) => ({ to, title, body: String(body || '').slice(0, 180), data, sound: 'default', channelId: 'default' }));
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
    const json = await res.json().catch(() => ({}));
    const dead = (json.data || [])
      .map((ticket, i) => (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered' ? tokens[i] : null))
      .filter(Boolean);
    if (dead.length) await User.updateOne({ _id: userId }, { $pull: { pushTokens: { token: { $in: dead } } } });
  } catch (err) {
    console.warn('[Push] send failed (non-blocking):', err.message);
  }
};

module.exports = { sendPushToUser };

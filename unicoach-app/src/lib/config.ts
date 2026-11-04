// Same backend as www.unicoach.com. Override with EXPO_PUBLIC_API_URL in .env (e.g. a LAN IP for a local backend).
const raw = process.env.EXPO_PUBLIC_API_URL || 'https://api.unicoach.com/api';
const trimmed = raw.replace(/\/+$/, '');

export const API_URL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;

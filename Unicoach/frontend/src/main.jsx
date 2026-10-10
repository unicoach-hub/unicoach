import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { installApiFetch } from './utils/installApiFetch'
import { initAdTracking } from './utils/adTracking'

// Must run before any component fetches: send the session cookie on every call to our API
installApiFetch()

// Google Ads / Meta Pixel, campaign attribution and lead/signup/purchase conversions
initAdTracking()

// Initialize Sentry error and crash monitoring asynchronously only when DSN is configured
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 0.2,
      environment: import.meta.env.MODE || 'development'
    });
    window.Sentry = Sentry;
  }).catch(() => {});
}

// Automatically handle Vite dynamic import / chunk load failures upon new deployment
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected. Auto-reloading to fetch new deployment assets...', event);
  window.location.reload();
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '324611777052-7p8vf6php65bdf7eljj753al4lj6d3kp.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);

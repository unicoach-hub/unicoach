import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import './styles/redesign.css'
import App from './App.jsx'
import { reloadForNewBuild } from './components/ErrorBoundary.jsx'

// Initialize Sentry error and crash monitoring for Admin CRM
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.2,
    environment: import.meta.env.MODE || 'development'
  });
  window.Sentry = Sentry;
  console.log('✅ Sentry crash monitoring active on Admin CRM');
}

// A page file from an older deploy failed to preload: reload once to get the new build
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewBuild()) event.preventDefault();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

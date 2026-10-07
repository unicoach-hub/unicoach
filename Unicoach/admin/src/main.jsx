import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import './styles/redesign.css'
import App from './App.jsx'

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

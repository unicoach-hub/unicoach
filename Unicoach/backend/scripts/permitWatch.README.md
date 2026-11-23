# Permit watch — Irish employment-permit page monitor

Watches the Irish Department of Enterprise employment-permit pages and emails when the meaningful
text or the PDF/doc links on a page change. Built for the Irish immigration content work.

- Links, interval and noise filters: `config/permitWatch.json`
- Code: `services/permitWatchService.js`
- Snapshots: `data/permit-watch/*.json` (git-ignored, rebuilt on the next run)

## Run it by hand

```bash
npm run permit-watch                       # one pass, emails if something changed
node scripts/permitWatch.js --once --dry    # one pass, sends nothing
node scripts/permitWatch.js --list         # show the watched links
node scripts/permitWatch.js --reset        # forget the snapshots, next run is a fresh baseline
```

The first run on a page only stores a baseline — no email.

## Environment

| Variable | What it does |
| --- | --- |
| `ALERT_EMAIL_TO` | Where alerts go. **Required** — nothing is hardcoded. |
| `PERMIT_WATCH_EMAIL_TO` | Optional, overrides `ALERT_EMAIL_TO` for this monitor only. |
| `ALERT_WHATSAPP_TO` | WhatsApp number for the same alert. Empty = email only. |
| `PERMIT_WATCH_WHATSAPP_TO` | Optional, overrides `ALERT_WHATSAPP_TO` for this monitor only. |
| `PERMIT_WATCH_WA_TEMPLATE` | Approved WhatsApp template name (one body variable). See below. |
| `PERMIT_WATCH_WA_TEMPLATE_LANG` | Template language code, default `en`. |
| `PERMIT_WATCH_ENABLED` | `true` to let the in-process worker start with the server. Off by default. |
| `PERMIT_WATCH_INTERVAL_MINUTES` | Overrides `intervalMinutes` from the config file. |

Email goes out through the existing sender in `utils/email.js` (Resend, verified domain), so no new
mail setup is needed. Without `RESEND_API_KEY` outside production it prints to the console instead.

## WhatsApp alerts

Alerts also go to WhatsApp when `ALERT_WHATSAPP_TO` is set. They go through the Meta Cloud API with
the credentials already in Settings → WhatsApp Business, so no new setup is needed — but the
database has to be reachable (email does not need it).

**Meta's 24-hour rule:** a free-form text message is only accepted within 24 hours of that person's
last message to the business number. A monitor fires at random times, so most alerts fall outside
that window and plain text gets rejected. For alerts that always arrive, create a template in
Settings → WhatsApp Business with a single body variable, for example:

> UniCoach alert: {{1}}

and once Meta approves it set `PERMIT_WATCH_WA_TEMPLATE` to its name. Without that, WhatsApp is
best-effort: a rejected message is logged, and the email still goes out.

## Adding a link

Open `config/permitWatch.json`, copy one block inside `pages`, change `url` and `label`, save.
To pause a page without deleting it, set `"enabled": false`.

## Running it continuously

Recommended: a **Coolify scheduled task** on the backend service running

```
node scripts/permitWatch.js --once
```

every 20 minutes. One process, nothing added to the API server, and the logs are per run.

Alternative: add `require('./services/permitWatchService').startWorker();` next to the other
`startWorker()` calls in `server.js`. It stays inert unless `PERMIT_WATCH_ENABLED=true`.

## Notes on the site

- `employmentpermits.enterprise.gov.ie` is the application portal (EPOS) and returns 403 to every
  non-browser client, so it is not watched. Its public content now lives on `enterprise.gov.ie`
  under `/what-we-do/workplace-and-skills/employment-permits/`.
- The site is ASP.NET WebForms: the whole page sits inside one `<form>`, so that tag must not be
  stripped, and the content is in `div#main`, not `<main>`.
- Politeness: one page at a time, 3s between pages, a descriptive User-Agent, 3 retries with
  exponential back-off. `robots.txt` allows all agents except MJ12bot.
- A failed fetch never counts as a change. A page has to keep failing for `failAlertAfterHours`
  (4) before one failure email goes out, then at most once every `failAlertRepeatHours` (24).

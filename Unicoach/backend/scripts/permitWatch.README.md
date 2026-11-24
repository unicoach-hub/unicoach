# Permit watch — Irish employment-permit page monitor

Watches the Irish Department of Enterprise employment-permit pages and emails when the meaningful
text or the PDF/doc links on a page change. Built for the Irish immigration content work.

- Links, interval and noise filters: `config/permitWatch.json`
- Code: `services/permitWatchService.js`
- Snapshots: the `permitwatchsnapshots` collection on a server, `data/permit-watch/*.json` on a
  laptop (see "Where snapshots live")

## Run it by hand

```bash
npm run permit-watch                       # one pass: checks the pages that are due now
node scripts/permitWatch.js --once --all    # one pass: checks every page, ignoring the gaps
node scripts/permitWatch.js --once --dry    # one pass, sends nothing
node scripts/permitWatch.js --list         # show the watched links
node scripts/permitWatch.js --reset        # forget the snapshots, next run is a fresh baseline
```

The first run on a page only stores a baseline — no email.

## Where snapshots live

The monitor has to remember the last copy of each page. The deployed container's filesystem is
read-only — `mkdir /app/data/permit-watch` fails with `EACCES` — so on the server the snapshots go
into the **database** (`permitwatchsnapshots`, one document per page plus `_sitemap`), which also
means they survive a redeploy. On a laptop the folder is writable, so disk wins and a local run
never disturbs the live snapshots. `PERMIT_WATCH_DATA_DIR` points at a mounted volume if you ever
add one.

With neither a writable folder nor a database every page looks new, so each pass just stores a
baseline and sends nothing. A missing store can never cause false alarms, only silence — and it
says so loudly in the log.

## Who gets the alerts

Several people can be on the list, and it is edited in **admin → Developer → "Irish permit alerts"**:
email addresses, WhatsApp numbers, an on/off switch, the two gaps, a "send a test alert" button and
a "check the pages now" button. It is saved in the `permitwatchconfigs` collection, so adding a
teammate needs no deploy and no restart — the next pass picks it up.

`ALERT_EMAIL_TO` / `ALERT_WHATSAPP_TO` still work and may hold several values separated by commas.
Both lists are merged and de-duplicated, so the environment is the fallback for a standalone run
with no database.

## Environment

| Variable | What it does |
| --- | --- |
| `ALERT_EMAIL_TO` | Fallback recipients, comma separated. Nothing is hardcoded. |
| `PERMIT_WATCH_EMAIL_TO` | Optional, overrides `ALERT_EMAIL_TO` for this monitor only. |
| `ALERT_WHATSAPP_TO` | Fallback WhatsApp numbers, comma separated. |
| `PERMIT_WATCH_WHATSAPP_TO` | Optional, overrides `ALERT_WHATSAPP_TO` for this monitor only. |
| `PERMIT_WATCH_WA_TEMPLATE` | Approved WhatsApp template name (one body variable). See below. |
| `PERMIT_WATCH_WA_TEMPLATE_LANG` | Template language code, default `en`. |
| `PERMIT_WATCH_ENABLED` | `true` to let the in-process worker start with the server. Off by default. |
| `PERMIT_WATCH_DATA_DIR` | Folder for snapshots. Unset and unwritable means the database. |
| `PERMIT_WATCH_INTERVAL_MINUTES` | Overrides `intervalMinutes` (the slow gap). |
| `PERMIT_WATCH_NEWS_MINUTES` | Overrides `newsIntervalMinutes` (the fast gap). |
| `PERMIT_WATCH_TICK_MINUTES` | Overrides `tickMinutes` (how often the worker wakes up). |

Email goes out through the existing sender in `utils/email.js` (Resend, verified domain), so no new
mail setup is needed. Without `RESEND_API_KEY` outside production it prints to the console instead.

## WhatsApp alerts

Alerts also go to WhatsApp when `ALERT_WHATSAPP_TO` is set. They go through the Meta Cloud API with
the credentials already in Settings → WhatsApp Business, so no new setup is needed — but the
database has to be reachable (email does not need it).

**Meta's 24-hour rule — the thing that actually bites.** A free-form text message only reaches
someone within 24 hours of *their* last message to the business number. Outside it, the Cloud API
still answers 200 with a message id, so the send looks fine, and the message then quietly fails;
the status webhook records it as `failed` with `"Re-engagement message"` (visible in the
`whatsappevents` collection). Accepted is not delivered.

So alerts go through an approved template: `permit_update_alert` (UTILITY, one body variable),
submitted on 23 Nov 2026. `DEFAULT_WA_TEMPLATE` in the service holds that name;
`PERMIT_WATCH_WA_TEMPLATE` overrides it, and `PERMIT_WATCH_WA_TEMPLATE=''` forces plain text.
While a template is still under review the send falls back to plain text, so nothing is lost.

Template parameters may not contain newlines, so the WhatsApp text is flattened to one line with
` · ` separators and cut to 900 characters. Email always carries the full diff.

## Two speeds, and why

The site sends no `ETag` and no `Last-Modified`, and it has no RSS feed, so every check is a full
page download — checking 21 pages every 5 minutes would be ~6,000 downloads a day from one IP.

So each page has its own gap and a pass only fetches what is due:

- `newsIntervalMinutes` (5) — the pages where announcements actually appear: the section home,
  **Latest updates** and **Department news**. New rules, quotas and notices show up here first.
- `intervalMinutes` (30) — everything else: fees, occupation lists, processing dates, forms.

The worker wakes every `tickMinutes` (5). Result: news is caught within 5 minutes for about
1,100 requests a day instead of 6,000. Give any page its own gap with `"everyMinutes": 5`.

## It finds new pages on its own

`discovery` in the config reads the Department's `sitemap.xml` (cached, refetched every 12 hours)
and watches every page under the employment-permits and economic-migration sections — 18 pages
today, on top of the 10 listed by hand. When the Department publishes a page that was not in the
sitemap before, **that itself is an alert**, and the page joins the watch list automatically.

## Adding a link

Easiest: **admin → Developer → "Irish permit alerts" → Links to watch**. Paste the URL, give it a
name if you want, optionally set its own gap in minutes, Save. The pause switch keeps a link in the
list without checking it. These are stored in `permitwatchconfigs.pages`, so no deploy is needed,
and the panel also lists every page in the watch list with where it came from (built-in / admin /
sitemap).

In code: open `config/permitWatch.json`, copy one block inside `pages`, change `url` and `label`.
To pause one there, set `"enabled": false`.

A URL that appears in more than one place is checked once; the config file wins over an admin link,
and both win over the sitemap.

## Running it continuously

Recommended: a **Coolify scheduled task** on the backend service running

```
node scripts/permitWatch.js --once
```

every 20 minutes. One process, nothing added to the API server, and the logs are per run.

Alternative: add `require('./services/permitWatchService').startWorker();` next to the other
`startWorker()` calls in `server.js`. It stays inert unless `PERMIT_WATCH_ENABLED=true`.

## Notes on the site

- `employmentpermits.enterprise.gov.ie` is the online application portal. It is down: a real
  browser gets the same "Employment Permits Online – Service unavailable" holding page the fetcher
  does, served with HTTP 403. It is watched anyway, with `"acceptStatus": [403, 503, 404]`, so the
  day the portal returns the page text changes and that is the alert. Any page can carry
  `acceptStatus` when its error body is real content. The permit *content* lives on
  `enterprise.gov.ie` under `/what-we-do/workplace-and-skills/employment-permits/`.
- The site is ASP.NET WebForms: the whole page sits inside one `<form>`, so that tag must not be
  stripped, and the content is in `div#main`, not `<main>`.
- Politeness: one page at a time, 3s between pages, a descriptive User-Agent, 3 retries with
  exponential back-off. `robots.txt` allows all agents except MJ12bot.
- A failed fetch never counts as a change. A page has to keep failing for `failAlertAfterHours`
  (4) before one failure email goes out, then at most once every `failAlertRepeatHours` (24).

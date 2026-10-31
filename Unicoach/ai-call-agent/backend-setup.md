# Riya ↔ Unicoach backend: go-live steps

## What the code does

- **Auto call:** when a student submits a website form (Check Eligibility, Book Consultation, custom forms like Education Loan / Visa), the backend asks Bolna to have Riya call them.
  - Between 9 AM and 8:45 PM IST the call goes out 1 minute after the form. Otherwise it's scheduled for 10 AM.
  - If the call isn't answered or the line is busy, Bolna retries twice: after 1 hour and after 4 hours.
  - A number already called in the last 24 hours, or tagged `do-not-call`, is not called again.
  - Only Indian mobile numbers (+91 6–9…) are called.
- **Result back:** after the call, Bolna's webhook updates the lead in admin:
  - status (interested / contacted / not interested / closed), follow-up, `phoneCall: done`
  - empty country / course / education fields get filled in
  - **Activity log:** "AI call by Riya (2 min): Wants a free counsellor call", plus summary, all details and the recording link
  - tags: `AI call: wants counsellor`, `do-not-call`, `Wrong number`
  - the team's own progress (qualified / converted …) is never moved back

Code: `backend/services/bolnaCalls.js`, `backend/controllers/bolnaController.js`, and the `aiCall` field in the Lead model.

---

## Steps

### 1. In Bolna
1. **Developers → API keys:** create a new key and copy it.
2. **Agent Studio → Riya:** copy the agent ID (it's in the URL or the ⋮ menu).
3. **Riya → Extractions → callback_time:** change the description to:
   `Time the student asked to be called back, as an ISO date-time in IST, e.g. 2026-11-02T17:00:00+05:30. Empty if not mentioned.`
   (so the backend can set the lead's Next Follow-up date)
4. Add the 2 new extractions, **outcome** and **counsellor_call_time** (same as told earlier).

5. Add fix 9 from `riya-prompt-fixes.md` to the prompt (the `{{custom_instructions}}` line).

### 2. On the server (VPS / Coolify env)
```
BOLNA_API_KEY=<step 1.1>
BOLNA_AGENT_ID=<step 1.2>
BOLNA_FROM_NUMBER=+918065356711
BOLNA_WEBHOOK_SECRET=<a random 32-character string>
```
Then deploy. (`BOLNA_AUTO_CALL=false` is an emergency stop only: it blocks auto calls whatever the admin toggle says.)

### 3. Connect the webhook
Riya → **Extractions → Webhook URL:**
```
https://api.unicoach.com/api/webhooks/bolna
```
Turn on **Add headers:** `x-unicoach-secret` = the same `BOLNA_WEBHOOK_SECRET`.
Click **Send test**. The response should be 200 (with "no lead", which is fine for the test).

### 4. Test (Admin → AI Calls)
1. **Manual test first:** AI Calls → **New call**, enter your own number → Start call. Riya calls you; after the call it shows up under **Call history**, with the recording, transcript and summary.
2. **Auto test:** AI Calls → **Settings** → turn on "Call every new website lead" → Save. Fill a form on the website with your own number; Riya calls within about 1 minute.
3. Turn off the Bolna trial limit (add funds), otherwise only your verified number can be called.

## What's in admin

- **Sidebar → AI Calls**
  - **Overview:** calls, answered, wants a counsellor, callbacks, talk time and ≈ cost; chart; whether the setup is complete
  - **Call history:** all calls (auto / manual / batch / inbound), filters, click a row for the 🎧 recording, chat-style transcript, summary, what Riya found out, and a link to the lead
  - **New call:** number + name + instructions for this call + now or a scheduled time
  - **Settings** (owner only): auto-call on/off, agent ID, caller number, calling hours, max auto calls per day
- **Lead popup → "Call with Riya"**: opens New call with that lead filled in (Riya gets their country, intake and education)
- **Leads table → select leads → "Call with Riya"**: batch call (max 50), with optional instructions
- **Inbound:** whoever calls +91 80653 56711 is matched to their lead; a new number becomes a new lead ("Inbound call")
- Staff can see AI Calls if they have Leads permission; placing calls needs Leads → create

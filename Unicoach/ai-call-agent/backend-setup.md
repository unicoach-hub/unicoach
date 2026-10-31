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

### 2. On the server (VPS / Coolify env)
```
BOLNA_API_KEY=<step 1.1>
BOLNA_AGENT_ID=<step 1.2>
BOLNA_FROM_NUMBER=+918065356711
BOLNA_AUTO_CALL=false
BOLNA_WEBHOOK_SECRET=<a random 32-character string>
```
Then deploy.

### 3. Connect the webhook
Riya → **Extractions → Webhook URL:**
```
https://<live api domain>/api/webhooks/bolna
```
Turn on **Add headers:** `x-unicoach-secret` = the same `BOLNA_WEBHOOK_SECRET`.
Click **Send test**. The response should be 200 (with "no lead", which is fine for the test).

### 4. Test with one real lead
1. Turn off the trial limit (add funds to Bolna), or test from your verified number.
2. Set `BOLNA_AUTO_CALL=true` → redeploy.
3. Fill a form on the website with **your own number**.
4. Riya's call should come in about 1 minute. After the call, open the lead in admin: the activity log should show Riya's summary.

From then on every new lead gets an automatic call. To stop it: `BOLNA_AUTO_CALL=false`.

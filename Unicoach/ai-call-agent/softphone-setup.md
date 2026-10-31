# Team softphone: go-live steps

Every team member can call from the admin panel in the browser (headphones plus mic), using a **second Vobiz number**. Riya's number stays with Riya.

## What it does

- **Orange 📞 button** at the bottom-right of every admin page opens the phone: type a number → Call, plus Mute, keypad and Hang up.
- **Lead popup → "Call myself"**: the phone opens with that lead's number, and the call is linked to the lead.
- **Incoming**: when someone calls the team number, the phone rings for everyone who is **online**, and whoever answers takes the call. Once a person goes online they stay online across pages and reloads, until they press "Go offline".
- **Every call:**
  - is recorded and transcribed (Vobiz)
  - shows up in **AI Calls → Call history** under the "Team phone" filter, with who called, length, recording and transcript
  - gets an activity note on the lead, e.g. "Called by Sagar from the admin softphone (3 min)"

## Steps

### 1. In Vobiz (console.vobiz.ai)
1. **Numbers → Buy DID:** a second Karnataka 080 number (₹150/month). Choose **Skip for now** on Link.
2. **Voice → Applications → Create application:**
   - Name: `Unicoach Team Phone`
   - **Answer URL:** `https://api.unicoach.com/api/webhooks/vobiz/answer?key=<SECRET>` (method POST)
   - **Hangup URL:** `https://api.unicoach.com/api/webhooks/vobiz/hangup?key=<SECRET>` (method POST)
   - Copy the **App ID**.
3. Attach the new number to this application (Numbers → the number → Application).
4. **Don't create any endpoints yourself.** The backend creates one per person automatically, the first time they open the phone.

`<SECRET>` = any random string of 32 characters. Use the same value in the server env.

### 2. Server env (Coolify)
```
VOBIZ_AUTH_ID=MA_2HHNNRQ5
VOBIZ_AUTH_TOKEN=<from the Vobiz dashboard>
VOBIZ_APP_ID=<step 1.2>
VOBIZ_TEAM_NUMBER=+9180XXXXXXXX   (the new number)
VOBIZ_WEBHOOK_SECRET=<SECRET>
API_PUBLIC_URL=https://api.unicoach.com
```
Deploy the backend and the admin.

### 3. Test
1. Admin → 📞 → it should show "Online · +9180…". The browser will ask for mic permission: Allow.
2. Call your own mobile. The caller ID should show the team number.
3. Call the team number from your mobile. It should ring in the browser → Answer.
4. After a few minutes, open AI Calls → Call history → Team phone and play the recording. The transcript comes a little later.

## Worth knowing
- **Cost:** about ₹0.45/min outbound, plus recording (billed per minute) and transcription (charged separately by Vobiz). Exact rates are on the Vobiz dashboard.
- **Who can use it:** the owner, and staff with **Leads → create** permission.
- **Calling hours:** there's no time limit on the phone; that's the caller's call.
- **SDK:** the `vobiz-webrtc-sdk` npm package (the version Vobiz docs and demos use). It loads only when someone opens the phone, with call-quality tracking turned off.
- **Unconfirmed until the first real call:** the exact field names Vobiz sends in its recording, transcription and dial callbacks. The code handles several possible names, and logs `[Vobiz] transcription callback not understood` if it doesn't recognise the format. If the transcript doesn't appear after the first call, send me that log.

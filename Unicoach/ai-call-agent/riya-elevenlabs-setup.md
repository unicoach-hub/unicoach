# Riya on ElevenLabs: setup

How it works: the student's phone ⇄ our Vobiz number ⇄ our server (api.unicoach.com) ⇄ the ElevenLabs agent.
No ElevenLabs India region, SIP trunk or new number is needed. Admin → AI Calls keeps working as before
(history, recording, transcript, lead updates, auto / manual / batch calls, inbound 24×7).

Code: `backend/services/riyaCalls.js` (bridge + dialer), `backend/utils/audioCodec.js`,
`backend/controllers/riyaController.js`, `backend/scripts/setupElevenRiya.js`.

## 1. ElevenLabs
1. **Agent → Tools → System tools:** turn on **End call**. Riya uses it to hang up after "धन्यवाद".
2. **Developers → API keys → Create key.** Give it access to Agents / Conversational AI.
3. Copy the agent ID: Agents → Riya → the ID starting with `agent_`.
4. Before going live, take a paid plan (Starter or Creator). Free minutes run out fast.

## 2. Server env (Coolify → backend → Environment Variables, and local .env)
```
ELEVENLABS_API_KEY=<key>
ELEVENLABS_AGENT_ID=agent_...
RIYA_MAX_CONCURRENT=4
```
`VOBIZ_AUTH_ID`, `VOBIZ_AUTH_TOKEN`, `VOBIZ_WEBHOOK_SECRET` and `API_PUBLIC_URL` are already set for the softphone.

## 3. One-time agent setup
From the backend folder:
```
node scripts/setupElevenRiya.js            # shows the current settings
node scripts/setupElevenRiya.js --apply    # μ-law 8 kHz audio, data collection fields, inbound greeting
```

## 4. Vobiz: Riya's number
1. Vobiz console → Applications → **New application** "Riya ElevenLabs":
   - Answer URL: `https://api.unicoach.com/api/webhooks/riya/answer?key=<VOBIZ_WEBHOOK_SECRET>` (POST)
   - Hangup URL: `https://api.unicoach.com/api/webhooks/riya/hangup?key=<VOBIZ_WEBHOOK_SECRET>` (POST)
2. Phone numbers → **Riya's number** → link it to this application (it is linked to Bolna now).
   Outbound calls work without this step; inbound calls need it.

## 5. Admin
AI Calls → Settings → **Riya runs on: ElevenLabs**, paste the agent ID (or leave empty to use the env value),
check the caller number is Riya's number → Save. Overview shows "Riya on ElevenLabs" and anything still missing.

## 6. Test
AI Calls → New call → your own number. After the call:
- the call shows in Call history; the transcript and result come in about 10–60 s after hanging up
- "Update from ElevenLabs" in the call drawer pulls it again if it didn't arrive

## Switching back
AI Calls → Settings → Riya runs on: Bolna (and link the number back to Bolna in Vobiz for inbound).

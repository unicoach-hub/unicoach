# Razorpay payment setup guide (UniCoach)

UniCoach uses **only Razorpay** for payments: UPI, Indian cards, netbanking, wallets and international cards.
Mentors get their money **automatically in their own bank account** through **Razorpay Route**.
UniCoach takes **0% commission**. Only Razorpay's own fee (~2% + 18% GST on the fee) is deducted from the mentor's share.

---

## 1. How the money moves

```
Student pays ₹499 (Razorpay checkout)
        │
        ▼
UniCoach's Razorpay account  ──►  Razorpay deducts its fee + GST (≈ ₹11.78)
        │
        │  Our code automatically creates a Route transfer
        ▼
Mentor's linked account: ≈ ₹487.22  (ON HOLD)
        │
        │  Mentor marks the session "Completed"  (or answers the Priority DM / SOP)
        │  ── or automatically 72 hours after the session ends
        ▼
Razorpay settles it to the mentor's bank (usually T+2 working days)
```

- **Cancellation before completion:** the student gets a full refund and the mentor's held transfer is reversed automatically.
- **Mentor's only task:** fill in bank account + IFSC + PAN + address in the apply form or dashboard. **No Razorpay account needed.**
- **Admin's only task:** approve the mentor. The code opens their Razorpay payout account (the "linked account") automatically.

---

## 2. Create the Razorpay account and complete KYC (one time)

1. Sign up at https://dashboard.razorpay.com with `unicoachedu@gmail.com`.
2. **Account & Settings → Business details**: complete KYC. You'll need:
   - PAN (personal or business)
   - The bank account where money settles
   - Business type (individual/proprietor or company) and address
   - GST number (optional; ask your CA whether you need one)
3. Razorpay checks the website **before approving**. These pages must be live on `www.unicoach.com`:
   - Privacy Policy (`/privacy-policy`, already exists)
   - Terms & Conditions (`/terms`, already exists). Add one line saying: *"Sessions are provided by independent mentors. UniCoach is only a technology platform that facilitates booking and payment."*
   - **Refund & Cancellation Policy**: this page is missing, please create it. Example: if a mentor cancels → full refund; if the student cancels → refund rules X; refunds arrive in 5–7 working days.
   - Contact Us page (email + phone)
   - Prices must be visible on the site (mentor profile pages already show them)
4. Activation usually takes 2–7 working days.

---

## 3. Test mode keys (start here, no real money)

1. Turn on the **Test Mode** toggle at the top of the Razorpay dashboard.
2. **Account & Settings → API Keys → Generate Key**
3. You'll get a `Key ID` (`rzp_test_...`) and a `Key Secret`. The secret is shown **only once**, so store it somewhere safe.
4. Put them in your local `backend/.env` (never paste them in chat or commit them to git):

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

> Until you add keys, local development runs in a **simulator** (no real popup; the booking confirms directly).
> The simulator **never runs in production** (`NODE_ENV=production`).

---

## 4. Webhook (backup confirmation)

If the student closes the tab right after paying, the webhook still confirms the booking.

1. **Account & Settings → Webhooks → + Add New Webhook**
2. **Webhook URL:**
   ```
   https://api.unicoach.com/api/unicoach/webhooks/razorpay
   ```
   (If the backend domain changes, update the URL here too.)
3. **Secret:** set any long random string, for example 32+ random characters.
4. **Active events:** tick these:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.processed`
   - `refund.failed`
5. Save. Put the same secret in the env:
   ```env
   RAZORPAY_WEBHOOK_SECRET=the-same-secret-you-set-above
   ```

> Test Mode and Live Mode webhooks are **separate**. Create them in both modes.
> If the secret is missing or wrong, the server rejects every webhook (that's on purpose, for security).

---

## 5. Activate Razorpay Route (automatic payouts to mentors)

Route is **not on by default**. You have to request it:

1. In the dashboard sidebar, check **Route** (or **Products → Route**). If you see "Request access" or "Activate", click it.
2. If you don't see it, raise a ticket at **Support → Raise a request**:
   > *"We are UniCoach (www.unicoach.com), a mentorship marketplace. Independent mentors provide 1:1 sessions to students; we take 0% commission. Please activate Razorpay Route on our account so each payment can be transferred to the mentor's linked account (bank) with on-hold until the session is completed. Please also confirm whether Route transfers work for international card payments."*
3. After activation, test it in Test Mode first (linked accounts can be created in test mode too).
4. Once you're sure, set this env:
   ```env
   RAZORPAY_ROUTE_ENABLED=true
   ```
5. Optional: Razorpay may ask for a different category for linked accounts. The defaults are:
   ```env
   RAZORPAY_ROUTE_CATEGORY=education
   RAZORPAY_ROUTE_SUBCATEGORY=coaching
   ```
   If mentor account creation fails with a "category/subcategory invalid" error, put the values Razorpay suggests here.

> While `RAZORPAY_ROUTE_ENABLED=false`: bookings and payments still work, but the money stays in UniCoach's account and the booking shows `ROUTE_DISABLED`.
> After Route is on, use **Admin → UniCoach → Mentor → "Set up / refresh payout account"** and **Booking → "Retry transfer"** to send the pending money to mentors.

---

## 6. International payments

1. **Account & Settings → Payment Methods → International Payments → Request/Enable**
2. Razorpay may ask for extra documents (website, nature of business).
3. No code change needed: once enabled, the same checkout accepts international cards. The amount is charged in INR and the fee is higher (~3% + GST).

---

## 7. Production env (Render backend)

Render Dashboard → backend service → **Environment** → add/update:

| Variable | Value | Note |
|---|---|---|
| `NODE_ENV` | `production` | **Required.** Without it the payment simulator could run on the live site |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | Live key (test key while testing) |
| `RAZORPAY_KEY_SECRET` | live secret | Never share it |
| `RAZORPAY_WEBHOOK_SECRET` | secret of the **Live** webhook | Must match the Live webhook |
| `RAZORPAY_ROUTE_ENABLED` | `true` | Only after Route is activated |
| `RAZORPAY_ROUTE_CATEGORY` | `education` | Optional |
| `RAZORPAY_ROUTE_SUBCATEGORY` | `coaching` | Optional |

**Save Changes**, and Render redeploys automatically.

> The `Settings` collection in the DB also has `razorpayKeyId/razorpayKeySecret/razorpayWebhookSecret` fields. **If those are filled, they override env.** Keep them empty and use only env.

---

## 8. Testing checklist (Test Mode)

Test each case once in Test Mode:

| # | Test | Expected |
|---|---|---|
| 1 | Mentor profile (`/@handle`) → 1:1 slot → Pay | Razorpay popup opens; after payment the booking is CONFIRMED and both emails arrive |
| 2 | UPI `success@razorpay` | Payment succeeds |
| 3 | UPI `failure@razorpay` | Payment fails, slot is released, error message shows |
| 4 | Card: use a test card from Razorpay docs (https://razorpay.com/docs/payments/payments/test-card-details/) | Payment succeeds |
| 5 | Close the popup without paying | "Payment cancelled" message, no booking |
| 6 | Course page → "Book Call" (mentor with a real DB account) | DB price is shown, Razorpay opens, booking confirmed |
| 7 | Priority DM / digital product purchase | File/DM is delivered only **after** payment |
| 8 | Close the tab right after paying | Webhook confirms the booking within ~1 minute |
| 9 | Approve a mentor in admin (Route on) | Mentor shows payout account status `CREATED` / `ACTIVATED` |
| 10 | Paid booking → Razorpay Dashboard → **Route → Transfers** | Mentor's net amount appears **On hold** |
| 11 | Mentor dashboard → mark session **Completed** | Transfer becomes **Released**; mentor's Earnings tab shows "Sent to bank" |
| 12 | Mentor cancels the booking | Full refund to the student, transfer reversed |

---

## 9. Going live

1. KYC approved ✅, Route activated ✅, international enabled (if needed) ✅
2. Turn off Test Mode → **API Keys → Generate Live Key**
3. Create the **Live webhook** (same URL, events and a new secret)
4. Put the live keys and live webhook secret in Render env, and set `RAZORPAY_ROUTE_ENABLED=true`
5. Make one ₹1–₹10 real booking yourself, then refund it from the dashboard. That confirms everything works end to end.

---

## 10. Mentor onboarding (what the admin needs to know)

1. The mentor fills in the apply form: bank account, IFSC, PAN, address, phone (all required).
2. Admin → UniCoach → Mentors → **Approve**. The payout account is created automatically and its status shows in the message.
3. Status meanings:
   - `ACTIVATED`: payouts will happen ✅
   - `CREATED` / `UNDER_REVIEW`: Razorpay is reviewing, wait (usually a few minutes to 1 day)
   - `NEEDS_CLARIFICATION` / `FAILED`: read the error. Usually PAN, name or bank mismatch. Have the mentor fix their details in the dashboard, then click **"Set up / refresh payout account"**
4. Once it's `ACTIVATED`, click **"Set up / refresh payout account"** again. Any bookings that were waiting get transferred automatically.

---

## 11. Common problems

| Problem | Cause / fix |
|---|---|
| Checkout shows "Online payments are not configured yet" | Keys are missing in production env. Add `RAZORPAY_KEY_ID/SECRET` |
| Booking stuck in `PENDING_CAPTURE` | Payment isn't captured yet. Turn on **Auto-capture** in Razorpay (Account & Settings → Payment Capture), or the webhook will fix it shortly |
| Booking shows `PENDING_ACCOUNT` | Mentor's payout account isn't `ACTIVATED` yet. Activate it, then refresh |
| Booking shows `ROUTE_DISABLED` | `RAZORPAY_ROUTE_ENABLED` isn't `true`, or Route isn't activated on Razorpay |
| Webhook returns 400 | `RAZORPAY_WEBHOOK_SECRET` doesn't match the dashboard (test vs live mix-up) |
| Refund fails with "already released" | The mentor's payout was already sent to the bank. Refund manually from the Razorpay dashboard and settle with the mentor |
| Mentor account error: "category/subcategory" | Change `RAZORPAY_ROUTE_CATEGORY/SUBCATEGORY` as Razorpay support suggests |

---

## 12. Security rules

- **Never paste** the Key Secret, webhook secret or any API key in chat, WhatsApp or code. Use only `.env` and Render env.
- If a key gets leaked: Razorpay → API Keys → **Regenerate** right away, and update env.
- Mentors' bank/PAN details are never shown on the public profile. Only admin and the mentor themselves can see them.
- Tax (GST TCS, TDS 194-O): money passes through UniCoach's account, so **confirm the compliance with a CA once**.

# UniCoach — Full Project Bug & Security Audit (2 Oct 2026)

How this was produced:
- **Automated checks**: `node --check` on every backend file (0 failures), ESLint on the whole frontend (2,071 issues; 134 `no-undef` → real crashes), frontend + admin production builds (both pass), 18 new unit tests (pass).
- **Code review**: 4 read-only reviews (backend core, mentor/payments subsystem, website, admin panel). Every item was traced in the actual code. Nothing was changed by the reviews.

Severity: 🔴 Critical (exploitable / data loss / page crash) · 🟠 High · 🟡 Medium · ⚪ Low

## Fix status (3 Oct 2026, in working tree — not yet deployed)
- ✅ **All Critical fixed:** C1–C14.
- ✅ **High fixed:** H1, H2, H3, H4, H5, H6 partly (unverified register no longer links mentors), H7, H8, H9, H10, H11, H12, H13.
- ✅ **Medium fixed:** mongo-sanitize order, book-consultation identity overwrite, directory regex/limit, slot/service mismatch, updateService validation, reservation-expiry verify, admin self/admin delete, template overwrite, `/api/debug-sentry` hidden in production, all `no-undef` crashes, conditional hooks.
- ⏳ **Still open:** H6 (separate admin cookie), H14/H15 (one API base URL + same-site cookie/proxy), H16–H19, and the rest of Medium/Low.
- Verified by: `node --check` on every changed backend file, 21 unit tests (payments, lead-OTP takeover, auth→lead sync), frontend + admin production builds, local API smoke tests (401 on admin routes, no attendees in public events), and loading the previously crashing pages.

---

## 🔴 Critical — fix first

### Security
| # | Issue | Where | Impact |
|---|---|---|---|
| C1 | **Account takeover via lead OTP** — OTP goes to attacker's phone, then the session is issued for the user matching the *email* (can be an admin) | `backend/controllers/leadController.js:12-162` | Anyone can log in as any user incl. admin |
| C2 | **CORS trusts any `*vercel.app`, `*onrender.com`, `*localhost*` origin with credentials** (substring match) | `backend/server.js:99-118` | A malicious site can read leads/admin data using a logged-in admin's cookie |
| C3 | **Public `/api/events` returns every registrant's name, email, phone** (`attendees[]`) | `backend/controllers/eventController.js:11-60` | PII leak of all event registrants |
| C4 | **Stored XSS in admin**: lead name and support-request name/message rendered as raw HTML in admin email preview / sent mail view | `admin/src/pages/Leads.jsx:144,1850`, `SupportRequests.jsx:593,1454` | Public form → script runs in admin → steals admin token + SMTP password |
| C5 | **Mentor studio takeover**: `POST /api/unicoach/mentors` with victim mentor's email claims the profile; `mentorAuth` also re-links already-owned studios by email/phone | `backend/unicoach/controllers/mentorController.js:46-80`, `middlewares/mentorAuth.js` | Attacker swaps in their bank account → Route payouts go to attacker |
| C6 | **Paid digital product downloadable without paying** (file URL exposed on unpaid booking via `/queries/:ref`) | `backend/unicoach/controllers/bookingController.js:498,571` | Free access to paid files |
| C7 | **Hardcoded JWT secret fallback** `'unicoach_super_secure_jwt_secret_2026'` in 5 files | `middleware/auth.js:4`, `authController.js:9`, `leadController.js:6`, `routes/ai.js:7`, `unicoach/middlewares/mentorAuth.js:7` | If `JWT_SECRET` env is ever missing → anyone forges admin tokens |
| C8 | **Settings API returns all secrets** (SMTP pass, Twilio, WABA, Cloudinary) to the browser; Gmail app password stored in `localStorage` | `adminSettingsController.js:13`, `admin/src/pages/SupportRequests.jsx:590` | Combined with C4 → every integration credential leaks |

### Pages that crash (ReferenceError — confirmed by ESLint `no-undef`)
| # | Page | Cause |
|---|---|---|
| C9 | `/study-abroad/uk/courses/masters` | `UCLLogo`, `LeedsLogo` not imported (`UKMastersPage.jsx:36,47`) — crashes on load |
| C10 | `/exams/duolingo/{australia,canada,uk,ireland,germany}` | `motion`, `AnimatePresence` not imported (`DuolingoAcceptedCountry.jsx:418`) |
| C11 | `/exams/gmat` | `Sparkles` not imported (`GMATOverview.jsx:668`) |
| C12 | `/study-abroad/germany/.../why-study` | `Clock` not imported (`why-study/page.jsx:142`) |
| C13 | Student dashboard → "Eligibility Calculator" tab | `EligibilityCalculatorPage` not imported (`UserDashboard.jsx:2885`) |

### Login/session
| # | Issue | Where |
|---|---|---|
| C14 | **After a page reload, logged-in features silently fail (401)** — token becomes the placeholder `'cookie-session'`, calls send `Bearer cookie-session` without `credentials:'include'`. Saved universities fall back to localStorage while the toast says "Saved". | `frontend/src/context/AuthContext.jsx:41` + shortlisters, dashboard |

---

## 🟠 High

| # | Issue | Where |
|---|---|---|
| H1 | OTP verify endpoints have no rate limit / attempt counter → 6-digit OTP brute-forceable | `server.js:173`, `/api/auth/verify-otp`, `/api/leads/verify-otp` |
| H2 | OTPs printed to production logs in plaintext | `utils/twilio.js:60`, `authController.js:319`, `leadController.js:102,211` |
| H3 | Upload filter uses OR (ext *or* mimetype) → `.html`/`.js`/`.svg` accepted and served from API origin → XSS | `routes/upload.js:20-41` |
| H4 | Admin login has no brute-force limit; seed script default password `admin123` | `routes/adminAuth.js:7`, `scripts/seedAdmin.js:25` |
| H5 | Register trusts unverified email/phone (`isEmailVerified: true`) → links mentor profiles / pre-hijacks accounts later linked by Google | `authController.js` register |
| H6 | Admin and student share one `token` cookie and cookie beats Bearer → logging into the student site breaks the admin panel (403 loop) and vice-versa | `middleware/auth.js:13` |
| H7 | `GET /admin/stats` **writes** to DB: randomly reassigns unassigned leads to fake counsellors, seeds fake SMS logs on every dashboard load | `adminStatsController.js:16-46` |
| H8 | Bulk messaging: `{{student_name}}` variables never replaced (backend expects `{name}`); manual CSV recipients always 400; WhatsApp template fields dropped | `adminMessagingController.js:9,110`, `BulkMessaging.jsx:126`, `WhatsAppHub.jsx:292` |
| H9 | Bulk send fires with one click, audience count shown is wrong; lead delete has no confirmation | `BulkMessaging.jsx:275`, `EmailHub.jsx:319`, `Leads.jsx:771` |
| H10 | Payments: captured payment for a cancelled booking is never refunded; anyone can cancel any reservation by `bookingRef` | `unicoach/services/paymentService.js:192`, `bookingController.js:370` |
| H11 | Coupons: `maxUses` not enforced (only checked at reserve) → one 100% coupon reusable many times | `unicoach/controllers/bookingController.js:234,439` |
| H12 | Mentor can mark a session COMPLETED before it happens (releases payout early); `answerPriorityDM` has no state check | `unicoach/controllers/mentorController.js:520,1059` |
| H13 | 1:1 checkout never sends the coupon code to the server → student sees discount, Razorpay charges full price | `frontend/src/unicoach/hooks/useReservation.js:49` |
| H14 | Two different API base URLs across the frontend (`config.js` vs ~30 inline copies) → on unicoach.in, login and mentor dashboard hit different servers | `frontend/src/config.js` + inline `API_URL`s |
| H15 | Cross-site cookie (vercel.app ↔ onrender.com) → Safari/Firefox/Brave users logged out on every reload | deployment setup |
| H16 | "Save" after login prompt reopens the login modal and doesn't save | Scholarship/University shortlisters, Eligibility page |
| H17 | Logged-in "Free Counselling Call" sends empty phone → 400, lead lost, but UI shows "Confirmed" | `EligibilityModal.jsx:168` |
| H18 | Contact form always shows success, even when the lead wasn't saved; posts to `localhost` in production | `ContactPage.jsx:184-253` |
| H19 | Response cache keyed on full URL incl. random query → memory exhaustion DoS | `utils/cache.js` |

## 🟡 Medium (selection)
- `express-mongo-sanitize` runs **before** `express.json()` → JSON bodies never sanitised (`server.js:76` vs `:132`).
- Unescaped user input in `RegExp` (ReDoS / 500s): courses, universities, scholarships, blogs, news, mentor directory.
- `book-consultation` overwrites an existing lead's name/email without OTP.
- Public support-request endpoint = open email relay with HTML injection.
- JWTs never re-checked against DB (deleted users / demoted admins keep access 7 days).
- SMS pumping risk (any country code, auto-creates users).
- SMTP `rejectUnauthorized: false`.
- Any logged-in user can create public Scholarship records.
- Admin can delete themselves / other admins; template create silently overwrites same-name template.
- Admin "features" that report success but do nothing: WhatsApp inbox reply, Meta template sync, Workflows.
- Course edits look like they failed for 5 min (cache not cleared).
- Route transfer timeout → possible double payout on retry; slot double-booking via stale `bookingId`; course-page booking has no slot/overlap check; refund after Razorpay auto-release may fail.
- Verification documents (student IDs) uploadable without login and publicly readable in `/uploads/unicoach`.
- Reservation timer expiring during Razorpay checkout → verify never called (student paid, UI error).
- Lead-OTP login: cookie discarded, token stored where nothing reads it.
- Expired session can't reach the login page (redirect race).
- University shortlister offline fallback throws (`matchesUniversitySearch` not imported).
- SOP page "Book Free Counselling" does nothing (`navigate` undefined); USA masters page throws on search (`setCurrentPage` undefined).
- Unsanitised CMS HTML in blogs/newsroom/events pages.
- AI tools never send auth; study roadmap fires 2–3 paid AI calls per visit.
- `DynamicUniversityPage.jsx:18` and `ScholarshipShortlister.jsx:239` call a hook conditionally (rules-of-hooks).

## ⚪ Low (selection)
- `/api/debug-sentry` is public; internal error messages returned to clients; forgot-password reveals which emails exist.
- `DELETE /ielts/history` unreachable (route order); unhandled promise in scholarships controller.
- Apply page shows `localhost:5173/@handle`; dashboard button navigates to `/study-abroad/contact` ("Country not found").
- Logout leaves previous user's saved lists / mentor handle in localStorage.
- Same "Trusted Pro 2024 / Elite Advisor 2024" badges on every mentor.
- Password-reset email links hardcoded to `unicoach-blush.vercel.app`.
- 1,757 unused-variable lint errors (no runtime impact, but hide real errors).

---

## Already fixed today (in the working tree, not yet deployed)
- Google login: forged token login + unverified-email linking.
- Payments: confirm-without-pay, client-controlled simulator, price from client, webhook raw-body signature, PayPal removed.
- UniCoach admin routes now require admin login; public mentor profile no longer leaks bank/PAN/email/phone.
- Hero cards not clickable; events forcing wrong banners; events page images 404; home events showing past events first.

## Suggested order
1. **Today:** C1–C8 (security) + C9–C13 (crashing pages — 5-minute import fixes).
2. **This week:** C14 + H14/H15 (one `apiFetch` helper with `credentials:'include'` and one API base URL fixes most session bugs), H1–H13.
3. **Next:** Medium items, then clean up lint so new `no-undef` errors are visible.

# UniCoach System Overhaul — Step-by-Step Implementation Plan

Complete website structure finalization, instant loading optimization, dedicated tool page wiring, and admin panel functional controls.

## User Review Required

> [!IMPORTANT]
> The initial full-screen splash loader in `App.jsx` will be removed immediately so the website opens instantly. Route transitions will use a non-blocking top progress bar.

---

## Proposed Changes

### Phase 1: Performance & Loading Screen Removal
- Remove artificial delay / splash screen `Loader.jsx` from `frontend/src/App.jsx`.
- Enable instant mounting with lightweight non-blocking suspense fallback.

### Phase 2: Complete Website Structure & Tool Routing
- Create dedicated standalone tool pages / wrappers:
  1. `/universities` — Global University Explorer & Smart Shortlister
  2. `/scholarships` — Scholarship Finder & Live Deadline Countdown Tracker
  3. `/ai-tools/sop-generator` — AI Statement of Purpose Drafter & Polisher
  4. `/ai-tools/study-roadmap` — AI 6-Month Strategic Milestone Engine
  5. `/ai-tools/visa-prep` — AI Mock Visa Officer Interview Simulator
  6. `/ai-tools/ielts-evaluator` — AI IELTS Writing & Speaking Band Score Predictor
  7. `/ai-tools` — Central AI Tools Hub overview page
- Update `Navbar.jsx`:
  - Add prominent **"AI Tools & Shortlisting"** mega dropdown.
  - Link all standalone tools, calculators, and study abroad guides cleanly.
- Ensure SEO meta and breadcrumbs are in place for all tool routes.

### Phase 3: Admin Panel Full Functional Controls
- **Scholarships Management Module** (`admin/src/pages/Scholarships.jsx`):
  - Full CRUD interface (Add scholarship, edit deadlines, funding amount, country, requirements).
  - Connect to backend `/api/scholarships` and `/api/admin/content`.
- **University Management Enhancements** (`admin/src/pages/Universities.jsx`):
  - Live editing of rankings, fees, exams, intake dates, and featured flags.
- **Leads & Pipeline Management** (`admin/src/pages/Leads.jsx` & `PipelineBoard.jsx`):
  - Ensure status updating, counselor assignment, notes history, and CSV export work seamlessly with MongoDB.
- **Counselor Bookings & Time Slots** (`admin/src/pages/BookingCalendar.jsx`):
  - Manage slots, approve/reschedule appointments, view registered students.

### Phase 4: UI/UX & Quality Verification
- Verify all routes render without console errors.
- Test responsive layouts on mobile & desktop.
- End-to-end test lead capture and AI generation tools.

---

## Verification Plan

### Automated & Build Tests
- `npm run build` or Vite build check on `frontend/` and `admin/`.
- Verify backend API endpoints respond with 200 OK.

### Manual Verification
- Navigate through all navbar links and tool routes.
- Verify instant site load (zero blocking splash screen).
- Test admin panel creating and editing scholarships, universities, and updating lead stages.

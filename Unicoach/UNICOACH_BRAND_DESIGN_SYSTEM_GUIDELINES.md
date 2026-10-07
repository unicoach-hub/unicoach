# 📘 UniCoach — Official Brand Identity & Design System Guidelines
> **Version:** 1.0 (Production Release)  
> **Status:** Approved Standard  
> **Target Audience:** Engineering, UI/UX Design, Product Management & Marketing  
> **Repository:** `c:\unicoach`

---

## 1. 🏛️ Brand Vision, Personality & Voice

UniCoach is an AI-powered, high-trust global education consultancy and platform. It democratizes international admissions for students by replacing opaque, high-fee traditional agents with **transparent data, intelligent AI tools, verified scholarships, and 100% free expert counseling.**

### Brand Personality Pillars
1. **Authoritative & Trustworthy:** We handle life-defining decisions (₹25L–₹50L investments). We never use loud, cheap gimmicks or noisy animations.
2. **Cutting-Edge & Modern (AI-Driven):** We provide instant AI SOP generation, live visa mocks, and algorithmic shortlisting.
3. **Approachable & Empathetic:** Navigating foreign visas and exams is stressful. Our interface feels calm, reassuring, and clear.

### Voice & Tone
* **Confident, not boastful:** "98.7% Visa Approval Rate backed by 12,000+ counselled students."
* **Direct & Action-Oriented:** "Check Free Eligibility" instead of "Submit Form".
* **Clear, not academic:** Simple conversational English with high scannability.

---

## 2. 🎓 Logo Specifications & Brand Mark Rules

The UniCoach logo is the primary visual anchor of our company. It features a bold geometric wordmark (**"UniCoach"**) crowned with an iconic **Graduation Cap (Mortarboard & Tassel)** poised over the letter **"i"**, symbolizing academic elevation, global degrees, and student success.

### 2.1 Logo Color Formats

| Variant | Appearance | Background Allowed | Primary Color Tokens | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Wordmark (Standard)** | Deep Oxford Navy / Slate Navy text with Graduation Cap | Pure White (`#FFFFFF`) or Soft Canvas (`#F8FAFC`) | `#0B2068` (Deep Oxford Navy) or `#0F172A` (Slate Navy) | Main Navbar, light-theme marketing materials, official documents |
| **Digital Tech Variant** | Dual-Tone Wordmark (Navy "Uni" + Royal Blue "Coach") | Pure White (`#FFFFFF`) or Soft Blue (`#EFF6FF`) | `#0F172A` (Navy) + `#1868F8` (Royal Blue) | App dashboards, digital product banners, pitch decks |
| **Inverted / Reverse Mark** | 100% Pure White Wordmark with glowing tassel | Dark Slate Navy (`#0F172A`), Deep Blue, or Dark Hero banners | `#FFFFFF` (Pure White) + `#60A5FA` / `#1868F8` accent | Global dark Footer, inverted hero banners, dark-mode screens |
| **App Icon / Favicon Mark** | Rounded-corner square (`rounded-2xl`) with White "U" + Graduation Cap | Anywhere (Browser tabs, App stores, Social avatars) | Container: `#1868F8` (Royal Blue), Mark: `#FFFFFF` | Browser favicon (16px, 32px), mobile app icon, social media profile |

### 2.2 Clear Space & Minimum Sizing
To preserve legibility and brand prestige, the logo must always breathe:
* **Clear Space Rule:** Maintain minimum exclusion padding around all sides of the logo equal to the height of the **Graduation Cap (X)** (minimum `16px`). No navigation links, buttons, or divider lines may enter this zone.
* **Minimum Height (Desktop):** `40px` to `44px` (`h-10` to `h-11`).
* **Minimum Height (Mobile):** `32px` to `36px` (`h-8` to `h-9`).
* **Minimum Icon Size (Favicon/Avatar):** `32px × 32px` for browser tabs, `48px × 48px` for mobile app launcher.

### 2.3 Strict Logo Don'ts (Misuse Rules)
* ❌ **NEVER** stretch, squish, or distort the aspect ratio of the logo.
* ❌ **NEVER** place the dark Navy logo on a dark background (always switch to the Inverted Pure White version).
* ❌ **NEVER** recolor the logo in random colors (e.g. red, yellow, pink, or green).
* ❌ **NEVER** add heavy drop shadows, outlines, or 3D bevels to the logo image.
* ❌ **NEVER** detach the graduation cap or reposition it to another letter.

---

## 3. 🎨 The Unified Color System (Design Tokens)

The UniCoach palette consists of **strictly 6 core roles**. Hardcoded random hex codes (`#2457FF`, `#3B82F6`, `#4F46E5`, `#9333EA`) are strictly deprecated.

### 2.1 Master Palette Table

| Token Role | Color Name | Hex Code | Tailwind Token | Accessibility (WCAG) | Primary Use Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Brand** | UniCoach Royal Blue | `#1868F8` | `bg-brand-primary` | 4.6:1 on White (AA) | Primary CTA buttons, key active links, brand icons, logo |
| **Primary Hover** | Deep Royal Blue | `#0B52D6` | `bg-brand-primaryDark` | 6.2:1 on White (AAA) | Button hover states, active menu highlights |
| **Secondary Accent** | Electric Indigo | `#6366F1` | `bg-brand-secondary` | Used with dark text / gradients | AI Suite features, gradient badges, tech accents |
| **Success / Trust** | Emerald Green | `#10B981` | `bg-brand-success` | 3.1:1 (Badges with dark text) | "100% Free", "Visa Approved", Open Scholarships |
| **Dark Neutral** | Slate Navy | `#0F172A` | `text-brand-navy` | 16.8:1 on White (AAA) | All Headings (H1, H2, H3, H4), high-contrast labels |
| **Muted Neutral** | Slate Grey | `#64748B` | `text-brand-muted` | 4.8:1 on White (AA) | Body paragraphs, secondary metadata, subheadings |
| **Border & Divider** | Crisp Slate Border | `#E2E8F0` | `border-brand-border` | Subtle structural lines | Card borders, table grid lines, form borders |
| **Surface (Card)** | Pure White | `#FFFFFF` | `bg-white` | Elevated surfaces | Cards, modals, dropdowns, sticky nav |
| **Page Canvas** | Soft Canvas | `#F8FAFC` | `bg-brand-bg` | Low eye-strain base | Main page background across all routes |

### 2.2 Functional Accent Gradients
* **Hero Tech Gradient:** `linear-gradient(135deg, #1868F8 0%, #6366F1 100%)`  
  *Usage: Primary high-impact conversion buttons, AI SOP badge headers.*
* **Atmospheric Blush (Background):** `radial-gradient(circle, rgba(24, 104, 248, 0.08) 0%, transparent 70%)`  
  *Usage: Soft background ambient lights behind Hero and Feature sections.*

### 2.3 Color Rules (Strict Do's and Don'ts)
* ❌ **NEVER** use pure `#000000` black for body text or headlines. Always use `#0F172A`.
* ❌ **NEVER** use red for neutral warnings. Only use `#EF4444` for critical input errors.
* ✅ **ALWAYS** use Emerald (`#10B981`) paired with light green background (`bg-emerald-50 text-[#10B981]`) for trust badges.

---

## 3. ✍️ Typography Hierarchy & Scales

UniCoach uses **exactly 2 font families** for optimal performance and unified visual rhythm.

### 3.1 Font Roles
1. **Display & Headings:** `Outfit` (Weights: 600 SemiBold, 700 Bold, 800 ExtraBold)  
   *Clean geometric sans-serif that looks modern, confident, and premium.*
2. **Body, UI & Form Controls:** `Plus Jakarta Sans` (Weights: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold)  
   *Engineered for screen reading and high legibility at 12px–16px.*
3. *(Optional for Numerical Metrics):* `Urbanist` (Weights: 800 ExtraBold)  
   *Used exclusively for large statistics (e.g., 98.7%, ₹24Cr+, 1500+).*

### 3.2 Modular Scale Specification

| Role | Font Family | Desktop Size / Line-Height | Mobile Size / Line-Height | Weight | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero H1** | Outfit | 52px / 1.1 (57px) | 38px / 1.15 (44px) | 800 ExtraBold | `text-4xl sm:text-5xl font-extrabold tracking-tight` | Main Hero statement only (1 per page) |
| **Section H2** | Outfit | 36px / 1.2 (43px) | 28px / 1.25 (35px) | 700 Bold | `text-2xl sm:text-4xl font-bold tracking-tight` | Major section titles across pages |
| **Card Title H3** | Outfit | 22px / 1.3 (28px) | 19px / 1.3 (25px) | 700 Bold | `text-lg sm:text-xl font-bold` | University names, AI feature cards, country cards |
| **Subtitle H4** | Outfit | 17px / 1.4 (24px) | 16px / 1.4 (22px) | 600 SemiBold | `text-base sm:text-lg font-semibold` | Subsection headers, modal headers |
| **Body Large** | Plus Jakarta Sans | 16px / 1.6 (26px) | 15px / 1.6 (24px) | 400 Regular | `text-base text-slate-600 leading-relaxed` | Hero subheadings, intro lead paragraphs |
| **Body Regular** | Plus Jakarta Sans | 14px / 1.5 (21px) | 14px / 1.5 (21px) | 400 / 500 | `text-sm text-slate-600 leading-normal` | Standard card descriptions, table rows, FAQ body |
| **Button Label** | Plus Jakarta Sans | 14px / 1.0 (14px) | 13px / 1.0 (13px) | 700 Bold | `text-sm font-bold tracking-wide` | CTAs, modal actions, filter triggers |
| **Meta / Caption**| Plus Jakarta Sans | 12px / 1.4 (17px) | 11px / 1.4 (15px) | 500 Medium | `text-xs text-slate-400 font-medium` | Timestamps, helper text, disclaimer notes |
| **Overline Tag** | Plus Jakarta Sans | 11px / 1.2 (13px) | 10px / 1.2 (12px) | 700 Bold | `text-[11px] uppercase tracking-wider font-bold`| Category chips ("STUDY ABROAD", "AI POWERED") |

---

## 4. 📐 Layout, Spacing & Container System

### 4.1 Master Container
* **Max Width:** `1440px` (`max-w-[1440px] mx-auto`)
* **Horizontal Gutters:**
  * Mobile (< 640px): `px-4` (16px)
  * Tablet (640px – 1023px): `px-6` (24px)
  * Desktop (≥ 1024px): `px-10` (40px)

### 4.2 8-Point Spacing Rhythm
Every margin and padding value must be a multiple of 4px / 8px:
* `gap-2` (8px) | `gap-3` (12px) | `gap-4` (16px) | `gap-6` (24px) | `gap-8` (32px) | `gap-12` (48px)
* Section Vertical Spacing:
  * Desktop: `py-16` or `py-20` (64px to 80px)
  * Mobile: `py-10` or `py-12` (40px to 48px)

---

## 5. 🔲 Surfaces, Elevation & Corner Radius

### 5.1 Corner Radius Rules
* **Pills & Badges:** `rounded-full` (9999px) — Used for status indicators and trust badges.
* **Buttons & Form Inputs:** `rounded-xl` (12px) — Friendly, modern, touch-friendly.
* **Cards & Panels:** `rounded-2xl` (16px) or `rounded-3xl` (24px) — Generous corners for modern edtech look.
* **Modals & Hero Blocks:** `rounded-[32px]` (32px) — Premium structural enclosure.

### 5.2 Layered Elevation (Shadow Tokens)
* **Subtle Card Rest:** `shadow-xs border border-[#E2E8F0]`  
  *Zero muddy dropshadows. Clean outline with 1px border.*
* **Hover Elevation:** `shadow-lg shadow-slate-900/[0.06] -translate-y-1 transition-all duration-200`  
  *Smooth micro-interaction on cards and interactive elements.*
* **Primary Button Glow:** `shadow-lg shadow-[#1868F8]/25`  
  *Gives glowing prominence to the primary CTA.*

---

## 6. 🧩 Core Component Specifications

### 6.1 Buttons
1. **Primary CTA Button:**
   ```jsx
   <button className="px-6 py-3.5 rounded-xl bg-[#1868F8] hover:bg-[#0B52D6] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#1868F8]/25 hover:-translate-y-0.5 transition-all flex items-center gap-2">
     <span>Check Free Eligibility</span>
     <ArrowRight size={16} />
   </button>
   ```
2. **Secondary / Outline Button:**
   ```jsx
   <button className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] hover:border-[#1868F8] font-bold text-sm tracking-wide transition-all">
     <span>Explore AI Tools</span>
   </button>
   ```
3. **Trust Pill Badge:**
   ```jsx
   <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
     <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
     <span className="text-xs font-bold text-[#10B981] uppercase tracking-wide">100% Free Counseling</span>
   </div>
   ```

### 6.2 Form Inputs & Dropdowns
* **Height:** `48px` (h-12) for effortless desktop & mobile touch target.
* **Border:** `border border-[#E2E8F0]` resting, `border-[#1868F8] ring-2 ring-[#1868F8]/10` on focus.
* **Background:** `#FFFFFF` or `#F8FAFC`.
* **Label:** `text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5`.

---

## 7. 📄 Standard Sub-Page Layout Architecture (The Master Template)

Every subpage across UniCoach (Country Overview, Exam Guide, Course Detail, University Page) must adhere to this predictable 6-stage layout:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. GLOBAL NAVBAR                                                       │
├────────────────────────────────────────────────────────────────────────┤
│ 2. STANDARDIZED PAGE HERO & BREADCRUMBS                                │
│    [Home] > [Study Abroad] > [USA]                                     │
│    • H1: Study in USA for Indian Students (Fall 2027 Guide)           │
│    • Meta Pills: Top 150 Universities • 3-Yr STEM OPT • ₹18L-₹35L Fees │
├────────────────────────────────────────────────────────────────────────┤
│ 3. 2-COLUMN MAIN BODY GRID                                             │
│    ┌──────────────────────────────────────┬───────────────────────────┐│
│    │ LEFT COLUMN (65% Width)              │ RIGHT COLUMN (35% Width)  ││
│    │ • Overview & Key Quick Facts         │ • STICKY LEAD CAPTURE     ││
│    │ • Top Universities Table with Fees   │   WIDGET                  ││
│    │ • Admission Requirements & Intakes   │   "Get Shortlist in 2m"   ││
│    │ • Scholarships & Post-Study Visas    │ • Counselor Direct DM     ││
│    │ • Step-by-Step Application Timeline  │ • Instant WhatsApp Link   ││
│    └──────────────────────────────────────┴───────────────────────────┘│
├────────────────────────────────────────────────────────────────────────┤
│ 4. TOPIC-SPECIFIC FAQS (Accordion 4–6 Questions)                       │
├────────────────────────────────────────────────────────────────────────┤
│ 5. STANDARDIZED BOTTOM CTA STRIP                                       │
│    "Ready to Begin Your Global Journey? Talk to a Senior Counsellor"   │
├────────────────────────────────────────────────────────────────────────┤
│ 6. GLOBAL FOOTER                                                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. ✅ Design QA Checklist for Developers & Designers

Before any pull request or page update is approved:
- [ ] Are all headlines using `font-heading` (`Outfit`) and colored `#0F172A`?
- [ ] Is all body text using `Plus Jakarta Sans` and colored `#64748B`?
- [ ] Are all primary action buttons colored `#1868F8`?
- [ ] Are all trust badges colored with `#10B981` (Emerald)?
- [ ] Is the page wrapped inside `.max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10`?
- [ ] Are all card borders using `#E2E8F0` with `rounded-2xl`?
- [ ] Does the page have a clear, persistent CTA for lead capture?

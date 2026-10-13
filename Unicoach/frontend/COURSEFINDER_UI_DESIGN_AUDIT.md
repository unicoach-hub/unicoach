# UniCoach Live Design Audit — binding reference for the CourseFinder UI

Captured from the **live site (unicoach.com)** on 2026-10-13 via computed-style extraction + full-page screenshots (desktop 1440 + mobile 390). Every CourseFinder feature we add (search, eligibility, compare, course detail) **must use this system** so it reads as native UniCoach, not a CourseFinder clone.

> ⚠️ **The repo's `UNICOACH_BRAND_DESIGN_SYSTEM_GUIDELINES.md` is STALE.** It documents an old **blue `#1868F8` + Outfit** system. The live site has been redesigned to a **warm orange + near-black, Plus Jakarta Sans / Inter** editorial system. **This audit (live) is authoritative.**

## 1. Color
| Role | Value | Notes |
|---|---|---|
| **Primary accent** | `#DE5C2B` (burnt orange) | CTAs, active states, emphasis word in headings, values, links. Tailwind `blue/indigo-600` are remapped to this. |
| Accent bright | `#ff6b00` | gradients / hover highlights (`purple-500` alias) |
| Accent deep | `#c2410c` | hover/pressed |
| Ink (headings/buttons) | `#111111` | near-black display + black pill buttons (marketing) |
| Body text | `#0F172A` (slate-900) | paragraphs/labels |
| Muted text | `#64748B` / slate-500/600 | secondary |
| Page canvas | `#F8FAFC` (slate-50) | app background; heroes add a faint warm/lavender wash + dot grid |
| Surface | `#FFFFFF` | cards, nav, inputs |
| Border | `#E2E8F0` / `#E5E7EB` (slate-200) | **always rendered at 0.8px**, often 0.6–0.9 alpha |
| Success | emerald `#10B981` on `emerald-50` | "admission odds", "fits budget", open status |
| Warning/award | amber on `amber-50` | merit-award chips |

## 2. Typography
- **Display headings:** `Plus Jakarta Sans` 700–800, tight tracking (`-1.7px` at 62px). Pattern: black heading with **one word in orange** (`Your Global Future Starts Here`, `…Scholarship Calculator`, `…Live Deadline Tracker`).
- **Body / UI:** `Inter` 16px / line-height ~1.65, letter-spacing `-0.176px`.
- **Logo wordmark:** `Archivo Black` ("UniCoach", black).
- **Overline / eyebrow:** 11px, UPPERCASE, tracked, orange, usually with a leading dot/award icon, inside a rounded-full white-bordered pill.
- Fallback stack: `"Inter","Plus Jakarta Sans",-apple-system,…`.

## 3. Layout & spacing
- Container **max-width 1440px**, centered. Horizontal pad: mobile `16px`, tablet `24px`, desktop `40px`.
- 4/8px rhythm. Section padding ~`64–80px` desktop / `40–48px` mobile.
- Nav: **fixed**, height **~81px**, white, **0.8px** hairline bottom border, no shadow.

## 4. Radius scale (exact, measured)
| Token | px | Used for |
|---|---|---|
| sm | **6px** | small meta tags (e.g. "Stanford" institution chips) |
| md | **12px** | buttons, filter pills, inputs, selects, black "Official Portal" btn |
| lg | **16px** | cards (hub), primary CTA, tabs, segmented controls |
| xl | **20px** | floating/bento cards |
| 2xl | **28px** | large result cards (eligibility university cards) |
| full | `9999px` | chips, badges, marketing hero pills, search bar |

## 5. Borders & elevation
- **Borders: `0.8px solid #E2E8F0`** everywhere (hairline). This is the signature — not 1px.
- **Outline-first / minimal shadows.** Cards often have *no* shadow, just the 0.8px border. Soft shadows reserved for floating elements:
  - Floating card: `0 10px 28px -12px rgba(15,23,42,0.22)` (cool-tinted, tight neg-spread).
  - Primary black pill (marketing): `0 10px 24px -4px rgba(0,0,0,0.28)`.
  - Primary orange CTA: orange glow `0 20px 25px -5px rgba(222,92,43,~0.25)`.
- **Active selection state** = orange border + **orange focus ring** (`0 0 0 2px rgba(222,92,43,0.2)`) + **peach tint fill** (very light orange @70%).

## 6. Component specs (measured on live)
| Component | Spec |
|---|---|
| **Primary button (app/content)** | bg `#DE5C2B`, white, 700, **radius 12px** (hub) / 16px (big CTAs), pad `10px 16px`→`18px`, orange glow shadow. Content-area default. |
| **Primary button (marketing hero)** | bg `#111`, white, 15px/700, **radius full** (pill), pad `14px 28px` + trailing circular-arrow icon, shadow `0 10px 24px -4px rgba(0,0,0,.28)`. |
| **Secondary button** | white bg, slate-900 text, **0.8px** light border, radius full/12px, pad `14px 24px`. |
| **Black utility button** ("Official Portal ↗") | bg slate-900 `#0F172A`, white, 12px/700, radius 12px, pad `12px 16px`. |
| **Filter / quick-filter pill** | active = bg `#DE5C2B` white 14px/700 radius 12px pad `8px 16px` h36 + orange soft shadow; inactive = white, 0.8px border, slate text (icon + label). |
| **Trust / feature chip** | rounded-full, white@90%, 0.8px border, pad `6px 14px`, gap 8px, icon (green check / orange dot) + label. |
| **Meta tag** | radius 6px, bg slate-100 `#F1F5F9`, slate-700 text, 11px/600, 0.8px border@0.6, pad `2px 8px` h24. |
| **Card (standard)** | bg white, **radius 16px**, 0.8px `#E2E8F0` border, clean (shadow ≈ `0 1px 0 rgba(0,0,0,.05)`), inner pad ~20–24px. |
| **Result card (rich)** | bg white, **radius 28px**, 0.8px slate-200 border, **no shadow**, pad 28px. |
| **Input / select** | white, 0.8px border, radius 12px, 14–16px text, inner pad ~`10–12px`; focus → orange border + ring. |
| **Segmented control** | option radius 16px; active = orange 0.8px border + orange ring + peach tint; inactive = transparent/slate. |
| **Tabs (result categories)** | pill container slate-50 w/ 0.8px border radius 16px; active tab = orange fill (Safe Admits / All Destinations). |
| **Stepper** | 2-step rounded-2xl; active step = orange fill white text, inactive = slate text on slate-50. |
| **Status chips** | green (emerald-50 / `#10B981`) for odds/budget-fit/open; amber (amber-50) for merit awards. |

## 7. Motion & quality bar
- **Lenis** smooth scroll (site-wide inertia). **Framer-motion** for entrance/stagger/hover (cards lift, `-translate-y-1`, 150–200ms). `jspdf`/`xlsx` already used for exports; `qrcode` for QR.
- Floating **UniBot AI** launcher (orange gradient, bottom-right) on every page.
- Quality feel: warm, premium, editorial, airy. Generous whitespace, hairline borders, restrained shadows, one accent colour used decisively.

## 8. How CourseFinder features map onto existing UniCoach UI (reuse, don't reinvent)
| CourseFinder feature | Build on UniCoach's existing pattern |
|---|---|
| Faceted **Search Programs** | the `/study-abroad` hub: rounded-full search bar + **orange/white filter pills** (= CourseFinder highlights) + card grid |
| **Result cards** (programs/unis) | the country/eligibility **result card** (radius 16–28px, label/value rows w/ orange values, meta tags, status chips, orange CTA + bookmark) |
| **Eligibility** (Eligible/Non-Eligible) | the `/eligibility-calculator` flow: parameter form (segmented level + selects + sliders) → dark result band → **Safe/Target/Dream/Matching tabs** (richer than CF's Eligible/Non-Eligible) with admission-odds + budget-fit + merit chips |
| **Quick-filter counts** | filter pills with trailing count, orange active |
| **Compare / Download** | existing `jspdf`/`xlsx`; black utility buttons + white cards |
| **Course detail** | `/course-details` page sections (keep UniCoach section cards, orange values, meta tags) |
| **AI "Explain Fit"/assistant** | UniBot pattern + the "Explain Fit (AI) ✨" outline button already on result cards |

**Net:** we feed the accurate CourseFinder data + engine (`/api/search`) into UniCoach's **already-excellent** study-abroad + eligibility UI. No visual language changes — only data accuracy and engine depth improve.

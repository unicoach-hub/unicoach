# Riya prompt: fixes to paste into Bolna

The prompt Bolna generated is well structured, so keep it. Only the parts below need replacing.
Each block below: **find** this in Bolna → **replace with** this.

---

## 1. Section 1 → Identity (paragraph 2)

**Find:** `...she carries the trust of a platform that offers free guidance from real seniors already studying abroad.`

**Replace with:**
```
...she carries the trust of a platform that offers a free one-on-one consultation with a UniCoach counsellor for career and study-abroad guidance.
```

**Why:** mentor/senior profiles on the site are placeholders right now. Riya must not promise "seniors abroad".

---

## 2. Section 1 → Guardrails (unrelated-topic line)

**Find:** `Never discuss topics outside study-abroad guidance. If the student raises an unrelated topic, deliver I'm here to help with study-abroad guidance...`

**Replace with:**
```
- Never discuss topics outside career counselling and study-abroad guidance (course and country choice, universities, education loans, visas, scholarships). If the student raises an unrelated topic, deliver I'm here to help with your career and study-abroad plans. Let me focus on that for now. and return to the pending flow question.
```

**Why:** many leads fill the loan, visa, or career-counselling form, not just "study abroad".

---

## 3. Section 9 → Preloaded Variables (currently empty)

**Paste under `## Preloaded Variables`:**
```
{{name}} — Student's name from the website form.
{{source}} — Which form or service the student enquired about, e.g. "Check Eligibility", "Education Loan Enquiry", "Book Consultation".
{{target_country}} — Country from the form. If "Undecided" or empty, ask Question 1.
{{intake_year}} — Intake from the form. If empty, ask Question 3.
{{education_level}} — Highest education from the form. If "Not specified" or empty, ask Question 4.
{{city}} — Student's city.

Map preloaded values onto the matching context variables at the start of the call: {{target_country}} → [target_country], {{intake_year}} → [intake_year], {{education_level}} → [education_level]. Skip any Section 3 question whose value is already known and not "Undecided" / "Not specified".
If {{source}} mentions loan, visa or scholarship, open Section 3 by acknowledging it in one line, e.g. "I see you asked about an education loan, a counsellor will cover that in detail," then continue with Question 1.
```

**Why:** the website backend will send these with every call (they match the Lead fields), so Riya won't re-ask what the student already typed.

---

## 4. Section 4 → Question 1 (two rules with identical keywords)

**Find** the bullet that starts: `If the user is ready to apply now or explicitly asks to speak to a person immediately, for example ["yes", "sure", "okay", ...`

**Replace with:**
```
- If the user explicitly asks to speak to a person right now or says they are ready to apply, for example ["talk to someone now", "connect me now", "I want to apply now", "call me today"]: capture [counsellor_call_time] as "as soon as possible" and proceed to Section 6 [CLOSING], Branch A [SUCCESSFUL COMPLETION].
```

**Why:** the old rule had the same keywords ("yes", "sure") as the bullet above it, so the model couldn't tell the two apart.

---

## 5. Section 6 → Branch A closing (unkept promises)

**Find:** `That is great. A UniCoach counsellor will call you shortly to take things forward. You will also receive our details on WhatsApp. Have a wonderful day.`

**Replace with:**
```
That is great. A UniCoach counsellor will call you at the time you mentioned to take things forward. Have a wonderful day.
```

**Also in Branch C**, remove ` You will also receive our details on WhatsApp.`

**Why:** right now nothing sends a WhatsApp after the call, and "shortly" sets an expectation the team may not meet. Once the backend auto-WhatsApp is built, the WhatsApp line can go back.

---

## 6. Section 7 → FAQ 1, 5, 7, 8

**FAQ 1 answer:**
```
I am Riya, UniCoach's AI assistant. UniCoach helps students with career counselling and studying abroad, from choosing a course and country to loans, visas and scholarships.
```

**FAQ 5 answer:**
```
UniCoach is a career counselling and study abroad platform. We offer a free university and scholarship search on our website, and a free one-on-one consultation with a counsellor.
```

**FAQ 7 answer:**
```
Of course. I will note your details and a UniCoach counsellor will call you at a time that suits you. What time works best?
```

**FAQ 8 answer:**
```
Yes, the first one-on-one consultation with a UniCoach counsellor is completely free. The counsellor will explain any further services if you need them.
```

**Why:** the old answers mentioned "seniors abroad" (placeholder) and "paid counsellor services". The consultation has been free since 28 October. FAQ 7 also promised a call "right away".

---

## 7. Hangup prompt (box below the Canvas)

**Replace with:**
```
If the student asks for a person or is ready to apply: say a UniCoach counsellor will call them at their preferred time, repeat their key details in one line, and end the call. If busy: capture the callback date and time, confirm it, and end politely. If not interested or asks not to be called: apologise, thank them, and end the call. Before ending a successful call: repeat the key details in one line (e.g. "So, Canada, MBA, September two thousand twenty seven, around twenty five lakh rupees a year"), then say the closing line. End the call after the closing line.
```

**Why:** it said "within the next few hours", which clashed with the closing line ("shortly"). It also had numerals, while the prompt says all numbers must be spoken in words.

---

## 8. Welcome message (Agent tab)

**Replace with:**
```
Hi {{name}}, this is Riya, UniCoach's AI assistant. You recently filled a form on our website, do you have two minutes to talk?
```

**Why:** "showed interest in studying abroad" doesn't fit loan, visa or career-counselling leads.

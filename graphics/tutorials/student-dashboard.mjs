// Student dashboard "first steps" tutorial. Usage: FFMPEG=... node student-dashboard.mjs OUT_DIR
// Logs in as a made-up demo student; every /api call is answered here in the browser
// (nothing reaches the server), so profile saves and task ticks only change the demo state.
import { record, introCard, outroCard } from './kit.mjs';

const OUT = process.argv[2];
const state = {
  user: {
    _id: 'demo-aarav', id: 'demo-aarav', name: 'Aarav Sharma', email: 'aarav.demo@example.com', role: 'student',
    dreamCountry: '', dreamCourse: '', targetExam: '', targetScore: '', highestEducation: '', currentCity: '', preferredIntake: '',
  },
};

await record({
  name: 'student-dashboard',
  outDir: OUT,
  ffmpeg: process.env.FFMPEG,
  setup: {
    script: (u) => {
      localStorage.setItem('user_info', JSON.stringify(u));
      localStorage.setItem(`uc_tour_done:student:${u._id}`, '1');
    },
    arg: state.user,
  },
  mock: async (req) => {
    const u = req.url();
    if (!/\/api\//.test(u)) return null;
    const body = () => { try { return JSON.parse(req.postData() || '{}'); } catch { return {}; } };
    if (/\/auth\/me/.test(u)) return { body: { success: true, user: state.user } };
    if (/\/writing\/(profile|checklist)/.test(u)) { state.user = { ...state.user, ...body() }; return { body: { success: true, user: state.user } }; }
    if (/\/student-chat\/unread/.test(u)) return { body: { unread: 1, last: null } };
    if (/\/saved-universities/.test(u)) return { body: { savedUniversities: [] } };
    return { body: { success: true, data: [] } };
  },
  run: async (t) => {
    const p = t.page;
    await p.goto('https://www.unicoach.com/dashboard', { waitUntil: 'networkidle' });
    await t.wait(1200);
    const logo = await t.logo();
    await t.card(introCard(logo, 'STUDENT DASHBOARD · FIRST STEPS', 'Your first steps on UniCoach', 'Do these once and your dashboard keeps you on track, from shortlist to visa.'));
    await t.start();
    await t.wait(3200);
    await t.hideCard(700);
    await t.moveTo([640, 360], 10);

    // 1. profile
    await t.caption(1, 'First, complete your profile: country, course and exam');
    const nav = (k) => p.locator(`[data-tour="${k}"]`).first();
    await t.click(nav('nav-profile'));
    await t.wait(900);
    const country = p.locator('button:has-text("Select Dream Country")').first();
    await t.scrollTo(country, 'center', 900);
    await t.click(country);
    await p.locator('input[placeholder="Search 160+ countries..."]').pressSequentially('United K', { delay: 90 });
    await t.wait(500);
    await t.click(p.getByRole('button', { name: /United Kingdom/ }).last());
    await t.wait(500);
    const course = p.locator('button:has-text("e.g. MS in Computer Science")').first();
    await t.click(course);
    await p.locator('input[placeholder="Search or type custom course..."]').pressSequentially('MSc Data Science', { delay: 80 });
    await t.wait(400);
    await p.keyboard.press('Enter');
    await t.wait(500);
    const exam = p.locator('button:has-text("Select Exam")').first();
    await t.click(exam);
    await t.wait(300);
    await t.click(p.locator('button').filter({ hasText: 'International English' }).first());
    await t.wait(400);
    await t.type(p.locator('input[placeholder="e.g. 7.5 or 320"]'), '7.0', 120);
    await t.type(p.locator('input[placeholder="e.g. Bachelor of Technology"]'), 'B.Tech', 90);

    // 1b. save
    await t.caption(1, 'Add your intake, then save. That is step one done');
    const intake = p.locator('input[placeholder="e.g. Fall 2027"]');
    await t.scrollTo(intake, 'center', 900);
    await t.type(intake, 'Fall 2027', 90);
    const save = p.getByRole('button', { name: /Save Profile Details/ });
    await t.scrollTo(save, 'center', 800);
    await t.click(save);
    await t.wait(1600);

    // 2. overview: target + readiness
    await t.caption(2, 'Your dashboard now shows your target and how ready you are');
    await t.click(nav('nav-overview'));
    await t.wait(800);
    await t.scrollTo(p.locator('text=Ready to apply').first(), 'center', 900);
    await t.ring(p.locator('text=Target destination').first().locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), 6);
    await t.wait(1600);
    await t.ring(p.locator('text=Ready to apply').first().locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), 6);
    await t.wait(1600);
    await t.hideRing();

    // 3. roadmap tasks
    await t.caption(3, 'Follow your roadmap and tick each task when it is done');
    await t.click(nav('nav-daily-tasks'));
    await t.wait(1200);
    const box = p.locator('button[aria-label*="complete" i], button[title*="complete" i], input[type="checkbox"]').first();
    if (await box.count()) { await t.scrollTo(box, 'center', 800); await t.click(box); await t.wait(1200); }
    else { await t.wait(1800); }

    // 4–6. tools in the sidebar: scroll the page back up so the sidebar is in view, then point at each one
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await t.wait(900);
    const show = async (n, text, keys) => {
      await t.caption(n, text);
      for (const k of keys) {
        const el = nav(k);
        await el.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await t.wait(700);
        await t.ring(el, 4);
        await t.moveTo(el, 650);
        await t.wait(1000);
      }
      await t.hideRing();
    };
    await show(4, 'Shortlist courses and scholarships that fit you', ['nav-course-finder', 'nav-scholarships']);
    await show(5, 'Write your SOP with AI and practise your visa interview', ['nav-sop-builder', 'nav-visa-mock']);
    await show(6, 'Stuck? Message your counsellor or book a free 1:1 call', ['nav-messages', 'nav-talk-expert']);

    // outro
    await t.hideCaption();
    await t.card(outroCard(logo, 'Start with your profile', 'unicoach.com/dashboard', 'Sign up free. Your counsellor sees your progress and helps at every step.'));
    await t.wait(3600);
  },
});

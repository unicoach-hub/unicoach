// Course Finder tutorial (~60s). Usage: FFMPEG=... node course-finder.mjs OUT_DIR
import { record, introCard, outroCard, loadVoice } from './kit.mjs';

const OUT = process.argv[2];
await record({
  name: 'course-finder',
  outDir: OUT,
  ffmpeg: process.env.FFMPEG,
  // search endpoints are POST but read-only; everything else that writes is blocked
  allowPost: /\/search\/(courses|universities|eligibility)(\?|$)/,
  voice: loadVoice('course-finder'),
  run: async (t) => {
    const p = t.page;
    await p.goto('https://www.unicoach.com/search-programs', { waitUntil: 'networkidle' });
    await t.wait(600);
    const logo = await t.logo();
    await t.card(introCard(logo, 'COURSE FINDER · 1-MIN TOUR', 'Find your course in a minute', '98,000+ programs. Search and shortlist free, sign in only to download.'));
    await t.start();
    await t.wait(500);
    await t.sayCard('intro');
    await t.waitVoice(300);
    if (!t.voiced) await t.wait(2700);
    await t.hideCard(700);
    await t.moveTo([700, 300], 10);

    // 1. search box
    const input = p.locator('input[placeholder="Program or university"]');
    await t.say('1', 1, 'Type the course or university you want');
    await t.type(input, 'Data Science');
    await t.wait(1500);
    await p.keyboard.press('Escape');
    await t.wait(400);

    // 2. state
    const state = p.locator('select').nth(2);
    await t.say('2', 2, 'Pick your state. Nationality is already set to India');
    await t.ring(state, 6);
    await t.click(state, { real: false });
    await state.selectOption({ label: 'Maharashtra' });
    await t.wait(1100);
    await t.hideRing();

    // 3. quick filter
    const chip = p.locator('button:has-text("Scholarship Available")').first();
    await t.say('3', 3, 'Need funding? Tap a quick filter like Scholarship Available');
    await t.scrollTo(chip, 'center', 1100);
    await t.click(chip);
    await t.wait(1000);

    // 4. search
    const go = p.getByRole('button', { name: 'Search', exact: true });
    await t.say('4', 4, 'Press Search');
    await t.scrollTo(go, 'center', 1000);
    await t.click(go);
    await p.waitForLoadState('networkidle').catch(() => {});
    await t.wait(2200);

    // 5. what each result shows
    const view = p.locator('button:text-is("View"), a:text-is("View")').first();
    const card = view.locator('xpath=ancestor::div[.//*[contains(text(),"Tuition")]][1]');
    await t.say('5', 5, 'Each program shows tuition, intakes and average scholarship');
    await t.scrollTo(card, 'center', 1100);
    await t.ring(card, 6);
    await t.moveTo(card.locator('text=/Tuition/').first(), 800);
    await t.wait(2400);
    await t.hideRing();

    // 6. shortlist with the tick boxes
    await t.say('6', 6, 'Tick the ones you like. Shortlisting is free');
    await t.tickBoxes(2);
    const bar = p.locator('text=/Programs? selected/').first();
    await t.ring(bar, 8);
    await t.wait(1800);
    await t.hideRing();

    // 7. details and download need a free sign-in
    const exportBtn = p.getByRole('button', { name: /^Export/ }).first();
    await t.say('7', 7, 'Sign in free to open full details and download your list');
    await t.scrollTo(exportBtn, 'center', 1000);
    await t.ring(exportBtn, 6);
    await t.moveTo(exportBtn, 800);
    await t.wait(1500);
    const view2 = p.locator('button:text-is("View"), a:text-is("View")').first();
    await t.ring(view2, 6);
    await t.moveTo(view2, 800);
    await t.wait(1600);
    await t.hideRing();

    // outro
    await t.waitVoice(300);
    await t.hideCaption();
    await t.card(outroCard(logo, 'Search free. Shortlist free.', 'unicoach.com/search-programs', 'Stuck choosing? Book a free 1:1 call with a UniCoach mentor.'));
    await t.sayCard('outro');
    await t.waitVoice(900);
    if (!t.voiced) await t.wait(3600);
  },
});

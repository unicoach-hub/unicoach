// Scholarships tutorial (~1 min). Usage: FFMPEG=... node scholarships.mjs OUT_DIR
import { record, introCard, outroCard } from './kit.mjs';

const OUT = process.argv[2];
await record({
  name: 'scholarships',
  outDir: OUT,
  ffmpeg: process.env.FFMPEG,
  allowPost: /\/search\/(courses|universities|eligibility)(\?|$)/,
  run: async (t) => {
    const p = t.page;
    await p.goto('https://www.unicoach.com/search-programs?highlight=scholarship', { waitUntil: 'networkidle' });
    await t.wait(800);
    const logo = await t.logo();
    await t.card(introCard(logo, 'SCHOLARSHIPS · 1-MIN TOUR', 'Find scholarships you qualify for', '30,000+ programs offer an award. See only the ones whose entry rules you meet.'));
    await t.start();
    await t.wait(3200);
    await t.hideCard(700);
    await t.moveTo([640, 300], 10);
    const sel = (i) => p.locator('select').nth(i);

    // 1. what you want
    await t.caption(1, 'Pick the country and level you want to study');
    await t.scrollTo(sel(0), 'center', 900);
    await t.click(sel(0), { real: false });
    await sel(0).selectOption({ label: 'United Kingdom' });
    await t.wait(700);
    await t.click(sel(1), { real: false });
    await sel(1).selectOption({ label: 'PG' });
    await t.wait(900);

    // 2. subject
    await t.caption(2, 'Add a subject if you have one in mind');
    await t.type(p.locator('input[placeholder="e.g. Data Science"]'), 'Data Science');
    await t.wait(900);

    // 3. about you
    await t.caption(3, 'Now about you: your state and highest qualification');
    await t.scrollTo(sel(3), 'center', 1000);
    await t.click(sel(3), { real: false });
    await sel(3).selectOption({ label: 'Maharashtra' });
    await t.wait(600);
    await t.click(sel(4), { real: false });
    await sel(4).selectOption({ label: 'Undergraduate degree' });
    await t.wait(900);

    // 4. score
    const score = p.locator('input[placeholder="e.g. 72"]');
    await t.caption(4, 'Add your score. We check every program’s entry rules against it');
    await t.type(score, '72', 160);
    await t.wait(1100);

    // 5. go
    const go = p.getByRole('button', { name: /Find my scholarships/ });
    await t.caption(5, 'Press Find my scholarships');
    await t.scrollTo(go, 'center', 900);
    await t.click(go);
    await p.waitForLoadState('networkidle').catch(() => {});
    await t.wait(2400);

    // 6. results
    const view = p.locator('button:text-is("View"), a:text-is("View")').first();
    const card = view.locator('xpath=ancestor::div[.//*[contains(text(),"Tuition")]][1]');
    await t.caption(6, 'Only programs you qualify for, each with its scholarship details');
    await t.scrollTo(card, 'center', 1100);
    await t.ring(card, 6);
    await t.moveTo(card.locator('text=/Scholarship/').last(), 800);
    await t.wait(2600);
    await t.hideRing();

    // 7. shortlist + download
    await t.caption(7, 'Tick to shortlist. Sign in free to download your list');
    await t.tickBoxes(2);
    const bar = p.locator('text=/Programs? selected/').first();
    await t.ring(bar, 8);
    await t.wait(2000);
    await t.hideRing();

    // outro
    await t.hideCaption();
    await t.card(outroCard(logo, 'Scholarships you actually qualify for', 'unicoach.com/scholarships', 'Need help applying? Book a free 1:1 call with a UniCoach mentor.'));
    await t.wait(3600);
  },
});

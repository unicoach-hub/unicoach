// Mentor dashboard tutorial. Usage: FFMPEG=... node mentor-dashboard.mjs OUT_DIR
// Runs the real dashboard as a made-up demo mentor; every /api call is answered here in the
// browser with demo data, so nothing reaches the server and no real mentor's data is shown.
import { record, introCard, outroCard, loadVoice } from './kit.mjs';
import { USER, mockMentorApi } from './mentor-demo-data.mjs';

const OUT = process.argv[2];
await record({
  name: 'mentor-dashboard',
  outDir: OUT,
  ffmpeg: process.env.FFMPEG,
  voice: loadVoice('mentor-dashboard'),
  setup: {
    script: (u) => {
      localStorage.setItem('user_info', JSON.stringify(u));
      localStorage.setItem(`uc_tour_done:mentor:${u._id}`, '1');
      localStorage.setItem(`uc_tour_done:student:${u._id}`, '1');
    },
    arg: USER,
  },
  mock: async (req) => (/\/api\//.test(req.url()) ? { body: mockMentorApi(req.url(), req.method()) } : null),
  run: async (t) => {
    const p = t.page;
    // the floating "Enhance Profile" helper would sit on top of the captions
    await p.addInitScript(() => {
      const st = document.createElement('style');
      st.textContent = 'button:has(> span):is([class*="from-indigo"],[class*="from-violet"],[class*="from-purple"])[class*="fixed"]{display:none!important}';
      document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
    });
    await p.goto('https://www.unicoach.com/unicoach/dashboard', { waitUntil: 'networkidle' });
    await t.wait(1600);
    await p.evaluate(() => {
      for (const b of document.querySelectorAll('button')) if (/Enhance Profile/.test(b.textContent || '')) b.style.display = 'none';
    });
    const logo = await t.logo();
    await t.card(introCard(logo, 'MENTOR DASHBOARD · 1-MIN TOUR', 'Mentor students, get paid', 'How your UniCoach mentor studio works: services, slots, bookings and earnings.'));
    await t.start();
    await t.wait(500);
    await t.sayCard('intro');
    await t.waitVoice(300);
    if (!t.voiced) await t.wait(2700);
    await t.hideCard(700);
    await t.moveTo([640, 360], 10);
    const nav = (k) => p.locator(`[data-tour="mnav-${k}"]`).first();
    const go = async (k) => { await t.click(nav(k)); await t.wait(1100); await p.evaluate(() => window.scrollTo({ top: 0 })); };

    // 1. home checklist
    await t.say('1', 1, 'Home shows what is left to set up before students can book you');
    const setup = p.locator('text=Set up your mentor page').first();
    await t.scrollTo(setup, 'start', 900);
    await t.ring(setup.locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), 6);
    await t.wait(2600);
    await t.hideRing();

    // 2. services
    await t.waitVoice(150);
    await go('services');
    await t.say('2', 2, 'Services: 1:1 calls, Priority DMs, SOP reviews. You set the price');
    const add = p.getByRole('button', { name: /Add New Service/ }).first();
    if (await add.count()) { await t.ring(add, 6); await t.moveTo(add, 700); await t.wait(1400); await t.hideRing(); }
    const card = p.locator('text=1:1 call: Masters in Ireland').first();
    if (await card.count()) { await t.scrollTo(card, 'center', 900); await t.ring(card.locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), 6); await t.wait(1600); await t.hideRing(); }

    // 3. calendar
    await t.waitVoice(150);
    await go('calendar');
    await t.say('3', 3, 'Calendar: open the times you are free. Students book only those');
    const live = p.locator('text=/Live Slots Open/').first();
    if (await live.count()) { await t.ring(live, 6); await t.moveTo(live, 700); await t.wait(1300); await t.hideRing(); }
    await t.scrollBy(380, 1100);
    await t.wait(1400);

    // 4. bookings
    await t.waitVoice(150);
    await go('bookings');
    await t.say('4', 4, 'Bookings: join your calls and answer Priority DMs on time');
    const first = p.locator('text=Rohan Mehta').first();
    if (await first.count()) { await t.ring(first.locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), 6); await t.moveTo(first, 700); await t.wait(1800); await t.hideRing(); }
    const dms = p.locator('text=/Answer Priority DMs/').first();
    if (await dms.count()) { await t.ring(dms, 6); await t.moveTo(dms, 600); await t.wait(1200); await t.hideRing(); }

    // 5. earnings
    await t.waitVoice(150);
    await go('payouts');
    await t.say('5', 5, 'Earnings: paid to your bank every Monday. 0% commission');
    const weekly = p.locator('text=Weekly payouts').first();
    if (await weekly.count()) { await t.scrollTo(weekly, 'center', 800); await t.ring(weekly.locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), 6); await t.wait(2400); await t.hideRing(); }

    // 6. share
    await t.waitVoice(150);
    await go('share_grow');
    await t.say('6', 6, 'Share & Grow: your link, QR code and ready Instagram posters');
    const link = p.locator('text=Your Storefront Link').first();
    if (await link.count()) { await t.ring(link.locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), 6); await t.wait(1500); await t.hideRing(); }
    const poster = p.locator('text=Instagram Story Poster').first();
    if (await poster.count()) { await t.moveTo(poster, 700); await t.scrollBy(300, 1000); await t.wait(1400); }

    // outro
    await t.waitVoice(300);
    await t.hideCaption();
    await t.card(outroCard(logo, 'Your studio is ready', 'unicoach.com/unicoach/dashboard', 'Open a few slots this week and share your link.'));
    await t.sayCard('outro');
    await t.waitVoice(900);
    if (!t.voiced) await t.wait(3600);
  },
});

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

async function generateWhiteHeroOgBanner() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2 // 2x crisp retina rendering
  });

  const publicDir = path.join(__dirname, '..', 'public');
  const logoPath = path.join(publicDir, 'logo.png');
  const heroImgPath = path.join(publicDir, 'image.webp');

  const logoBase64 = fs.existsSync(logoPath)
    ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    : '';

  const heroImgBase64 = fs.existsSync(heroImgPath)
    ? `data:image/webp;base64,${fs.readFileSync(heroImgPath).toString('base64')}`
    : '';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Urbanist:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    body {
      width: 1200px;
      height: 630px;
      background: #F8FAFC;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0F172A;
      position: relative;
      overflow: hidden;
      display: flex;
    }

    /* ── Warm Soft Peach Background Glows (Exact to Website Hero) ── */
    .glow-peach-1 {
      position: absolute;
      top: -60px;
      left: 40px;
      width: 620px;
      height: 520px;
      background: radial-gradient(circle, rgba(255, 227, 209, 0.85) 0%, rgba(255, 240, 229, 0.45) 55%, transparent 75%);
      filter: blur(60px);
      pointer-events: none;
    }
    .glow-peach-2 {
      position: absolute;
      bottom: -80px;
      left: -40px;
      width: 500px;
      height: 450px;
      background: radial-gradient(circle, rgba(255, 227, 209, 0.75) 0%, rgba(255, 245, 237, 0.35) 60%, transparent 80%);
      filter: blur(70px);
      pointer-events: none;
    }
    .glow-peach-center {
      position: absolute;
      top: 15%;
      left: 32%;
      width: 450px;
      height: 400px;
      background: radial-gradient(circle, rgba(255, 237, 223, 0.6) 0%, transparent 70%);
      filter: blur(60px);
      pointer-events: none;
    }

    /* ── Full Layout Container ── */
    .hero-container {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      padding: 38px 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* ── Top Navbar Strip ── */
    .top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 30;
    }
    .logo-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-img {
      height: 38px;
      object-fit: contain;
    }
    .nav-tags {
      display: flex;
      align-items: center;
      gap: 22px;
      font-size: 13.5px;
      font-weight: 600;
      color: #334155;
    }
    .nav-tag-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .url-badge {
      background: #111111;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 9999px;
      letter-spacing: 0.3px;
    }

    /* ── Main Hero Row: Left Copy & Right Visual ── */
    .hero-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 20;
      margin-top: 10px;
    }

    /* ── Left Content Column ── */
    .left-col {
      width: 530px;
      position: relative;
      z-index: 30;
    }

    /* Pill Tag */
    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 1px solid rgba(222, 92, 43, 0.25);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      padding: 6px 14px;
      border-radius: 9999px;
      margin-bottom: 14px;
    }
    .hero-pill-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #DE5C2B;
    }
    .hero-pill-text {
      font-size: 12px;
      font-weight: 700;
      color: #1E293B;
      letter-spacing: -0.1px;
    }

    /* Airplane SVG trail overlay */
    .airplane-trail {
      position: absolute;
      top: 4px;
      right: -25px;
      width: 100px;
      height: 60px;
      pointer-events: none;
    }

    /* Headline */
    .headline {
      font-family: 'Outfit', sans-serif;
      font-size: 54px;
      font-weight: 900;
      line-height: 1.08;
      letter-spacing: -0.035em;
      color: #111111;
      margin-bottom: 14px;
    }
    .headline-highlight {
      position: relative;
      display: inline-block;
    }
    .headline-underline {
      position: absolute;
      bottom: 2px;
      left: 0;
      width: 100%;
      height: 9px;
      background: #FED7CE;
      border-radius: 9999px;
      z-index: -1;
    }

    /* Subtitle */
    .subtitle {
      font-size: 16px;
      font-weight: 400;
      color: #475569;
      line-height: 1.55;
      margin-bottom: 22px;
      max-width: 480px;
    }

    /* Action Buttons */
    .btn-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 22px;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #111111;
      color: #FFFFFF;
      padding: 11px 18px 11px 22px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 8px 20px -3px rgba(0, 0, 0, 0.28);
    }
    .btn-arrow-circle {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #FFFFFF;
      color: #111111;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 900;
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      color: #0F172A;
      padding: 11px 20px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 700;
      border: 1px solid rgba(222, 92, 43, 0.35);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }
    .btn-secondary span.arrow {
      color: #DE5C2B;
      font-size: 15px;
    }

    /* Trust Chips at Bottom-Left */
    .trust-chips {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .chip {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      padding: 6px 13px;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 700;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .chip-green-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10B981;
    }

    /* ── Right Column: Hero Scene with Airplane Window & Floating Cards ── */
    .right-col {
      width: 610px;
      height: 500px;
      position: absolute;
      right: 0;
      top: -20px;
      z-index: 10;
      overflow: visible;
    }

    /* Masked Window Image */
    .window-img-wrapper {
      position: absolute;
      right: -20px;
      top: 0;
      width: 580px;
      height: 500px;
      overflow: hidden;
      mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 6%, black 16%, black 100%);
      -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 6%, black 16%, black 100%);
    }
    .window-img-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 18% center;
    }

    /* Floating Card 1: 98.7% Visa Success (Top-Right) */
    .card-visa {
      position: absolute;
      top: 24px;
      right: 32px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(244, 63, 94, 0.28);
      border-radius: 18px;
      padding: 12px 16px;
      width: 165px;
      box-shadow: 0 16px 32px -8px rgba(153, 27, 27, 0.16);
      z-index: 30;
    }
    .card-visa-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 18px 18px 0 0;
      background: linear-gradient(to right, transparent, #BE123C, transparent);
    }
    .card-visa-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-visa-lbl {
      font-size: 10px;
      font-weight: 700;
      color: #9F1239;
    }
    .card-visa-badge {
      font-size: 8.5px;
      font-weight: 800;
      color: #BE123C;
      background: #FFF1F2;
      border: 1px solid #FECDD3;
      padding: 1.5px 6px;
      border-radius: 9999px;
    }
    .card-visa-num {
      font-family: 'Urbanist', sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: #991B1B;
      line-height: 1.1;
      margin-top: 3px;
    }
    .card-visa-sub {
      font-size: 9px;
      font-style: italic;
      color: #BE123C;
      opacity: 0.8;
      display: block;
    }
    .sparkline {
      width: 100%;
      height: 20px;
      margin-top: 6px;
    }

    /* Floating Card 2: ₹24Cr+ Scholarships (Center-Left) */
    .card-scholarships {
      position: absolute;
      top: 85px;
      left: 10px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 20px;
      padding: 14px 18px;
      width: 215px;
      box-shadow: 0 20px 40px -10px rgba(4, 120, 87, 0.18);
      z-index: 35;
    }
    .card-scholarships-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 20px 20px 0 0;
      background: linear-gradient(to right, transparent, #10B981, transparent);
    }
    .card-sch-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-sch-num {
      font-family: 'Urbanist', sans-serif;
      font-size: 28px;
      font-weight: 900;
      color: #047857;
      line-height: 1;
    }
    .card-sch-badge {
      font-size: 9.5px;
      font-weight: 800;
      color: #047857;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      padding: 2.5px 8px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .card-sch-badge .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #10B981;
    }
    .card-sch-lbl {
      font-size: 10.5px;
      font-weight: 600;
      color: #64748B;
      margin-top: 4px;
      display: block;
    }
    .avatar-stack {
      display: flex;
      align-items: center;
      margin-top: 10px;
    }
    .avatar-group {
      display: flex;
      margin-right: 8px;
    }
    .avatar-stack-item {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1.5px solid #FFFFFF;
      object-fit: cover;
      margin-left: -5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .avatar-group .avatar-stack-item:first-child {
      margin-left: 0;
    }
    .avatar-count {
      font-size: 10.5px;
      font-weight: 800;
      color: #047857;
    }

    /* Floating Card 3: 12K+ Mentored (Bottom-Right) */
    .card-mentored {
      position: absolute;
      bottom: 60px;
      right: 32px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(222, 92, 43, 0.25);
      border-radius: 18px;
      padding: 12px 18px;
      width: 195px;
      box-shadow: 0 18px 36px -8px rgba(222, 92, 43, 0.16);
      z-index: 45;
    }
    .card-mentored-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 18px 18px 0 0;
      background: linear-gradient(to right, transparent, #DE5C2B, transparent);
    }
    .card-mentored-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-mentored-num {
      font-family: 'Urbanist', sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: #DE5C2B;
      line-height: 1;
    }
    .card-mentored-badge {
      font-size: 9px;
      font-weight: 800;
      color: #C2410C;
      background: #FFF7ED;
      border: 1px solid #FFEDD5;
      padding: 2px 7px;
      border-radius: 9999px;
    }
    .card-mentored-lbl {
      font-size: 10px;
      font-weight: 600;
      color: #64748B;
      margin-top: 3px;
      display: block;
    }
    .mentored-count {
      font-size: 10.5px;
      font-weight: 800;
      color: #DE5C2B;
    }
  </style>
</head>
<body>
  <div class="glow-peach-1"></div>
  <div class="glow-peach-2"></div>
  <div class="glow-peach-center"></div>

  <div class="hero-container">
    <!-- Top Nav Strip -->
    <div class="top-nav">
      <div class="logo-box">
        <img class="logo-img" src="${logoBase64}" alt="UniCoach" />
      </div>
      <div class="nav-tags">
        <span class="nav-tag-item">Study Abroad ▾</span>
        <span class="nav-tag-item">AI & Tools ▾</span>
        <span class="nav-tag-item">Exams ▾</span>
        <span class="nav-tag-item">Scholarships</span>
        <div class="url-badge">unicoach.in</div>
      </div>
    </div>

    <!-- Main Hero Center Row -->
    <div class="hero-row">
      <!-- Left Column: Typography, CTA, Trust -->
      <div class="left-col">
        <div class="hero-pill">
          <div class="hero-pill-dot"></div>
          <span class="hero-pill-text">The #1 Study Abroad & Senior Mentorship Platform</span>
        </div>

        <h1 class="headline">
          Your Global Future<br/>
          <span class="headline-highlight">
            Starts Here
            <div class="headline-underline"></div>
          </span>
        </h1>

        <p class="subtitle">
          Achieve top test scores, secure admissions & high-value scholarships at world-class universities, and connect 1:1 with seniors who've actually done it.
        </p>

        <!-- CTA Buttons -->
        <div class="btn-row">
          <div class="btn-primary">
            <span>Book Free Counselling</span>
            <div class="btn-arrow-circle">→</div>
          </div>
          <div class="btn-secondary">
            <span>Send Priority DM</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- Trust Badges -->
        <div class="trust-chips">
          <div class="chip">
            <div class="chip-green-dot"></div>
            <span>100% Free Guidance</span>
          </div>
          <div class="chip">
            <span>🎓 ₹24Cr+ Scholarships</span>
          </div>
          <div class="chip">
            <span>🛡️ 98.7% Visa Success</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Masked Airplane Window Scene & 3 Floating Cards -->
      <div class="right-col">
        <!-- Masked Hero Image -->
        <div class="window-img-wrapper">
          <img src="${heroImgBase64}" alt="Student in Airplane Window" />
        </div>

        <!-- Floating Card 1: Visa Success Rate -->
        <div class="card-visa">
          <div class="card-visa-top"></div>
          <div class="card-visa-head">
            <span class="card-visa-lbl">Visa Success Rate</span>
            <span class="card-visa-badge">98.7%</span>
          </div>
          <div class="card-visa-num">98.7%</div>
          <span class="card-visa-sub">and counting...</span>
          <svg class="sparkline" viewBox="0 0 130 20" fill="none">
            <defs>
              <linearGradient id="visaShrinkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#BE123C" stop-opacity="0.3" />
                <stop offset="100%" stop-color="#BE123C" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,14 Q20,16 35,10 T70,8 T100,4 T130,1" stroke="#BE123C" stroke-width="2.2" stroke-linecap="round" fill="none" />
            <path d="M0,14 Q20,16 35,10 T70,8 T100,4 T130,1 L130,20 L0,20 Z" fill="url(#visaShrinkGrad)" />
          </svg>
        </div>

        <!-- Floating Card 2: ₹24Cr+ Scholarships -->
        <div class="card-scholarships">
          <div class="card-scholarships-top"></div>
          <div class="card-sch-head">
            <div class="card-sch-num">₹24Cr+</div>
            <div class="card-sch-badge">
              <div class="dot"></div>
              <span>MERIT AID</span>
            </div>
          </div>
          <span class="card-sch-lbl">Scholarships Secured</span>
          <div class="avatar-stack">
            <div class="avatar-group">
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" alt="Avatar" />
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" alt="Avatar" />
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80" alt="Avatar" />
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80" alt="Avatar" />
            </div>
            <span class="avatar-count">+2.4K</span>
          </div>
        </div>

        <!-- Floating Card 3: 12K+ Mentored -->
        <div class="card-mentored">
          <div class="card-mentored-top"></div>
          <div class="card-mentored-head">
            <div class="card-mentored-num">12K+</div>
            <div class="card-mentored-badge">MENTORED</div>
          </div>
          <span class="card-mentored-lbl">Students Counselled</span>
          <div class="avatar-stack">
            <div class="avatar-group">
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=60&auto=format&fit=crop&q=80" alt="Avatar" />
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=60&auto=format&fit=crop&q=80" alt="Avatar" />
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" alt="Avatar" />
            </div>
            <span class="mentored-count">+5K</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const rawScreenshotPath = path.join(publicDir, 'og-banner-raw.png');
  await page.screenshot({ path: rawScreenshotPath, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();

  const finalPngPath = path.join(publicDir, 'og-banner.png');
  const finalJpgPath = path.join(publicDir, 'og-banner.jpg');
  const squareJpgPath = path.join(publicDir, 'og-square.jpg');

  await sharp(rawScreenshotPath)
    .resize(1200, 630)
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(finalPngPath);

  await sharp(rawScreenshotPath)
    .resize(1200, 630)
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(finalJpgPath);

  await sharp(rawScreenshotPath)
    .resize(600, 600, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(squareJpgPath);

  if (fs.existsSync(rawScreenshotPath)) {
    fs.unlinkSync(rawScreenshotPath);
  }

  const pngStats = fs.statSync(finalPngPath);
  const jpgStats = fs.statSync(finalJpgPath);
  const sqStats = fs.statSync(squareJpgPath);

  console.log('✅ Generated White-Shade OG Banner:');
  console.log(`- PNG: ${finalPngPath} (${Math.round(pngStats.size / 1024)} KB)`);
  console.log(`- JPG: ${finalJpgPath} (${Math.round(jpgStats.size / 1024)} KB) - Perfect for WhatsApp!`);
  console.log(`- Square: ${squareJpgPath} (${Math.round(sqStats.size / 1024)} KB)`);
}

generateWhiteHeroOgBanner().catch(console.error);

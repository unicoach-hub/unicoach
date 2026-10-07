import { test, expect } from '@playwright/test';

test.describe('UniCoach Comprehensive End-to-End Test Suite', () => {

  // 1. Homepage & SEO
  test('1. Homepage loads with SEO tags, navbar and hero elements', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Homepage DOMContentLoaded in ${loadTime}ms`);

    // Title check
    await expect(page).toHaveTitle(/UniCoach/i);

    // Meta Description check
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /education|counselling/i);

    // Navbar Brand Logo check
    const logo = page.locator('header img[alt="UniCoach Logo"]').first();
    await expect(logo).toBeVisible();

    // Hero Heading check
    const h1 = page.locator('h1').first();
    await expect(h1).toContainText(/Your Global/i);
    await expect(h1).toContainText(/Future/i);

    // Hero CTA button check
    const ctaButton = page.locator('text=Book Free Counselling').first();
    await expect(ctaButton).toBeVisible();
  });

  // 2. Interactive Lead Modal Flow
  test('2. "Book Free Counselling" CTA opens the Eligibility / Lead modal', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Click Hero CTA button
    const cta = page.locator('button:has-text("Book Free Counselling"), a:has-text("Book Free Counselling")').first();
    await expect(cta).toBeVisible({ timeout: 10000 });
    await cta.click();

    // Wait for modal heading to appear
    await expect(page.getByRole('heading', { name: /Start your study abroad journey/i })).toBeVisible({ timeout: 10000 });
  });

  // 3. Navbar Navigation & Dropdowns
  test('3. Desktop Navbar navigation links and mega menu operate smoothly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Hover 'Study Abroad' menu
    const studyAbroadNav = page.locator('header nav button:has-text("Study Abroad")').first();
    if (await studyAbroadNav.isVisible()) {
      await studyAbroadNav.hover();
      // Verify dropdown content appears
      const dropdownItem = page.getByRole('link', { name: 'Study in USA' }).first();
      await expect(dropdownItem).toBeVisible({ timeout: 8000 });
    }

    // Hover 'AI & Tools' nav item
    const aiToolsNav = page.locator('header nav button:has-text("AI & Tools")').first();
    if (await aiToolsNav.isVisible()) {
      await aiToolsNav.hover();
      const sopTool = page.getByRole('link', { name: /Statement of Purpose|University Shortlister|Roadmap/i }).first();
      await expect(sopTool).toBeVisible({ timeout: 8000 });
    }
  });

  // 4. AI Tools Hub & SOP Generator Page
  test('4. Dedicated AI Tools Hub loads and navigates correctly', async ({ page }) => {
    await page.goto('/ai-tools', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Verify page loads without 404
    await expect(page).toHaveTitle(/UniCoach/i);

    // Navigate to SOP Generator
    await page.goto('/ai-tools/sop-generator', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const sopHeading = page.locator('h1, h2').first();
    await expect(sopHeading).toBeVisible({ timeout: 10000 });
  });

  // 5. Mobile Responsive Viewport & Navigation Drawer
  test('5. Mobile responsive layout displays hamburger and opens drawer', async ({ page }) => {
    // Set simulated mobile viewport (iPhone 13 / Pixel 7 size)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Verify hamburger button is visible
    const hamburger = page.locator('button[aria-label="Toggle menu"], button[aria-label*="menu" i]').first();
    await expect(hamburger).toBeVisible({ timeout: 10000 });

    // Click hamburger button
    await hamburger.click();

    // Verify mobile drawer search input appears
    const mobileSearch = page.locator('input[placeholder*="Search study programs"]').first();
    await expect(mobileSearch).toBeVisible({ timeout: 8000 });
  });

  // 6. Admin Portal
  test('6. Admin Portal loads login gateway', async ({ page }) => {
    await page.goto('https://unicoach-mjs6.vercel.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page).toHaveTitle(/Admin/i);

    // Verify input exists
    const input = page.locator('input').first();
    await expect(input).toBeVisible({ timeout: 10000 });
  });

  // 7. Web Performance & Console Error Health
  test('7. Console errors and uncaught exceptions check on homepage', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/', { waitUntil: 'load', timeout: 30000 });

    // Filter out third-party extension noise or expected network aborts
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('chrome-extension') &&
      !err.includes('Failed to load resource: net::ERR_BLOCKED_BY_CLIENT') &&
      !err.includes('vite:preloadError')
    );

    console.log(`Found ${criticalErrors.length} critical console errors.`);
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });

});

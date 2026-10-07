import { test, expect } from '@playwright/test';

test.describe('UniCoach Live Production E2E Tests', () => {

  // Test 1: Student Portal (Vercel)
  test('1. Student App loads successfully with correct title', async ({ page }) => {
    // Navigate to live Vercel Student Portal
    await page.goto('https://unicoach-blush.vercel.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Page title check
    await expect(page).toHaveTitle(/UniCoach/i);
    
    // Check navigation bar exists
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible({ timeout: 15000 });
  });

  // Test 2: Admin Portal (Vercel)
  test('2. Admin Portal loads and shows Login screen', async ({ page }) => {
    // Navigate to live Vercel Admin Portal
    await page.goto('https://unicoach-mjs6.vercel.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Check Admin Portal Title
    await expect(page).toHaveTitle(/Admin/i);

    // Verify email/password login fields exist
    const emailInput = page.locator('input[type="email"], input[type="text"], input[placeholder*="email" i]').first();
    await expect(emailInput).toBeVisible({ timeout: 15000 });
  });

});

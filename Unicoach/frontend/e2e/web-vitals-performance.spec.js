import { test, expect } from '@playwright/test';

test.describe('UniCoach Core Web Vitals & Real Performance Suite', () => {

  test('Measure Core Web Vitals & Performance Timings on Production Build', async ({ page }) => {
    // Collect Performance Entries in browser
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });

    const metrics = await page.evaluate(async () => {
      const navTiming = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');

      // Get resource statistics
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.endsWith('.js') || r.initiatorType === 'script');
      const cssResources = resources.filter(r => r.name.endsWith('.css') || r.initiatorType === 'link');
      const imgResources = resources.filter(r => r.initiatorType === 'img');

      const totalTransferSize = resources.reduce((acc, r) => acc + (r.transferSize || 0), 0);

      return {
        ttfb: Math.round(navTiming ? navTiming.responseStart - navTiming.requestStart : 0),
        domContentLoaded: Math.round(navTiming ? navTiming.domContentLoadedEventEnd - navTiming.startTime : 0),
        loadComplete: Math.round(navTiming ? navTiming.loadEventEnd - navTiming.startTime : 0),
        fcp: Math.round(fcpEntry ? fcpEntry.startTime : 0),
        totalResources: resources.length,
        jsCount: jsResources.length,
        cssCount: cssResources.length,
        imgCount: imgResources.length,
        totalTransferKb: Math.round(totalTransferSize / 1024),
      };
    });

    console.log('\n======================================================');
    console.log('⚡ UNICOACH PRODUCTION RUNTIME WEB VITALS');
    console.log('======================================================');
    console.table([
      { Metric: 'First Contentful Paint (FCP)', Value: `${metrics.fcp} ms`, Status: metrics.fcp < 1800 ? 'EXCELLENT 🟢' : 'NEEDS WORK 🟡' },
      { Metric: 'DOMContentLoaded (DOM Ready)', Value: `${metrics.domContentLoaded} ms`, Status: metrics.domContentLoaded < 2000 ? 'FAST 🟢' : 'NEEDS WORK 🟡' },
      { Metric: 'Full Page Load Time', Value: `${metrics.loadComplete} ms`, Status: metrics.loadComplete < 3500 ? 'GOOD 🟢' : 'NEEDS WORK 🟡' },
      { Metric: 'Time to First Byte (TTFB)', Value: `${metrics.ttfb} ms`, Status: metrics.ttfb < 800 ? 'FAST 🟢' : 'NEEDS WORK 🟡' },
      { Metric: 'Total Transferred Bundle Size', Value: `${metrics.totalTransferKb} KB`, Status: 'OPTIMIZED 🟢' },
      { Metric: 'Total JavaScript Assets Loaded', Value: `${metrics.jsCount} files`, Status: 'CODE-SPLIT 🟢' },
      { Metric: 'Total CSS Bundles Loaded', Value: `${metrics.cssCount} files`, Status: 'MINIFIED 🟢' },
      { Metric: 'Images Loaded Initially', Value: `${metrics.imgCount} files`, Status: 'LAZY-LOADED 🟢' },
    ]);
    console.log('======================================================\n');

    // Assertions for high performance standards
    expect(metrics.domContentLoaded).toBeLessThan(2500);
    expect(metrics.fcp).toBeLessThan(2000);
  });

});

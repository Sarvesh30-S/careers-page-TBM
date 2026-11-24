const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';

async function verifyTypeAnimation() {
  console.log('=== Verifying Type-in Slogan Animation ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // 1. Navigate to page
  console.log('Navigating to http://localhost:3000/ ...');
  await page.goto('http://localhost:3000/');

  // Wait 400ms to capture mid-line 1 typing
  await page.waitForTimeout(400);

  const state1 = await page.evaluate(() => {
    const site = document.getElementById('site');
    const h1 = document.querySelector('h1.kin');
    const nav = document.querySelector('.nav');
    const row = document.querySelector('.hero .row');
    const sections = [...document.querySelectorAll('main > :not(.hero)')];
    const cursor = document.querySelector('.type-cursor');

    return {
      siteClass: site ? site.className : '',
      h1Text: h1 ? h1.innerText : '',
      navOpacity: nav ? window.getComputedStyle(nav).opacity : '',
      rowOpacity: row ? window.getComputedStyle(row).opacity : '',
      sectionsVisible: sections.every(s => window.getComputedStyle(s).visibility === 'hidden'),
      hasCursor: !!cursor
    };
  });

  console.log('State at 400ms (Typing Line 1):', state1);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'type_animation_01_typing_line1.png') });

  // Wait another 700ms (1100ms total) to capture Line 2 typing
  await page.waitForTimeout(700);
  const state2 = await page.evaluate(() => {
    const h1 = document.querySelector('h1.kin');
    const cursor = document.querySelector('.type-cursor');
    return {
      h1Text: h1 ? h1.innerText : '',
      hasCursor: !!cursor
    };
  });
  console.log('State at 1100ms (Typing Line 2):', state2);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'type_animation_02_typing_line2.png') });

  // Wait for typing to complete and page elements to reveal (total ~2500ms)
  await page.waitForTimeout(1400);
  const state3 = await page.evaluate(() => {
    const site = document.getElementById('site');
    const h1 = document.querySelector('h1.kin');
    const nav = document.querySelector('.nav');
    const row = document.querySelector('.hero .row');
    const mark = document.querySelector('mark.draw');
    const sections = [...document.querySelectorAll('main > :not(.hero)')];

    return {
      siteClass: site ? site.className : '',
      h1Text: h1 ? h1.innerText : '',
      navOpacity: nav ? window.getComputedStyle(nav).opacity : '',
      rowOpacity: row ? window.getComputedStyle(row).opacity : '',
      markHasActive: mark ? mark.classList.contains('active') : false,
      sectionsVisible: sections.every(s => window.getComputedStyle(s).visibility === 'visible')
    };
  });

  console.log('State at 2500ms (Typing Complete & Page Revealed):', state3);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'type_animation_03_completed.png') });

  await browser.close();
  console.log('=== Verification Finished ===');
}

verifyTypeAnimation().catch(err => {
  console.error(err);
  process.exit(1);
});

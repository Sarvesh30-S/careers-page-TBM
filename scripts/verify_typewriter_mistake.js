const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';

async function verifyTypewriterMistake() {
  console.log('=== Verifying Typewriter Mistake & Self-Correction ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/');

  // 1. Line 1 completion
  await page.waitForTimeout(1100);
  const text1 = await page.evaluate(() => document.querySelector('h1.kin')?.innerText || '');
  console.log('1. Line 1:', JSON.stringify(text1));

  // 2. Mistake typed: "Courage gets you weird."
  await page.waitForTimeout(1300);
  const text2 = await page.evaluate(() => document.querySelector('h1.kin')?.innerText || '');
  console.log('2. Mistake typed:', JSON.stringify(text2));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mistake_01_typed_weird.png') });

  // 3. "Oops!" displayed (500ms pause + Oops! active)
  await page.waitForTimeout(600);
  const oopsState = await page.evaluate(() => {
    const oops = document.querySelector('.oops-badge');
    const text = document.querySelector('h1.kin')?.innerText || '';
    return {
      text,
      hasOops: !!oops,
      oopsVisible: oops ? window.getComputedStyle(oops).opacity : '0'
    };
  });
  console.log('3. Oops! Badge:', oopsState);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mistake_02_oops_badge.png') });

  // 4. Backspacing & Correcting
  await page.waitForTimeout(800);
  const backspacingText = await page.evaluate(() => document.querySelector('h1.kin')?.innerText || '');
  console.log('4. Backspacing / Correcting:', JSON.stringify(backspacingText));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mistake_03_backspacing.png') });

  // 5. Final Correct Slogan & Page Revealed
  await page.waitForTimeout(1000);
  const finalState = await page.evaluate(() => {
    const site = document.getElementById('site');
    const h1 = document.querySelector('h1.kin');
    const mark = document.querySelector('mark.draw');
    const nav = document.querySelector('.nav');
    return {
      siteClass: site ? site.className : '',
      text: h1 ? h1.innerText : '',
      markHasActive: mark ? mark.classList.contains('active') : false,
      navOpacity: nav ? window.getComputedStyle(nav).opacity : '0'
    };
  });
  console.log('5. Final State (Complete & Revealed):', finalState);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mistake_04_final_revealed.png') });

  await browser.close();
  console.log('=== Verification Finished ===');
}

verifyTypewriterMistake().catch(err => {
  console.error(err);
  process.exit(1);
});

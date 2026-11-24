const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';

async function verifyBtnCentered() {
  console.log('=== Verifying Button Hover: Text Centering & Arrow Launch ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/');
  await page.click('body');
  await page.waitForTimeout(500);

  const navBtn = page.locator('header.nav a.btn.primary');
  await navBtn.scrollIntoViewIfNeeded();

  // Resting screenshot
  const box1 = await navBtn.boundingBox();
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'btn_centered_01_resting.png'),
    clip: { x: box1.x - 15, y: box1.y - 10, width: box1.width + 30, height: box1.height + 20 }
  });

  // Hover over Nav button
  await navBtn.hover();
  await page.waitForTimeout(350);

  const navCenteredStats = await page.evaluate(() => {
    const btn = document.querySelector('header.nav a.btn.primary');
    const text = btn.querySelector('.btn-text');
    const arr = btn.querySelector('.arr');
    const underline = btn.querySelector('.btn-underline');

    const btnRect = btn.getBoundingClientRect();
    const textRect = text.getBoundingClientRect();

    const btnCenter = btnRect.left + btnRect.width / 2;
    const textCenter = textRect.left + textRect.width / 2;

    return {
      btnCenter,
      textCenter,
      centerDiff: textCenter - btnCenter,
      hasUnderline: !!underline,
      arrOpacity: window.getComputedStyle(arr).opacity,
      arrTransform: window.getComputedStyle(arr).transform,
      btnTransform: window.getComputedStyle(btn).transform
    };
  });

  console.log('Nav button hover stats:', navCenteredStats);

  const box2 = await navBtn.boundingBox();
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'btn_centered_02_hovered.png'),
    clip: { x: box2.x - 15, y: box2.y - 10, width: box2.width + 30, height: box2.height + 25 }
  });

  // Hero button hover
  const heroBtn = page.locator('.hero .ctas a.btn.primary');
  await heroBtn.scrollIntoViewIfNeeded();
  await heroBtn.hover();
  await page.waitForTimeout(350);

  const heroCenteredStats = await page.evaluate(() => {
    const btn = document.querySelector('.hero .ctas a.btn.primary');
    const text = btn.querySelector('.btn-text');
    const btnRect = btn.getBoundingClientRect();
    const textRect = text.getBoundingClientRect();
    const btnCenter = btnRect.left + btnRect.width / 2;
    const textCenter = textRect.left + textRect.width / 2;
    return {
      btnCenter,
      textCenter,
      centerDiff: textCenter - btnCenter
    };
  });
  console.log('Hero button hover stats:', heroCenteredStats);

  const box3 = await heroBtn.boundingBox();
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'btn_centered_03_hero_hovered.png'),
    clip: { x: box3.x - 15, y: box3.y - 10, width: box3.width + 30, height: box3.height + 25 }
  });

  await browser.close();
  console.log('=== Verification Finished ===');
}

verifyBtnCentered().catch(err => {
  console.error(err);
  process.exit(1);
});

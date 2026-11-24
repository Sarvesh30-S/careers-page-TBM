const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';

async function verifyButtonLaunch() {
  console.log('=== Verifying Button Hover Launch & Underline Animation ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/');
  // Skip typing by clicking
  await page.click('body');
  await page.waitForTimeout(600);

  // 1. Resting state of Nav "View openings" button
  const navBtn = page.locator('header.nav a.btn.primary');
  await navBtn.scrollIntoViewIfNeeded();

  const restingMeasurements = await page.evaluate(() => {
    const btn = document.querySelector('header.nav a.btn.primary');
    const underline = btn.querySelector('.btn-underline');
    const arr = btn.querySelector('.arr');
    const rect = btn.getBoundingClientRect();
    return {
      top: rect.top,
      hasUnderline: !!underline,
      hasArrow: !!arr
    };
  });
  console.log('Resting measurements:', restingMeasurements);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'btn_01_resting_nav.png'),
    clip: { x: 1200, y: 10, width: 220, height: 60 }
  });

  // 2. Hover over Nav "View openings" button
  await navBtn.hover();
  // Wait 150ms for the arrow launch & underline sweep
  await page.waitForTimeout(250);

  const hoverMeasurements = await page.evaluate(() => {
    const btn = document.querySelector('header.nav a.btn.primary');
    const rect = btn.getBoundingClientRect();
    const style = window.getComputedStyle(btn);
    const arr = btn.querySelector('.arr');
    const arrStyle = window.getComputedStyle(arr);
    return {
      top: rect.top,
      transform: style.transform,
      boxShadow: style.boxShadow,
      arrOpacity: arrStyle.opacity,
      arrTransform: arrStyle.transform
    };
  });
  console.log('Hover measurements (after 250ms):', hoverMeasurements);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'btn_02_hovered_nav.png'),
    clip: { x: 1200, y: 5, width: 220, height: 70 }
  });

  // 3. Hover over Hero "View openings" button
  const heroBtn = page.locator('.hero .ctas a.btn.primary');
  await heroBtn.scrollIntoViewIfNeeded();
  await heroBtn.hover();
  await page.waitForTimeout(250);

  const heroHoverBox = await heroBtn.boundingBox();
  if (heroHoverBox) {
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'btn_03_hovered_hero.png'),
      clip: {
        x: Math.max(0, heroHoverBox.x - 20),
        y: Math.max(0, heroHoverBox.y - 15),
        width: heroHoverBox.width + 40,
        height: heroHoverBox.height + 30
      }
    });
  }

  // 4. Move mouse away to unhover
  await page.mouse.move(100, 100);
  await page.waitForTimeout(300);

  const unhoverMeasurements = await page.evaluate(() => {
    const btn = document.querySelector('header.nav a.btn.primary');
    const style = window.getComputedStyle(btn);
    return {
      transform: style.transform,
      boxShadow: style.boxShadow
    };
  });
  console.log('Unhover measurements (reset):', unhoverMeasurements);

  await browser.close();
  console.log('=== Verification Finished ===');
}

verifyButtonLaunch().catch(err => {
  console.error(err);
  process.exit(1);
});

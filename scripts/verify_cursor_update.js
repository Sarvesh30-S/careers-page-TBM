const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';

async function verifyCursor() {
  console.log('=== Verifying Custom Cursor Parallel Movement & Dot Size ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/');
  // Skip typing by clicking
  await page.click('body');
  await page.waitForTimeout(600);

  // Move mouse to position (600, 400)
  await page.mouse.move(600, 400);
  await page.waitForTimeout(200);

  // Measure dot and ring centers
  const measurements = await page.evaluate(() => {
    const dot = document.querySelector('.custom-cursor-dot');
    const ring = document.querySelector('.custom-cursor-ring');

    const dotRect = dot.getBoundingClientRect();
    const ringRect = ring.getBoundingClientRect();

    const dotCenter = {
      x: dotRect.left + dotRect.width / 2,
      y: dotRect.top + dotRect.height / 2
    };

    const ringCenter = {
      x: ringRect.left + ringRect.width / 2,
      y: ringRect.top + ringRect.height / 2
    };

    return {
      dotWidth: dotRect.width,
      dotHeight: dotRect.height,
      ringWidth: ringRect.width,
      ringHeight: ringRect.height,
      dotCenter,
      ringCenter,
      centerDiffX: Math.abs(dotCenter.x - ringCenter.x),
      centerDiffY: Math.abs(dotCenter.y - ringCenter.y)
    };
  });

  console.log('Cursor Measurements at (600, 400):', measurements);

  // Take screenshot of cursor resting on clean cream background
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'cursor_01_smaller_dot_concentric.png'),
    clip: { x: 550, y: 350, width: 100, height: 100 }
  });

  // Now move mouse rapidly along a path and verify centers remain aligned in motion
  console.log('Simulating mouse motion...');
  let maxOffsetDuringMotion = 0;

  for (let i = 0; i < 15; i++) {
    const x = 400 + i * 30;
    const y = 300 + Math.sin(i) * 50;
    await page.mouse.move(x, y);
    await page.waitForTimeout(16); // 1 frame

    const diff = await page.evaluate(() => {
      const dot = document.querySelector('.custom-cursor-dot');
      const ring = document.querySelector('.custom-cursor-ring');
      const dotRect = dot.getBoundingClientRect();
      const ringRect = ring.getBoundingClientRect();
      const dotCenter = { x: dotRect.left + dotRect.width / 2, y: dotRect.top + dotRect.height / 2 };
      const ringCenter = { x: ringRect.left + ringRect.width / 2, y: ringRect.top + ringRect.height / 2 };
      return Math.sqrt(Math.pow(dotCenter.x - ringCenter.x, 2) + Math.pow(dotCenter.y - ringCenter.y, 2));
    });

    if (diff > maxOffsetDuringMotion) maxOffsetDuringMotion = diff;
  }

  console.log('Max center offset during motion:', maxOffsetDuringMotion.toFixed(3), 'px (should be ~0px)');

  // Hover over "View openings" button
  await page.hover('.hero .ctas a.btn.primary');
  await page.waitForTimeout(200);

  const hoverMeasurements = await page.evaluate(() => {
    const dot = document.querySelector('.custom-cursor-dot');
    const ring = document.querySelector('.custom-cursor-ring');
    const dotRect = dot.getBoundingClientRect();
    const ringRect = ring.getBoundingClientRect();
    return {
      dotWidth: dotRect.width,
      dotHeight: dotRect.height,
      ringWidth: ringRect.width,
      ringHeight: ringRect.height,
      hoverClass: ring.classList.contains('hovered')
    };
  });

  console.log('Hover state measurements:', hoverMeasurements);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'cursor_02_hover_button_concentric.png')
  });

  await browser.close();
  console.log('=== Verification Finished ===');
}

verifyCursor().catch(err => {
  console.error(err);
  process.exit(1);
});

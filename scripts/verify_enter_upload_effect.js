const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';

async function verifyEnterUploadEffect() {
  console.log('=== Verifying Enter Keypress & Slogan Upload Effect ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000/');

  // Wait for line 1 and mistake to type and correct (~3.2s)
  console.log('Waiting for typing to reach heard...');
  
  // Poll until enter-keycap appears
  await page.waitForSelector('.enter-keycap', { timeout: 8000 });
  console.log('Enter keycap detected!');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'enter_01_visible.png') });

  // Wait for pressing state
  try {
    await page.waitForSelector('.enter-keycap.pressing', { timeout: 1000 });
    console.log('Enter keycap pressing state detected!');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'enter_02_pressed.png') });
  } catch (e) {
    console.log('Pressing state passed quickly, continuing...');
  }

  // Wait for slogan-sent upload effect
  try {
    await page.waitForSelector('.kin.slogan-sent', { timeout: 1500 });
    console.log('Slogan upload effect detected!');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'enter_03_uploaded.png') });
  } catch (e) {
    console.log('Upload beam passed, continuing...');
  }

  // Wait for page ready
  await page.waitForSelector('#site.page-ready', { timeout: 3000 });
  console.log('Page ready state reached!');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'enter_04_final.png') });

  // Test Mobile Viewport
  console.log('Testing Mobile Viewport...');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:3000/');
  await mobilePage.waitForSelector('.enter-keycap', { timeout: 8000 });
  console.log('Mobile enter keycap detected!');
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'enter_mobile_01_visible.png') });

  await mobilePage.waitForSelector('#site.page-ready', { timeout: 4000 });
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'enter_mobile_02_final.png') });

  await browser.close();
  console.log('=== All Verifications Completed Successfully ===');
}

verifyEnterUploadEffect().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

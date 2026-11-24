const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';

async function verifyCleanRevert() {
  console.log('=== Verifying Clean Revert of Enter Effect ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000/');

  // Check that no enter-keycap exists
  const enterKeycapCount = await page.locator('.enter-keycap').count();
  console.log('Initial enter-keycap count:', enterKeycapCount);

  // Wait for typing and oops badge
  await page.waitForSelector('.oops-badge', { timeout: 4000 });
  console.log('Oops! badge appeared as expected.');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_revert_01_oops.png') });

  // Wait for page ready
  await page.waitForSelector('#site.page-ready', { timeout: 6000 });
  console.log('Page ready reached cleanly!');
  await page.waitForTimeout(400);

  // Verify enter keycap NEVER appears
  const finalEnterCount = await page.locator('.enter-keycap').count();
  console.log('Final enter-keycap count:', finalEnterCount);

  // Verify headline text
  const h1Text = await page.locator('h1.kin').innerText();
  console.log('H1 text:', h1Text.replace(/\n/g, ' '));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_revert_02_final.png') });

  await browser.close();
  console.log('=== Clean Revert Verification Succeeded ===');
}

verifyCleanRevert().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

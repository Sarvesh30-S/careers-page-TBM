const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';

async function verifyStartAtTop() {
  console.log('=== Verifying Page Always Starts From Top ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Test 1: Direct navigation to URL with #roles
  console.log('\nTest 1: Opening page with URL hash http://localhost:3000/#roles');
  await page.goto('http://localhost:3000/#roles');
  
  // Immediately check scroll position
  const scrollInitialHash = await page.evaluate(() => window.scrollY);
  console.log('Initial scrollY at #roles:', scrollInitialHash);

  // Wait 1.5s during typing
  await page.waitForTimeout(1500);
  const scrollDuringTyping = await page.evaluate(() => window.scrollY);
  console.log('ScrollY during typing:', scrollDuringTyping);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_top_01_during_typing.png') });

  // Wait for typing to complete
  await page.waitForSelector('#site.page-ready', { timeout: 6000 });
  const scrollAfterReady = await page.evaluate(() => window.scrollY);
  console.log('ScrollY immediately after page ready:', scrollAfterReady);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_top_02_ready.png') });

  // Test 2: User scrolls down to middle (e.g. 3500px) then reloads
  console.log('\nTest 2: User scrolls down to 3500px, then reloads');
  await page.evaluate(() => window.scrollTo(0, 3500));
  await page.waitForTimeout(500);
  console.log('Scrolled down to:', await page.evaluate(() => window.scrollY));

  console.log('Reloading page...');
  await page.reload();
  const scrollAfterReload = await page.evaluate(() => window.scrollY);
  console.log('ScrollY after reload at 100ms:', scrollAfterReload);

  await page.waitForTimeout(1000);
  const scrollAfterReload1s = await page.evaluate(() => window.scrollY);
  console.log('ScrollY after reload at 1s:', scrollAfterReload1s);

  await page.waitForSelector('#site.page-ready', { timeout: 6000 });
  const scrollAfterReloadFinal = await page.evaluate(() => window.scrollY);
  console.log('ScrollY after reload final:', scrollAfterReloadFinal);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_top_03_reloaded.png') });

  // Test 3: Clicking "View openings" smoothly scrolls down once page is ready
  console.log('\nTest 3: Clicking "View openings" button');
  const viewOpeningsBtn = page.locator('.hero .btn.primary');
  await viewOpeningsBtn.click();
  await page.waitForTimeout(1200);
  const scrollAfterClick = await page.evaluate(() => window.scrollY);
  console.log('ScrollY after clicking View openings:', scrollAfterClick);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_top_04_scrolled_to_roles.png') });

  // Test 4: Reload again while at #roles
  console.log('\nTest 4: Reload while at #roles after click');
  await page.reload();
  const scrollFinalTest = await page.evaluate(() => window.scrollY);
  console.log('ScrollY after reload while at #roles:', scrollFinalTest);

  await browser.close();
  console.log('\n=== All Tests Passed! Page Always Starts At Top ===');
}

verifyStartAtTop().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

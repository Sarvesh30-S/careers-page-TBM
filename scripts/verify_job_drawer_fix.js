const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';

async function verifyDrawerFix() {
  console.log('=== Verifying Job Drawer Opening Fix ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/#roles');
  // Skip typing by clicking
  await page.click('body');
  await page.waitForTimeout(600);

  // Click on the first role card (Brand Solutions Executive)
  const roleCard = page.locator('.rolerow').first();
  await roleCard.scrollIntoViewIfNeeded();
  console.log('Clicking role card...');
  await roleCard.click();
  await page.waitForTimeout(500);

  // Measure drawer and scrim
  const drawerStats = await page.evaluate(() => {
    const drawer = document.querySelector('.drawer.on');
    const scrim = document.querySelector('.scrim.on');
    const bodyChildren = [...document.body.children].map(c => c.tagName + (c.id ? '#' + c.id : '') + (c.className ? '.' + c.className.split(' ').join('.') : ''));

    const drawerRect = drawer ? drawer.getBoundingClientRect() : null;
    const scrimRect = scrim ? scrim.getBoundingClientRect() : null;

    return {
      hasDrawer: !!drawer,
      hasScrim: !!scrim,
      isDrawerInBody: drawer ? drawer.parentElement === document.body : false,
      isScrimInBody: scrim ? scrim.parentElement === document.body : false,
      drawerRect,
      scrimRect,
      bodyChildren
    };
  });

  console.log('Drawer & Scrim Stats:', JSON.stringify(drawerStats, null, 2));

  // Take screenshot of viewport with open drawer
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'drawer_fix_01_open.png') });

  // Click "Apply for this role" inside the drawer
  const applyBtn = page.locator('.drawer .df button.btn.accent');
  console.log('Clicking Apply for this role button in drawer...');
  await applyBtn.click();
  await page.waitForTimeout(500);

  const modalStats = await page.evaluate(() => {
    const modal = document.querySelector('.modal.on');
    const isModalInBody = modal ? modal.parentElement === document.body : false;
    const modalRect = modal ? modal.getBoundingClientRect() : null;
    return {
      hasModal: !!modal,
      isModalInBody,
      modalRect
    };
  });
  console.log('Modal Stats:', modalStats);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'drawer_fix_02_apply_modal.png') });

  await browser.close();
  console.log('=== Verification Finished ===');
}

verifyDrawerFix().catch(err => {
  console.error(err);
  process.exit(1);
});

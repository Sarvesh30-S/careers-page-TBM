const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = { steps: [] };

  try {
    // -------------------------------------------------------------
    // 1. Desktop Light (1280x800)
    // -------------------------------------------------------------
    console.log('Testing Desktop Light...');
    const contextLight = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      colorScheme: 'light'
    });
    const page = await contextLight.newPage();
    await page.goto('http://localhost:3000/#roles', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const allBtn = page.locator('#deptchips button[data-dept="All"]');
    await allBtn.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);

    // Initial state
    const initialChipCount = await page.locator('#deptchips .chip').count();
    const initialPressed = await allBtn.getAttribute('aria-pressed');
    const initialExpanded = await allBtn.getAttribute('aria-expanded');
    const initialAllBg = await allBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
    const initialAllColor = await allBtn.evaluate(el => window.getComputedStyle(el).color);
    const initialRoleCount = await page.locator('.rolerow').count();

    console.log(`Initial Desktop: chips=${initialChipCount}, pressed=${initialPressed}, expanded=${initialExpanded}, bg=${initialAllBg}, color=${initialAllColor}, roles=${initialRoleCount}`);

    const p1 = path.join(ARTIFACT_DIR, 'p6_filter_final_desktop_initial_collapsed.png');
    await page.screenshot({ path: p1, fullPage: false });

    results.steps.push({
      test: 'Desktop Light Initial Collapsed',
      chipCount: initialChipCount,
      allPressed: initialPressed,
      allExpanded: initialExpanded,
      allBg: initialAllBg,
      allColor: initialAllColor,
      roleCount: initialRoleCount,
      pass: initialChipCount === 1 && initialPressed === 'true' && initialExpanded === 'false'
    });

    // Click "All 11" to expand
    console.log('Clicking All 11 to expand...');
    await allBtn.click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);

    const expandedChipCount = await page.locator('#deptchips .chip').count();
    const expandedPressed = await allBtn.getAttribute('aria-pressed');
    const expandedExpanded = await allBtn.getAttribute('aria-expanded');
    const expandedAllBg = await allBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
    const expandedAllColor = await allBtn.evaluate(el => window.getComputedStyle(el).color);

    console.log(`Expanded Desktop: chips=${expandedChipCount}, pressed=${expandedPressed}, expanded=${expandedExpanded}, bg=${expandedAllBg}, color=${expandedAllColor}`);

    const p2 = path.join(ARTIFACT_DIR, 'p6_filter_final_desktop_expanded.png');
    await page.screenshot({ path: p2, fullPage: false });

    results.steps.push({
      test: 'Desktop Light Expanded All',
      chipCount: expandedChipCount,
      allPressed: expandedPressed,
      allExpanded: expandedExpanded,
      allBg: expandedAllBg,
      allColor: expandedAllColor,
      pass: expandedChipCount === 10 && expandedPressed === 'true' && expandedExpanded === 'true'
    });

    // Click "Creative Team 2"
    console.log('Clicking Creative Team chip...');
    const creativeBtn = page.locator('#deptchips button[data-dept="Creative Team"]');
    await creativeBtn.click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);

    const creativePressed = await creativeBtn.getAttribute('aria-pressed');
    const allAfterCreativePressed = await allBtn.getAttribute('aria-pressed');
    const creativeRoleCount = await page.locator('.rolerow').count();
    const countText = await page.locator('#rolecount').textContent();

    console.log(`Creative Team Selected: creativePressed=${creativePressed}, allPressed=${allAfterCreativePressed}, roles=${creativeRoleCount}, text="${countText}"`);

    const p3 = path.join(ARTIFACT_DIR, 'p6_filter_final_desktop_creative_selected.png');
    await page.screenshot({ path: p3, fullPage: false });

    results.steps.push({
      test: 'Desktop Light Creative Team Selected',
      creativePressed,
      allPressed: allAfterCreativePressed,
      roleCount: creativeRoleCount,
      countText,
      pass: creativePressed === 'true' && allAfterCreativePressed === 'false' && creativeRoleCount === 2
    });

    // Click "All 11" again to restore All and collapse
    console.log('Clicking All 11 to recollapse and restore...');
    await allBtn.click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);

    const recollapsedChipCount = await page.locator('#deptchips .chip').count();
    const recollapsedPressed = await allBtn.getAttribute('aria-pressed');
    const recollapsedExpanded = await allBtn.getAttribute('aria-expanded');
    const recollapsedAllBg = await allBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
    const recollapsedRoleCount = await page.locator('.rolerow').count();

    console.log(`Recollapsed Desktop: chips=${recollapsedChipCount}, pressed=${recollapsedPressed}, expanded=${recollapsedExpanded}, bg=${recollapsedAllBg}, roles=${recollapsedRoleCount}`);

    const p4 = path.join(ARTIFACT_DIR, 'p6_filter_final_desktop_recollapsed.png');
    await page.screenshot({ path: p4, fullPage: false });

    results.steps.push({
      test: 'Desktop Light Recollapsed All',
      chipCount: recollapsedChipCount,
      allPressed: recollapsedPressed,
      allExpanded: recollapsedExpanded,
      allBg: recollapsedAllBg,
      roleCount: recollapsedRoleCount,
      pass: recollapsedChipCount === 1 && recollapsedPressed === 'true' && recollapsedExpanded === 'false' && recollapsedRoleCount === 11
    });

    await contextLight.close();

    // -------------------------------------------------------------
    // 2. Mobile Viewport (390x844)
    // -------------------------------------------------------------
    console.log('Testing Mobile 390x844...');
    const contextMobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      colorScheme: 'light'
    });
    const pageMob = await contextMobile.newPage();
    await pageMob.goto('http://localhost:3000/#roles', { waitUntil: 'networkidle' });
    await pageMob.waitForTimeout(500);

    const mobAllBtn = pageMob.locator('#deptchips button[data-dept="All"]');
    await mobAllBtn.scrollIntoViewIfNeeded();
    await pageMob.mouse.move(0, 0);
    await pageMob.waitForTimeout(300);

    const mobInitialCount = await pageMob.locator('#deptchips .chip').count();
    const mobInitialPressed = await mobAllBtn.getAttribute('aria-pressed');
    const mobInitialBg = await mobAllBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);

    const pm1 = path.join(ARTIFACT_DIR, 'p6_filter_final_mobile_initial_collapsed.png');
    await pageMob.screenshot({ path: pm1, fullPage: false });

    // Expand on mobile
    console.log('Expanding mobile...');
    await mobAllBtn.click();
    await pageMob.mouse.move(0, 0);
    await pageMob.waitForTimeout(400);

    const mobExpandedCount = await pageMob.locator('#deptchips .chip').count();
    const mobExpandedPressed = await mobAllBtn.getAttribute('aria-pressed');
    const mobExpandedBg = await mobAllBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);

    const pm2 = path.join(ARTIFACT_DIR, 'p6_filter_final_mobile_expanded.png');
    await pageMob.screenshot({ path: pm2, fullPage: false });

    // Collapse on mobile
    console.log('Collapsing mobile...');
    await mobAllBtn.click();
    await pageMob.mouse.move(0, 0);
    await pageMob.waitForTimeout(400);

    const mobRecollapsedCount = await pageMob.locator('#deptchips .chip').count();
    const mobRecollapsedPressed = await mobAllBtn.getAttribute('aria-pressed');

    const pm3 = path.join(ARTIFACT_DIR, 'p6_filter_final_mobile_recollapsed.png');
    await pageMob.screenshot({ path: pm3, fullPage: false });

    results.steps.push({
      test: 'Mobile 390 Collapsed and Expanded',
      mobInitialCount,
      mobInitialPressed,
      mobInitialBg,
      mobExpandedCount,
      mobExpandedPressed,
      mobExpandedBg,
      mobRecollapsedCount,
      mobRecollapsedPressed,
      pass: mobInitialCount === 1 && mobInitialPressed === 'true' && mobExpandedCount === 10 && mobExpandedPressed === 'true' && mobRecollapsedCount === 1
    });

    await contextMobile.close();

    // -------------------------------------------------------------
    // 3. Dark Mode Desktop (1280x800)
    // -------------------------------------------------------------
    console.log('Testing Dark Mode...');
    const contextDark = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      colorScheme: 'dark'
    });
    const pageDark = await contextDark.newPage();
    await pageDark.goto('http://localhost:3000/#roles', { waitUntil: 'networkidle' });
    await pageDark.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await pageDark.waitForTimeout(500);

    const darkAllBtn = pageDark.locator('#deptchips button[data-dept="All"]');
    await darkAllBtn.scrollIntoViewIfNeeded();
    await pageDark.mouse.move(0, 0);
    await pageDark.waitForTimeout(300);

    const darkInitialCount = await pageDark.locator('#deptchips .chip').count();
    const darkInitialPressed = await darkAllBtn.getAttribute('aria-pressed');

    const pd1 = path.join(ARTIFACT_DIR, 'p6_filter_final_desktop_dark_initial.png');
    await pageDark.screenshot({ path: pd1, fullPage: false });

    // Expand dark
    console.log('Expanding dark...');
    await darkAllBtn.click();
    await pageDark.mouse.move(0, 0);
    await pageDark.waitForTimeout(400);

    const darkExpandedCount = await pageDark.locator('#deptchips .chip').count();
    const darkExpandedPressed = await darkAllBtn.getAttribute('aria-pressed');

    const pd2 = path.join(ARTIFACT_DIR, 'p6_filter_final_desktop_dark_expanded.png');
    await pageDark.screenshot({ path: pd2, fullPage: false });

    // Collapse dark
    console.log('Collapsing dark...');
    await darkAllBtn.click();
    await pageDark.mouse.move(0, 0);
    await pageDark.waitForTimeout(400);

    const darkRecollapsedCount = await pageDark.locator('#deptchips .chip').count();
    const darkRecollapsedPressed = await darkAllBtn.getAttribute('aria-pressed');

    const pd3 = path.join(ARTIFACT_DIR, 'p6_filter_final_desktop_dark_recollapsed.png');
    await pageDark.screenshot({ path: pd3, fullPage: false });

    results.steps.push({
      test: 'Dark Mode Initial and Expanded',
      darkInitialCount,
      darkInitialPressed,
      darkExpandedCount,
      darkExpandedPressed,
      darkRecollapsedCount,
      darkRecollapsedPressed,
      pass: darkInitialCount === 1 && darkInitialPressed === 'true' && darkExpandedCount === 10 && darkExpandedPressed === 'true' && darkRecollapsedCount === 1
    });

    await contextDark.close();

    // -------------------------------------------------------------
    // Save Results
    // -------------------------------------------------------------
    const resultPath = path.join(ARTIFACT_DIR, 'p6_filter_final_verification_results.json');
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
    console.log('Testing finished. All results saved to:', resultPath);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

run();

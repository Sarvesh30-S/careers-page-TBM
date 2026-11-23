const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function verifyFilterChange() {
  console.log("=== Verifying Department Filter: White When Collapsed, Black When Clicked ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  const testReport = {
    initialCollapsedState: {},
    expandedState: {},
    departmentSelectionTests: [],
    recollapseState: {},
    responsiveChecks: {},
    consoleErrors: [],
  };

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      testReport.consoleErrors.push(msg.text());
    }
  });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  // Scroll to #roles section
  const rolesSec = page.locator("#roles");
  await rolesSec.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  // 1. Initial Collapsed State Verification
  console.log("--- 1. Testing Initial Collapsed State (Must be WHITE) ---");
  const allChip = page.locator('#deptchips button[data-dept="All"]');
  const initialChipsCount = await page.locator("#deptchips button.chip").count();
  const allChipText = await allChip.textContent();
  const allChipPressed = await allChip.getAttribute("aria-pressed");
  const allChipExpanded = await allChip.getAttribute("aria-expanded");

  const initialColors = await allChip.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      color: cs.color,
      border: cs.borderColor,
    };
  });

  testReport.initialCollapsedState = {
    totalChipsVisible: initialChipsCount,
    allChipText: allChipText.trim(),
    allChipPressed,
    allChipExpanded,
    colors: initialColors,
    isWhiteBackground: initialColors.bg === "rgb(255, 255, 255)",
    isDarkText: initialColors.color === "rgb(5, 6, 8)",
  };
  console.log("Initial state:", testReport.initialCollapsedState);

  // Screenshot 1: Initial Collapsed State (WHITE All button)
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "p6_filter_1_initial_collapsed.png"),
  });

  // 2. Click "All 11" to Expand (Must become BLACK)
  console.log("--- 2. Clicking All 11 to Expand (Must become BLACK) ---");
  await allChip.click();
  await page.waitForTimeout(400);

  const expandedChipsCount = await page.locator("#deptchips button.chip").count();
  const allChipExpandedAfter = await allChip.getAttribute("aria-expanded");
  const allChipPressedAfter = await allChip.getAttribute("aria-pressed");

  const expandedColors = await allChip.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      color: cs.color,
      border: cs.borderColor,
    };
  });

  testReport.expandedState = {
    totalChipsVisible: expandedChipsCount,
    allChipExpanded: allChipExpandedAfter,
    allChipPressed: allChipPressedAfter,
    colors: expandedColors,
    isBlackBackground: expandedColors.bg === "rgb(5, 6, 8)",
    isWhiteText: expandedColors.color === "rgb(246, 243, 238)",
    allDepartmentsRevealed: expandedChipsCount === 10,
  };
  console.log("Expanded state:", testReport.expandedState);

  // Screenshot 2: Expanded State (BLACK All button + revealed department chips)
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "p6_filter_2_expanded_all.png"),
  });

  // 3. Test Department Selection
  console.log("--- 3. Testing Department Selection ---");
  const creativeChip = page.locator('#deptchips button[data-dept="Creative Team"]');
  await creativeChip.click();
  await page.waitForTimeout(200);

  const countAfterCreative = await page.locator("#rolelist .rolerow").count();
  const countText = await page.locator("#rolecount").textContent();
  const creativeColors = await creativeChip.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return { bg: cs.backgroundColor, color: cs.color };
  });
  const allColorsAfterCreative = await allChip.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return { bg: cs.backgroundColor, color: cs.color };
  });

  testReport.departmentSelectionTests.push({
    dept: "Creative Team",
    cardsRendered: countAfterCreative,
    countText,
    creativeColors,
    allColorsAfterCreative,
    isCreativeBlack: creativeColors.bg === "rgb(5, 6, 8)",
    isAllWhite: allColorsAfterCreative.bg === "rgb(255, 255, 255)",
  });
  console.log("Department selection:", testReport.departmentSelectionTests[0]);

  // Screenshot 3: Creative Team Selected
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "p6_filter_3_selected_creative.png"),
  });

  // 4. Click All Again to Collapse & Reset (Must return to WHITE)
  console.log("--- 4. Clicking All Again to Collapse & Reset (Must return to WHITE) ---");
  await allChip.click();
  await page.waitForTimeout(450); // 180ms unmount + 200ms CSS transition settle

  const recollapsedChipsCount = await page.locator("#deptchips button.chip").count();
  const allChipRecollapsed = await allChip.getAttribute("aria-expanded");
  const allChipPressedFinal = await allChip.getAttribute("aria-pressed");
  const rolesCountFinal = await page.locator("#rolelist .rolerow").count();

  // Move mouse away to avoid hover state affecting border/background
  await page.mouse.move(0, 0);

  const finalColors = await allChip.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      color: cs.color,
      border: cs.borderColor,
    };
  });

  testReport.recollapseState = {
    totalChipsVisible: recollapsedChipsCount,
    allChipExpanded: allChipRecollapsed,
    allChipPressed: allChipPressedFinal,
    rolesRendered: rolesCountFinal,
    colors: finalColors,
    isWhiteBackground: finalColors.bg === "rgb(255, 255, 255)",
    isDarkText: finalColors.color === "rgb(5, 6, 8)",
    isFullyCollapsed: recollapsedChipsCount === 1,
    isResetToAllRoles: rolesCountFinal === 11,
  };
  console.log("Recollapsed state:", testReport.recollapseState);

  // Screenshot 4: Recollapsed State (WHITE All button)
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "p6_filter_4_recollapsed_reset.png"),
  });

  // 5. Test Mobile 390
  console.log("--- 5. Testing Mobile 390 ---");
  const mobPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await mobPage.locator("#roles").scrollIntoViewIfNeeded();
  await mobPage.waitForTimeout(300);

  // Position it nicely so heading and chips are visible
  await mobPage.evaluate(() => {
    const el = document.getElementById("deptchips");
    window.scrollTo({ top: el.offsetTop - 180, behavior: "instant" });
  });
  await mobPage.waitForTimeout(200);

  // Screenshot 5: Mobile Collapsed (WHITE All button)
  await mobPage.screenshot({
    path: path.join(ARTIFACT_DIR, "p6_filter_5_mobile_390_collapsed.png"),
  });

  // Click All to expand
  await mobPage.locator('#deptchips button[data-dept="All"]').click();
  await mobPage.waitForTimeout(400);

  // Screenshot 6: Mobile Expanded (BLACK All button + wrapped department chips)
  await mobPage.screenshot({
    path: path.join(ARTIFACT_DIR, "p6_filter_6_mobile_390_expanded.png"),
  });

  const mobScrollW = await mobPage.evaluate(() => document.documentElement.scrollWidth);
  const mobClientW = await mobPage.evaluate(() => document.documentElement.clientWidth);

  testReport.responsiveChecks.mobile_390 = {
    noOverflow: mobScrollW <= mobClientW,
    scrollWidth: mobScrollW,
    clientWidth: mobClientW,
  };

  await mobPage.close();
  await page.close();
  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "phase6_filter_ui_change_results.json"),
    JSON.stringify(testReport, null, 2)
  );

  console.log("=== Verification Completed Successfully! ===");
}

verifyFilterChange().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

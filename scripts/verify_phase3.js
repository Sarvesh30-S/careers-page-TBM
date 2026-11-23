const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function run() {
  console.log("=== Launching Edge via Playwright ===");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  const results = {
    viewports: {},
    scenarios: {},
    consoleErrors: [],
  };

  // Helper to test a page setup
  async function testPage(viewport, colorScheme, filenamePrefix) {
    const context = await browser.newContext({
      viewport,
      colorScheme,
    });
    const page = await context.newPage();

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        results.consoleErrors.push({
          viewport: `${viewport.width}x${viewport.height}`,
          colorScheme,
          text: msg.text(),
        });
      }
    });

    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    // Measure Header CTA
    const logoBox = await page.locator("header .logo").first().boundingBox();
    const ctaBox = await page.locator("header .btn.sm").boundingBox();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    const vpKey = `${viewport.width}x${viewport.height}_${colorScheme}`;
    results.viewports[vpKey] = {
      viewport,
      colorScheme,
      scrollWidth,
      clientWidth,
      noOverflow: scrollWidth <= clientWidth,
      logoBox,
      ctaBox,
      ctaRightMargin: clientWidth - (ctaBox ? ctaBox.x + ctaBox.width : 0),
    };

    console.log(`[${vpKey}] scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, CTA right margin: ${results.viewports[vpKey].ctaRightMargin.toFixed(1)}px`);

    // Screenshot top (Hero + Header + Culture Photo)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `${filenamePrefix}_top.png`),
    });

    // Scroll to #life and test Why Ladder
    await page.locator("#life").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Screenshot Why Ladder Section Top
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `${filenamePrefix}_ladder_top.png`),
    });

    await context.close();
  }

  // 1. Desktop Light (1440x900)
  await testPage({ width: 1440, height: 900 }, "light", "p3_final_desktop_1440_light");
  // 2. Desktop Dark (1440x900)
  await testPage({ width: 1440, height: 900 }, "dark", "p3_final_desktop_1440_dark");
  // 3. Mobile 390x844 Light
  await testPage({ width: 390, height: 844 }, "light", "p3_final_mobile_390_light");
  // 4. Mobile 390x844 Dark
  await testPage({ width: 390, height: 844 }, "dark", "p3_final_mobile_390_dark");
  // 5. Mobile 375x812 Light
  await testPage({ width: 375, height: 812 }, "light", "p3_final_mobile_375_light");
  // 6. Mobile 360x800 Light
  await testPage({ width: 360, height: 800 }, "light", "p3_final_mobile_360_light");

  // === Now Test All 3 Scenarios & All 5 Steps Thoroughly ===
  console.log("\n=== Testing All 3 Scenarios & All 5 Steps ===");
  const testContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
  });
  const page = await testContext.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const scenarioNames = ["A hiring request", "A meeting invite", "A tight deadline"];

  for (let sIdx = 0; sIdx < scenarioNames.length; sIdx++) {
    const sName = scenarioNames[sIdx];
    console.log(`\n--- Scenario ${sIdx + 1}: "${sName}" ---`);

    // Click tab
    const tabButton = page.locator("#ltabs button").nth(sIdx);
    await tabButton.click();
    await page.waitForTimeout(200);

    results.scenarios[sName] = { steps: [] };

    // Test each of the 5 steps (0 to 4)
    for (let stepIdx = 0; stepIdx < 5; stepIdx++) {
      const dot = page.locator("#ldots button").nth(stepIdx);
      await dot.click();
      await page.waitForTimeout(200);

      const countText = await page.locator("#lcount").innerText();
      const whyText = await page.locator("#lwhy").innerText();
      const headingText = await page.locator("#lstate").innerText();
      const isRootClass = await page.locator("#lstate").evaluate((el) => el.classList.contains("root"));

      // Get breadcrumbs
      const breadcrumbs = await page.locator("#lhist li").allInnerTexts();

      results.scenarios[sName].steps.push({
        stepIdx,
        countText,
        whyText,
        headingText,
        isRootClass,
        breadcrumbs,
      });

      console.log(`  Step ${stepIdx} [${countText}]: "${headingText}" | prompt: "${whyText}" | crumbs: ${breadcrumbs.length}`);
    }

    // Capture screenshot of Step 5 (index 4) for this scenario on Desktop
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `p3_final_desktop_s${sIdx + 1}_step5.png`),
    });
  }

  // Also test Mobile 390x844 breadcrumbs on Scenario 1 & 2 Step 5
  console.log("\n=== Testing Mobile Breadcrumb Wrapping at 390x844 & 360x800 ===");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "light",
  });
  const mPage = await mobileContext.newPage();
  await mPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  // Scenario 1 Step 5 on mobile
  await mPage.locator("#ltabs button").nth(0).click();
  await mPage.locator("#ldots button").nth(4).click();
  await mPage.waitForTimeout(200);
  await mPage.screenshot({
    path: path.join(ARTIFACT_DIR, "p3_final_mobile_390_s1_step5.png"),
  });

  // Scenario 2 Step 5 on mobile (long breadcrumb text)
  await mPage.locator("#ltabs button").nth(1).click();
  await mPage.locator("#ldots button").nth(4).click();
  await mPage.waitForTimeout(200);

  // Measure breadcrumbs bounding boxes
  const breadcrumbBoxes = [];
  const crumbs = mPage.locator("#lhist li");
  const count = await crumbs.count();
  for (let c = 0; c < count; c++) {
    const box = await crumbs.nth(c).boundingBox();
    const text = await crumbs.nth(c).innerText();
    breadcrumbBoxes.push({ text, box });
  }

  results.mobileBreadcrumbs390 = breadcrumbBoxes;

  await mPage.screenshot({
    path: path.join(ARTIFACT_DIR, "p3_final_mobile_390_s2_step5.png"),
  });

  // Scenario 2 Step 5 on 360x800
  await mPage.setViewportSize({ width: 360, height: 800 });
  await mPage.waitForTimeout(200);
  await mPage.screenshot({
    path: path.join(ARTIFACT_DIR, "p3_final_mobile_360_s2_step5.png"),
  });

  await testContext.close();
  await mobileContext.close();
  await browser.close();

  // Save full results JSON
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "phase3_verification_results.json"),
    JSON.stringify(results, null, 2),
    "utf8"
  );

  console.log("\n=== Completed All Phase 3 Verifications Successfully! ===");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

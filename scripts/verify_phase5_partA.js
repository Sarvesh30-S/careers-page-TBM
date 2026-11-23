const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function verifyQuiz() {
  console.log("=== Launching Playwright to Verify Phase 5 Part A: Culture Fit Quiz ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  const results = {
    viewports: {},
    scoringTiers: {},
    consoleErrors: [],
  };

  const viewports = [
    { width: 1440, height: 900, name: "desktop_1440", scheme: "light" },
    { width: 1440, height: 900, name: "desktop_1440", scheme: "dark" },
    { width: 1280, height: 800, name: "desktop_1280", scheme: "dark" },
    { width: 768, height: 1024, name: "tablet_768", scheme: "light" },
    { width: 768, height: 1024, name: "tablet_768", scheme: "dark" },
    { width: 390, height: 844, name: "mobile_390", scheme: "light" },
    { width: 390, height: 844, name: "mobile_390", scheme: "dark" },
    { width: 375, height: 812, name: "mobile_375", scheme: "light" },
    { width: 375, height: 812, name: "mobile_375", scheme: "dark" },
    { width: 360, height: 800, name: "mobile_360", scheme: "light" },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: vp.scheme,
    });
    const page = await context.newPage();

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        results.consoleErrors.push({
          viewport: `${vp.width}x${vp.height}_${vp.scheme}`,
          text: msg.text(),
        });
      }
    });

    const url = vp.scheme === "dark" ? "http://localhost:3000/?theme=dark" : "http://localhost:3000/";
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    const vpKey = `${vp.width}x${vp.height}_${vp.scheme}`;
    results.viewports[vpKey] = {
      scrollWidth,
      clientWidth,
      noOverflow: scrollWidth <= clientWidth,
    };
    console.log(`[${vpKey}] scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, noOverflow: ${scrollWidth <= clientWidth}`);

    // If 1440 light, run full interaction testing
    if (vp.width === 1440 && vp.scheme === "light") {
      const fitSec = page.locator("#fit");
      await fitSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);

      // Screenshot Question 1 Initial State
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_desktop_1440_light_quiz_q1.png"),
      });

      // Test Case 1: Answer all 6 as aligned (data-q="1")
      for (let step = 0; step < 6; step++) {
        const alignedBtn = page.locator("#quiz button.qopt[data-q='1']");
        await alignedBtn.click();
        await page.waitForTimeout(150);
      }

      const resHeading6 = await page.locator("#quiz .qres h3").textContent();
      const resPara6 = await page.locator("#quiz .qres p").textContent();
      results.scoringTiers.tier_6_of_6 = { heading: resHeading6, paragraph: resPara6 };
      console.log(`Tier 6/6: "${resHeading6}" | "${resPara6}"`);

      // Screenshot Perfect Fit Result
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_desktop_1440_light_quiz_result_perfect.png"),
      });

      // Click "Start over"
      await page.locator("#quiz button[data-qreset]").click();
      await page.waitForTimeout(200);

      // Verify back at Question 1
      const isBackAtQ1 = await page.locator("#quiz .qopts").isVisible();
      console.log(`Start over worked: ${isBackAtQ1}`);

      // Test Case 2: Answer 4 aligned, 2 conventional (data-q="0") -> Mostly a fit
      for (let step = 0; step < 6; step++) {
        // Choose conventional for step 1 and step 3
        const pickAttr = (step === 1 || step === 3) ? "0" : "1";
        const btn = page.locator(`#quiz button.qopt[data-q='${pickAttr}']`);
        await btn.click();
        await page.waitForTimeout(150);
      }
      const resHeading4 = await page.locator("#quiz .qres h3").textContent();
      const resPara4 = await page.locator("#quiz .qres p").textContent();
      results.scoringTiers.tier_4_of_6 = { heading: resHeading4, paragraph: resPara4 };
      console.log(`Tier 4/6: "${resHeading4}" | "${resPara4}"`);

      // Screenshot Mostly a Fit Result
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_desktop_1440_light_quiz_result_mostly.png"),
      });

      // Test Case 3: Start over and answer only 2 aligned, 4 conventional -> Honest heads-up
      await page.locator("#quiz button[data-qreset]").click();
      await page.waitForTimeout(200);
      for (let step = 0; step < 6; step++) {
        const pickAttr = step < 2 ? "1" : "0";
        const btn = page.locator(`#quiz button.qopt[data-q='${pickAttr}']`);
        await btn.click();
        await page.waitForTimeout(150);
      }
      const resHeading2 = await page.locator("#quiz .qres h3").textContent();
      const resPara2 = await page.locator("#quiz .qres p").textContent();
      results.scoringTiers.tier_2_of_6 = { heading: resHeading2, paragraph: resPara2 };
      console.log(`Tier 2/6: "${resHeading2}" | "${resPara2}"`);
    }

    // Capture Dark Mode Desktop 1440
    if (vp.width === 1440 && vp.scheme === "dark") {
      const fitSec = page.locator("#fit");
      await fitSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_desktop_1440_dark_quiz_q1.png"),
      });

      // Answer 6 to show dark results
      for (let step = 0; step < 6; step++) {
        await page.locator("#quiz button.qopt[data-q='1']").click();
        await page.waitForTimeout(100);
      }
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_desktop_1440_dark_quiz_result.png"),
      });
    }

    // Capture Mobile 390 Light
    if (vp.width === 390 && vp.scheme === "light") {
      const fitSec = page.locator("#fit");
      await fitSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_mobile_390_light_quiz_q1.png"),
      });

      for (let step = 0; step < 6; step++) {
        await page.locator("#quiz button.qopt[data-q='1']").click();
        await page.waitForTimeout(100);
      }
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_mobile_390_light_quiz_result.png"),
      });
    }

    // Capture Mobile 375 Light & Dark
    if (vp.width === 375 && vp.scheme === "light") {
      const fitSec = page.locator("#fit");
      await fitSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_mobile_375_light_quiz_q1.png"),
      });

      for (let step = 0; step < 6; step++) {
        await page.locator("#quiz button.qopt[data-q='1']").click();
        await page.waitForTimeout(100);
      }
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_mobile_375_light_quiz_result.png"),
      });
    }

    if (vp.width === 375 && vp.scheme === "dark") {
      const fitSec = page.locator("#fit");
      await fitSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_mobile_375_dark_quiz_q1.png"),
      });
    }

    // Capture Tablet 768 Dark
    if (vp.width === 768 && vp.scheme === "dark") {
      const fitSec = page.locator("#fit");
      await fitSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5_tablet_768_dark_quiz_q1.png"),
      });
    }

    await context.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "phase5_partA_verification_results.json"),
    JSON.stringify(results, null, 2)
  );
  console.log("=== Completed Phase 5 Part A Verifications Successfully! ===");
}

verifyQuiz().catch((err) => {
  console.error("Quiz verification failed:", err);
  process.exit(1);
});

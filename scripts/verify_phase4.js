const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function run() {
  console.log("=== Launching Edge via Playwright for Phase 4 Verifications ===");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  const results = {
    viewports: {},
    scenarios: [],
    accordions: [],
    scrollSpy: {},
    consoleErrors: [],
  };

  // Helper to test a page setup across viewports
  const viewportsToTest = [
    { width: 1440, height: 900, name: "desktop_1440", scheme: "light" },
    { width: 1440, height: 900, name: "desktop_1440", scheme: "dark" },
    { width: 1280, height: 800, name: "desktop_1280", scheme: "light" },
    { width: 768, height: 1024, name: "tablet_768", scheme: "light" },
    { width: 390, height: 844, name: "mobile_390", scheme: "light" },
    { width: 390, height: 844, name: "mobile_390", scheme: "dark" },
    { width: 375, height: 812, name: "mobile_375", scheme: "light" },
    { width: 360, height: 800, name: "mobile_360", scheme: "light" },
  ];

  for (const vp of viewportsToTest) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: vp.scheme,
    });
    const page = await context.newPage();

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        results.consoleErrors.push({
          viewport: `${vp.width}x${vp.height}`,
          colorScheme: vp.scheme,
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
      viewport: vp,
      scrollWidth,
      clientWidth,
      noOverflow: scrollWidth <= clientWidth,
    };

    console.log(`[${vpKey}] scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, noOverflow: ${scrollWidth <= clientWidth}`);

    // If 1440 light, capture full views and test interactions
    if (vp.width === 1440 && vp.scheme === "light") {
      // 1. Check Second Order Thinking initial state
      const nextSec = page.locator("#next");
      await nextSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);

      const kicker = await page.locator("#next .kicker").textContent();
      const heading = await page.locator("#next-h").textContent();
      const initialHint = await page.locator("#chain .hint").textContent();
      console.log(`Second-Order Thinking: kicker="${kicker}", heading="${heading}", hint="${initialHint}"`);

      // Screenshot Second-Order Thinking initial hint state
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_desktop_1440_light_next_initial.png"),
      });

      // Test all 3 thinking scenarios
      for (let sIdx = 0; sIdx < 3; sIdx++) {
        // Click scenario tab
        const tabBtn = page.locator("#twtabs button").nth(sIdx);
        const tabText = await tabBtn.textContent();
        await tabBtn.click();
        await page.waitForTimeout(150);

        const qText = await page.locator("#twq").textContent();
        const hintAfterTab = await page.locator("#chain .hint").textContent();

        // Test option 0
        const opt0Btn = page.locator("#twopts button").nth(0);
        const opt0Label = await opt0Btn.textContent();
        await opt0Btn.click();
        await page.waitForTimeout(400); // allow animation

        const chainSteps0 = await page.locator("#chain li b").allTextContents();
        const chainWhens0 = await page.locator("#chain li small").allTextContents();
        const isBad0 = await page.locator("#chain li.end").evaluate((el) => el.classList.contains("bad"));
        const isGood0 = await page.locator("#chain li.end").evaluate((el) => el.classList.contains("good"));

        // Screenshot scenario 0 option 0 (bad ending)
        if (sIdx === 0) {
          await page.screenshot({
            path: path.join(ARTIFACT_DIR, "p4_desktop_1440_light_s0_opt0_bad.png"),
          });
        }

        // Test option 1
        const opt1Btn = page.locator("#twopts button").nth(1);
        const opt1Label = await opt1Btn.textContent();
        await opt1Btn.click();
        await page.waitForTimeout(400); // allow animation

        const chainSteps1 = await page.locator("#chain li b").allTextContents();
        const isBad1 = await page.locator("#chain li.end").evaluate((el) => el.classList.contains("bad"));
        const isGood1 = await page.locator("#chain li.end").evaluate((el) => el.classList.contains("good"));

        // Screenshot each scenario good ending
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, `p4_desktop_1440_light_s${sIdx}_opt1_good.png`),
        });

        results.scenarios.push({
          scenarioIndex: sIdx,
          tabText,
          qText,
          hintAfterTab,
          opt0: { label: opt0Label, steps: chainSteps0, whens: chainWhens0, isBad: isBad0 },
          opt1: { label: opt1Label, steps: chainSteps1, isGood: isGood1 },
        });
        console.log(`Scenario ${sIdx} (${tabText}): opt0 (bad: ${isBad0}) -> opt1 (good: ${isGood1})`);
      }

      // 2. Core Values & Accordions
      const valuesSec = page.locator("#values");
      await valuesSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const vKicker = await page.locator("#values .kicker").textContent();
      const vHeading = await page.locator("#values-h").textContent();
      const groupCount = await page.locator(".vgroup").count();
      const valueCount = await page.locator(".vgroup .value").count();
      console.log(`Values Section: kicker="${vKicker}", heading="${vHeading}", groups=${groupCount}, values=${valueCount}`);

      // Screenshot Core Values Top
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_desktop_1440_light_values_top.png"),
      });

      // Test all 6 accordions
      for (let vIdx = 0; vIdx < valueCount; vIdx++) {
        const valueRow = page.locator(".vgroup .value").nth(vIdx);
        const title = await valueRow.locator("h4").textContent();
        const moreBtn = valueRow.locator("button.more");
        const tueDiv = valueRow.locator(".tue");

        const initialExpanded = await moreBtn.getAttribute("aria-expanded");
        const initialVisible = await tueDiv.isVisible();

        // Click to expand
        await moreBtn.click();
        await page.waitForTimeout(200);

        const expanded = await moreBtn.getAttribute("aria-expanded");
        const visible = await tueDiv.isVisible();
        const tueText = await tueDiv.textContent();

        // Click to collapse
        await moreBtn.click();
        await page.waitForTimeout(200);
        const collapsed = await moreBtn.getAttribute("aria-expanded");
        const collapsedVisible = await tueDiv.isVisible();

        // Re-expand first one for screenshot
        if (vIdx === 0 || vIdx === 2) {
          await moreBtn.click();
          await page.waitForTimeout(150);
        }

        results.accordions.push({
          vIdx,
          title,
          initialExpanded,
          initialVisible,
          expanded: expanded === "true",
          visible,
          tueText,
          collapsed: collapsed === "false",
          collapsedVisible,
        });
        console.log(`Accordion ${vIdx} (${title}): expanded=${visible}, collapsed=${!collapsedVisible}`);
      }

      // Screenshot with open accordions
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_desktop_1440_light_values_accordions_open.png"),
      });

      // 3. Scroll Spy Testing
      // Scroll to each value row and check if active indicator updates
      for (let vIdx = 0; vIdx < valueCount; vIdx++) {
        const valueRow = page.locator(".vgroup .value").nth(vIdx);
        const box = await valueRow.boundingBox();
        if (box) {
          // Scroll so the middle of this value is near 42% of viewport
          const targetY = (await page.evaluate(() => window.scrollY)) + box.y - 900 * 0.42 + box.height / 2;
          await page.evaluate((y) => window.scrollTo(0, y), targetY);
          await page.waitForTimeout(250);

          const isActive = await valueRow.evaluate((el) => el.classList.contains("active"));
          const parentGroupOn = await valueRow.evaluate((el) => el.closest(".vgroup")?.classList.contains("on"));
          results.scrollSpy[`row_${vIdx}`] = { isActive, parentGroupOn };
        }
      }
      console.log("Scroll spy results:", results.scrollSpy);
    }

    // Capture screenshots for Dark Mode Desktop
    if (vp.width === 1440 && vp.scheme === "dark") {
      const nextSec = page.locator("#next");
      await nextSec.scrollIntoViewIfNeeded();
      // Select option 1 on scenario 0
      const opt1Btn = page.locator("#twopts button").nth(1);
      await opt1Btn.click();
      await page.waitForTimeout(300);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_desktop_1440_dark_next.png"),
      });

      const valuesSec = page.locator("#values");
      await valuesSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      // Open first accordion
      await page.locator(".vgroup .value button.more").first().click();
      await page.waitForTimeout(200);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_desktop_1440_dark_values.png"),
      });
    }

    // Capture Mobile 390 Screenshots
    if (vp.width === 390 && vp.scheme === "light") {
      const nextSec = page.locator("#next");
      await nextSec.scrollIntoViewIfNeeded();
      const opt1Btn = page.locator("#twopts button").nth(1);
      await opt1Btn.click();
      await page.waitForTimeout(300);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_mobile_390_light_next.png"),
      });

      const valuesSec = page.locator("#values");
      await valuesSec.scrollIntoViewIfNeeded();
      await page.locator(".vgroup .value button.more").first().click();
      await page.waitForTimeout(200);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_mobile_390_light_values.png"),
      });
    }

    // Capture Mobile 390 Dark Screenshots
    if (vp.width === 390 && vp.scheme === "dark") {
      const nextSec = page.locator("#next");
      await nextSec.scrollIntoViewIfNeeded();
      const opt1Btn = page.locator("#twopts button").nth(1);
      await opt1Btn.click();
      await page.waitForTimeout(300);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_mobile_390_dark_next.png"),
      });

      const valuesSec = page.locator("#values");
      await valuesSec.scrollIntoViewIfNeeded();
      await page.locator(".vgroup .value button.more").first().click();
      await page.waitForTimeout(200);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_mobile_390_dark_values.png"),
      });
    }

    // Capture Mobile 360 Screenshots
    if (vp.width === 360 && vp.scheme === "light") {
      const nextSec = page.locator("#next");
      await nextSec.scrollIntoViewIfNeeded();
      const opt1Btn = page.locator("#twopts button").nth(1);
      await opt1Btn.click();
      await page.waitForTimeout(300);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_mobile_360_light_next.png"),
      });

      const valuesSec = page.locator("#values");
      await valuesSec.scrollIntoViewIfNeeded();
      await page.locator(".vgroup .value button.more").first().click();
      await page.waitForTimeout(200);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p4_mobile_360_light_values.png"),
      });
    }

    await context.close();
  }

  await browser.close();

  // Save verification results
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "phase4_verification_results.json"),
    JSON.stringify(results, null, 2)
  );
  console.log("=== Completed Phase 4 Verifications Successfully! ===");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

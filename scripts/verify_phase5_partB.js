const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function verifyHiringTimeline() {
  console.log("=== Launching Playwright to Verify Phase 5 Part B: Hiring Timeline ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  const results = {
    viewports: {},
    stepsContent: [],
    scrollAnimation: {},
    navAnchorTest: {},
    consoleErrors: [],
  };

  const viewports = [
    { width: 1440, height: 900, name: "desktop_1440", scheme: "light" },
    { width: 1440, height: 900, name: "desktop_1440", scheme: "dark" },
    { width: 1280, height: 800, name: "desktop_1280", scheme: "light" },
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

    // If 1440 light, run full navigation test & read all content
    if (vp.width === 1440 && vp.scheme === "light") {
      // 1. Test navigation anchor from header with smooth-scroll settling
      const howWeHireLink = page.locator("header nav a[href='#hiring']");
      if (await howWeHireLink.isVisible()) {
        await howWeHireLink.click();
        
        let lastY = -1;
        for (let i = 0; i < 25; i++) {
          await page.waitForTimeout(100);
          const currY = await page.evaluate(() => window.scrollY);
          if (currY === lastY && currY > 0) break;
          lastY = currY;
        }

        const scrollYAfterClick = await page.evaluate(() => window.scrollY);
        const hiringRect = await page.locator("#hiring").evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { top: r.top, offsetTop: el.offsetTop };
        });

        results.navAnchorTest = {
          clicked: true,
          scrollY: scrollYAfterClick,
          hiringSectionTop: hiringRect.offsetTop,
          hiringTopRelativeToViewport: hiringRect.top,
          landedAtHiring: hiringRect.top >= 68 && hiringRect.top <= 200, // Clears the 68px sticky header comfortably
        };
        console.log("Nav anchor test:", results.navAnchorTest);
      }

      const hiringSec = page.locator("#hiring");
      await hiringSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const kicker = await page.locator("#hiring .kicker").textContent();
      const heading = await page.locator("#hiring-h").textContent();
      const desc = await page.locator("#hiring .proc-h p.muted").textContent();

      // Read all 6 steps
      const stepsLoc = page.locator("#steps li");
      const stepCount = await stepsLoc.count();
      for (let i = 0; i < stepCount; i++) {
        const item = stepsLoc.nth(i);
        const titleText = await item.locator("h3").innerText();
        const descText = await item.locator("p").textContent();
        results.stepsContent.push({
          index: i,
          titleText: titleText.replace(/\n/g, " "),
          descText,
        });
      }
      console.log(`Hiring Timeline: kicker="${kicker}", heading="${heading}", steps=${stepCount}`);

      // Screenshot 1: Desktop Light Timeline Top View
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_desktop_1440_light_timeline_top.png"),
      });

      // Now scroll all steps into full active state (adding bottom spacer for Phase 5 standalone verification)
      await page.evaluate(() => {
        const spacer = document.createElement("div");
        spacer.id = "p5-eval-spacer";
        spacer.style.height = "1200px";
        document.body.appendChild(spacer);

        const steps = document.getElementById("steps");
        const lastLi = steps.querySelector("li:last-child");
        const targetY = lastLi.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4;
        window.scrollTo({ top: targetY, behavior: "instant" });
        window.dispatchEvent(new Event("scroll"));
      });
      await page.waitForTimeout(400);

      // Check fill and active classes
      const fillValue = await page.locator("#steps").evaluate((el) => el.style.getPropertyValue("--fill"));
      const activeCount = await page.locator("#steps li.on").count();
      const lastIsActive = await page.locator("#steps li:last-child").evaluate((el) => el.classList.contains("on"));
      const step6DotBg = await page.locator("#steps li:last-child").evaluate((el) => {
        return window.getComputedStyle(el, "::before").backgroundColor;
      });

      results.scrollAnimation = {
        fillValue,
        activeStepsCount: activeCount,
        lastStepActive: lastIsActive,
        step6AccentDotBg: step6DotBg,
      };
      console.log("Scroll animation metrics:", results.scrollAnimation);

      // Screenshot 2: Desktop Light Full Animated Progress & Last Emerald Dot
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_desktop_1440_light_timeline_scrolled.png"),
      });

      await page.evaluate(() => {
        const spacer = document.getElementById("p5-eval-spacer");
        if (spacer) spacer.remove();
      });
    }

    // Helper to scroll timeline into view
    const scrollTimelineInView = async () => {
      await page.evaluate(() => {
        const spacer = document.createElement("div");
        spacer.id = "p5-eval-spacer";
        spacer.style.height = "1200px";
        document.body.appendChild(spacer);

        const steps = document.getElementById("steps");
        const lastLi = steps.querySelector("li:last-child");
        const targetY = lastLi.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4;
        window.scrollTo({ top: targetY, behavior: "instant" });
        window.dispatchEvent(new Event("scroll"));
      });
      await page.waitForTimeout(400);
    };

    // Capture Desktop 1440 Dark
    if (vp.width === 1440 && vp.scheme === "dark") {
      await scrollTimelineInView();
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_desktop_1440_dark_timeline.png"),
      });
    }

    // Capture Desktop 1280 Dark
    if (vp.width === 1280 && vp.scheme === "dark") {
      await scrollTimelineInView();
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_desktop_1280_dark_timeline.png"),
      });
    }

    // Capture Tablet 768 Light & Dark
    if (vp.width === 768 && vp.scheme === "light") {
      await scrollTimelineInView();
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_tablet_768_light_timeline.png"),
      });
    }

    if (vp.width === 768 && vp.scheme === "dark") {
      await scrollTimelineInView();
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_tablet_768_dark_timeline.png"),
      });
    }

    // Capture Mobile 390 Light & Dark
    if (vp.width === 390 && vp.scheme === "light") {
      await scrollTimelineInView();
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_mobile_390_light_timeline.png"),
      });
    }

    if (vp.width === 390 && vp.scheme === "dark") {
      await scrollTimelineInView();
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_mobile_390_dark_timeline.png"),
      });
    }

    // Capture Mobile 375 Light & Dark
    if (vp.width === 375 && vp.scheme === "light") {
      await scrollTimelineInView();
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_mobile_375_light_timeline.png"),
      });
    }

    if (vp.width === 375 && vp.scheme === "dark") {
      await scrollTimelineInView();
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_mobile_375_dark_timeline.png"),
      });
    }

    // Capture Mobile 360 Light
    if (vp.width === 360 && vp.scheme === "light") {
      await scrollTimelineInView();
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p5b_mobile_360_light_timeline.png"),
      });
    }

    await context.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "phase5_partB_verification_results.json"),
    JSON.stringify(results, null, 2)
  );
  console.log("=== Completed Phase 5 Part B Verifications Successfully! ===");
}

verifyHiringTimeline().catch((err) => {
  console.error("Hiring Timeline verification failed:", err);
  process.exit(1);
});

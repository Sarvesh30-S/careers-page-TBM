const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function verifyReviewPoints() {
  console.log("=== Verifying Specific Review Points via Playwright ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  const tasks = [
    {
      name: "1280x800_dark",
      width: 1280,
      height: 800,
      scheme: "dark",
      url: "http://localhost:3000/?theme=dark",
    },
    {
      name: "768x1024_dark",
      width: 768,
      height: 1024,
      scheme: "dark",
      url: "http://localhost:3000/?theme=dark",
    },
    {
      name: "375x812_light",
      width: 375,
      height: 812,
      scheme: "light",
      url: "http://localhost:3000/",
    },
    {
      name: "375x812_dark",
      width: 375,
      height: 812,
      scheme: "dark",
      url: "http://localhost:3000/?theme=dark",
    },
    {
      name: "1440x900_light",
      width: 1440,
      height: 900,
      scheme: "light",
      url: "http://localhost:3000/",
    },
  ];

  const report = {};

  for (const t of tasks) {
    const context = await browser.newContext({
      viewport: { width: t.width, height: t.height },
      colorScheme: t.scheme,
    });
    const page = await context.newPage();
    await page.goto(t.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    // 1. Next section screenshot
    const nextLocator = page.locator("#next");
    await nextLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);

    // Pick an option so consequence chain is visible
    const optBtn = page.locator("#twopts button").nth(1);
    await optBtn.click();
    await page.waitForTimeout(400); // allow draw & rise animations

    const nextShotPath = path.join(ARTIFACT_DIR, `review_${t.name}_next.png`);
    await page.screenshot({ path: nextShotPath });

    // 2. Values section screenshot
    const valuesLocator = page.locator("#values");
    await valuesLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);

    // Open first accordion
    const moreBtn = page.locator(".vgroup .value button.more").first();
    await moreBtn.click();
    await page.waitForTimeout(300); // allow accordion expansion

    const valuesShotPath = path.join(ARTIFACT_DIR, `review_${t.name}_values.png`);
    await page.screenshot({ path: valuesShotPath });

    report[t.name] = {
      viewport: `${t.width}x${t.height}`,
      scheme: t.scheme,
      scrollWidth,
      clientWidth,
      noOverflow: scrollWidth <= clientWidth,
      nextScreenshot: `review_${t.name}_next.png`,
      valuesScreenshot: `review_${t.name}_values.png`,
    };

    console.log(`[${t.name}] scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, noOverflow: ${scrollWidth <= clientWidth}`);
    await context.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "review_verification_report.json"),
    JSON.stringify(report, null, 2)
  );
  console.log("=== Review verifications completed successfully! ===");
}

verifyReviewPoints().catch((err) => {
  console.error("Review verification failed:", err);
  process.exit(1);
});

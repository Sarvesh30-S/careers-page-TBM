const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function snapMobileHeading() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  for (const w of [390, 375]) {
    const page = await browser.newPage({ viewport: { width: w, height: 844 } });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    const hiring = page.locator("#hiring");
    await hiring.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `p5b_mobile_${w}_light_timeline_heading.png`),
    });
  }

  await browser.close();
}

snapMobileHeading().catch(console.error);

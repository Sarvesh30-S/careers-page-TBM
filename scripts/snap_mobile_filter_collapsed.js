const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function snapMob() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const deptChips = page.locator("#deptchips");
  await deptChips.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  // Position it nicely so heading and chips are visible
  await page.evaluate(() => {
    const el = document.getElementById("deptchips");
    window.scrollTo({ top: el.offsetTop - 180, behavior: "instant" });
  });
  await page.waitForTimeout(200);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "p6_filter_5_mobile_390_collapsed.png"),
  });

  await browser.close();
}

snapMob().catch(console.error);

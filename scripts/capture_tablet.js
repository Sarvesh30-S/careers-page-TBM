const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    colorScheme: "light",
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  // Next section on tablet
  const nextSec = page.locator("#next");
  await nextSec.scrollIntoViewIfNeeded();
  await page.locator("#twopts button").nth(1).click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "p4_tablet_768_light_next.png"),
  });

  // Values section on tablet
  const valuesSec = page.locator("#values");
  await valuesSec.scrollIntoViewIfNeeded();
  await page.locator(".vgroup .value button.more").first().click();
  await page.waitForTimeout(200);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "p4_tablet_768_light_values.png"),
  });

  await browser.close();
  console.log("Captured tablet 768 screenshots!");
})();

const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  const fitSec = page.locator("#fit");
  await fitSec.scrollIntoViewIfNeeded();

  // Click [data-q='1'] 6 times
  for (let i = 0; i < 6; i++) {
    await page.locator("#quiz button.qopt[data-q='1']").click();
    await page.waitForTimeout(150);
  }

  const h = await page.locator("#quiz .qres h3").textContent();
  const p = await page.locator("#quiz .qres p").textContent();
  console.log(`Perfect 6/6: heading="${h}", paragraph="${p}"`);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "review_p5_result_perfect_6of6.png"),
  });

  await browser.close();
})();

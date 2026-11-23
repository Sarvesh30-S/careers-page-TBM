const { chromium } = require("playwright");

async function check() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const allChip = page.locator('#deptchips button[data-dept="All"]');
  console.log("1. Initial collapsed:", await allChip.evaluate(el => window.getComputedStyle(el).backgroundColor));

  await allChip.click();
  await page.waitForTimeout(400);
  console.log("2. Expanded (clicked):", await allChip.evaluate(el => window.getComputedStyle(el).backgroundColor));

  await allChip.click();
  await page.waitForTimeout(400); // 180ms unmount + 200ms CSS transition
  console.log("3. Recollapsed (clicked again):", await allChip.evaluate(el => window.getComputedStyle(el).backgroundColor));

  await browser.close();
}

check().catch(console.error);

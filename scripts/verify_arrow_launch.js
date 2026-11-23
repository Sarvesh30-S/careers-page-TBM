const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function verifyArrowLaunch() {
  console.log("=== Verifying Arrow Launch Animation on Hover ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const heroBtn = page.locator('.hero .btn.primary');
  await heroBtn.scrollIntoViewIfNeeded();

  // 1. Resting state (before hover)
  await heroBtn.screenshot({ path: path.join(ARTIFACT_DIR, "arrow_launch_1_resting.png") });

  // 2. Mid-launch (arrow shooting out of the box)
  await heroBtn.hover();
  await page.waitForTimeout(140); // 35% into 500ms animation = ~175ms
  await heroBtn.screenshot({ path: path.join(ARTIFACT_DIR, "arrow_launch_2_shooting_out.png") });

  // 3. Settled hover state (fresh arrow chambered at translateX(4px))
  await page.waitForTimeout(400);
  await heroBtn.screenshot({ path: path.join(ARTIFACT_DIR, "arrow_launch_3_settled_hover.png") });

  // 4. Test Header button "View openings →"
  const headerBtn = page.locator('header .btn.primary');
  await headerBtn.hover();
  await page.waitForTimeout(140);
  await headerBtn.screenshot({ path: path.join(ARTIFACT_DIR, "arrow_launch_header_mid.png") });

  await page.waitForTimeout(400);
  await headerBtn.screenshot({ path: path.join(ARTIFACT_DIR, "arrow_launch_header_settled.png") });

  console.log("Captured all arrow launch screenshots.");
  await browser.close();
}

verifyArrowLaunch();

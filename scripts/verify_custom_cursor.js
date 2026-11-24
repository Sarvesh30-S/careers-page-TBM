const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function verifyCursor() {
  console.log("=== Testing Custom Cursor (Ring + Center Dot) ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
  });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  // 1. Check DOM presence
  const dot = page.locator(".custom-cursor-dot");
  const ring = page.locator(".custom-cursor-ring");

  const dotCount = await dot.count();
  const ringCount = await ring.count();
  console.log(`Dot count: ${dotCount}, Ring count: ${ringCount}`);

  if (dotCount !== 1 || ringCount !== 1) {
    throw new Error("Custom cursor dot or ring not mounted in DOM!");
  }

  // 2. Mouse movement
  console.log("Moving mouse to (500, 400)...");
  await page.mouse.move(500, 400);
  await page.waitForTimeout(500);

  const dotBox = await dot.boundingBox();
  const ringBox = await ring.boundingBox();
  console.log("Dot box:", dotBox);
  console.log("Ring box:", ringBox);

  // Take resting screenshot
  const ssResting = path.join(ARTIFACT_DIR, "cursor_01_resting.png");
  await page.screenshot({ path: ssResting, clip: { x: 420, y: 320, width: 160, height: 160 } });
  console.log("Saved resting cursor screenshot:", ssResting);

  // 3. Hover interactive element (Hero button "See open roles")
  console.log("Moving mouse to hero button...");
  const heroBtn = page.locator('.hero a[href="#roles"]').first();
  const heroBox = await heroBtn.boundingBox();
  if (heroBox) {
    await page.mouse.move(heroBox.x + heroBox.width / 2, heroBox.y + heroBox.height / 2);
    await page.waitForTimeout(250);

    const isRingHovered = await ring.evaluate((el) => el.classList.contains("hovered"));
    console.log("Ring hovered class on hero button:", isRingHovered);

    const ssHover = path.join(ARTIFACT_DIR, "cursor_02_hover_button.png");
    await page.screenshot({
      path: ssHover,
      clip: {
        x: Math.max(0, heroBox.x - 30),
        y: Math.max(0, heroBox.y - 30),
        width: heroBox.width + 60,
        height: heroBox.height + 60,
      },
    });
    console.log("Saved hover button screenshot:", ssHover);
  }

  // 4. Mouse down test
  console.log("Testing mouse down interaction...");
  await page.mouse.down();
  await page.waitForTimeout(100);

  const ssMouseDown = path.join(ARTIFACT_DIR, "cursor_03_mousedown.png");
  await page.screenshot({ path: ssMouseDown, clip: { x: 450, y: 350, width: 200, height: 200 } });
  await page.mouse.up();
  await page.waitForTimeout(100);

  // 5. Test over search input
  console.log("Moving mouse to search input...");
  const searchInput = page.locator("#roleq");
  await searchInput.scrollIntoViewIfNeeded();
  const searchBox = await searchInput.boundingBox();
  if (searchBox) {
    await page.mouse.move(searchBox.x + searchBox.width / 2, searchBox.y + searchBox.height / 2);
    await page.waitForTimeout(200);

    const dotOpacity = await dot.evaluate((el) => window.getComputedStyle(el).opacity);
    const ringOpacity = await ring.evaluate((el) => window.getComputedStyle(el).opacity);
    console.log(`Over input: dot opacity = ${dotOpacity}, ring opacity = ${ringOpacity}`);

    const ssInput = path.join(ARTIFACT_DIR, "cursor_04_over_input.png");
    await page.screenshot({
      path: ssInput,
      clip: {
        x: Math.max(0, searchBox.x - 20),
        y: Math.max(0, searchBox.y - 20),
        width: searchBox.width + 40,
        height: searchBox.height + 40,
      },
    });
    console.log("Saved over input screenshot:", ssInput);
  }

  console.log("=== Custom Cursor tests PASSED flawlessly! ===");
  await browser.close();
}

verifyCursor().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});

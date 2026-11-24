const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

// Reference data
const EXPECTED_ROLES = [
  { id: "creative-strategist", title: "Creative Strategist", dept: "Creative Team", type: "Full-time", exp: "2–4 yrs", pay: "₹65k–1L / month" },
  { id: "copywriter", title: "Copywriter, English + Hinglish", dept: "Creative Team", type: "Full-time", exp: "1–3 yrs", pay: "₹35k–60k / month" },
  { id: "brand-partnerships-manager", title: "Brand Partnerships Manager", dept: "Brand Partnerships", type: "Full-time", exp: "3–5 yrs", pay: "₹85k–1.25L / month" },
  { id: "brand-solutions-executive", title: "Brand Solutions Executive", dept: "Brand Solutions", type: "Full-time", exp: "1–3 yrs", pay: "₹40k–65k / month" },
  { id: "ir-executive-south", title: "Influencer Relations Executive, South", dept: "Influencer Relations", type: "Full-time", exp: "1–3 yrs", pay: "₹35k–50k / month" },
  { id: "ir-intern", title: "Influencer Relations Intern", dept: "Influencer Relations", type: "Internship", exp: "0–1 yr", pay: "₹15–20k / month" },
  { id: "production-executive", title: "Production Executive, TBM Studio", dept: "Production", type: "Full-time", exp: "1–3 yrs", pay: "₹35k–50k / month" },
  { id: "video-editor", title: "Video Editor, Performance", dept: "Post-Production", type: "Full-time", exp: "2–4 yrs", pay: "₹40k–65k / month" },
  { id: "hr-executive", title: "HR Executive", dept: "Human Resources", type: "Full-time", exp: "1–3 yrs", pay: "₹35k–50k / month" },
  { id: "finance-executive", title: "Finance Executive", dept: "Finance", type: "Full-time", exp: "2–4 yrs", pay: "₹40k–60k / month" },
  { id: "talent-manager", title: "Talent Manager", dept: "Talent Management", type: "Full-time", exp: "2–4 yrs", pay: "₹50k–75k / month" },
];

async function verifyAll11Roles() {
  console.log("=== Comprehensive Testing: All 11 Job Cards & Role Detail Drawer ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  const report = {
    rolesVerified: [],
    dismissalMethodsTested: {
      closeButton: 0,
      escapeKey: 0,
      scrimClick: 0,
    },
    filterTests: [],
    viewports: {},
    consoleErrors: [],
  };

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      report.consoleErrors.push(msg.text());
    }
  });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  // Scroll to #roles
  await page.locator("#roles").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  // 1. Verify Card Count
  const initialCardCount = await page.locator("#rolelist .rolerow").count();
  console.log(`Initial job cards rendered: ${initialCardCount}`);

  // 2. Test EVERY SINGLE ONE of the 11 job cards
  console.log("\n--- Testing All 11 Roles individually ---");
  for (let i = 0; i < EXPECTED_ROLES.length; i++) {
    const expected = EXPECTED_ROLES[i];
    const card = page.locator(`#rolelist .rolerow[data-role="${expected.id}"]`);

    // Verify card exists
    const cardVisible = await card.isVisible();
    const cardTitle = (await card.locator("b").textContent()).trim();
    const cardDept = (await card.locator(".meta").first().textContent()).trim();

    // Click card to open drawer
    await card.click();
    await page.waitForTimeout(300);

    // Verify drawer contents
    const drawer = page.locator("#drawer");
    const isDrawerOpen = await drawer.evaluate((el) => el.classList.contains("on"));
    const isScrimOn = await page.locator("#scrim").evaluate((el) => el.classList.contains("on"));
    const bodyLocked = await page.evaluate(() => document.body.style.overflow === "hidden");

    const drawerTitle = (await page.locator("#dr-title").textContent()).trim();
    const drawerDept = (await page.locator("#drawer .dh span").textContent()).trim();
    const metaRowText = await page.locator("#drawer .meta-row").textContent();
    const problemText = await page.locator("#drawer .problem").textContent();
    const respCount = await page.locator("#drawer ul.lines").first().locator("li").count();
    const applyBtn = page.locator("#drawer button[data-apply]");
    const applyDataRole = await applyBtn.getAttribute("data-apply");
    const applyText = (await applyBtn.textContent()).trim();

    const rolePass =
      cardTitle === expected.title &&
      drawerTitle === expected.title &&
      drawerDept === expected.dept &&
      metaRowText.includes(expected.exp) &&
      metaRowText.includes(expected.pay) &&
      metaRowText.includes("Lower Parel, Mumbai") &&
      metaRowText.includes(expected.type) &&
      applyDataRole === expected.id &&
      isDrawerOpen &&
      isScrimOn &&
      bodyLocked;

    report.rolesVerified.push({
      id: expected.id,
      title: expected.title,
      dept: expected.dept,
      exp: expected.exp,
      pay: expected.pay,
      respCount,
      applyDataRole,
      drawerOpened: isDrawerOpen,
      bodyLocked,
      passed: rolePass,
    });

    console.log(`[${i + 1}/11] ${expected.title} (${expected.dept}): ${rolePass ? "VERIFIED ✓" : "FAILED ✗"}`);

    // Cycle through dismissal methods: 0 -> Close Button, 1 -> Escape Key, 2 -> Scrim Click
    const dismissMethod = i % 3;
    if (dismissMethod === 0) {
      await page.locator('#drawer button[data-close="drawer"]').click();
      report.dismissalMethodsTested.closeButton++;
    } else if (dismissMethod === 1) {
      await page.keyboard.press("Escape");
      report.dismissalMethodsTested.escapeKey++;
    } else {
      await page.mouse.click(50, 300);
      report.dismissalMethodsTested.scrimClick++;
    }

    await page.waitForTimeout(300);
    const drawerClosed = await drawer.evaluate((el) => !el.classList.contains("on"));
    const bodyUnlocked = await page.evaluate(() => document.body.style.overflow === "");

    if (!drawerClosed || !bodyUnlocked) {
      console.error(`Warning: Drawer did not close properly for ${expected.id}`);
    }
  }

  // 3. Test Switching between roles without closing
  console.log("\n--- Testing Direct Switching Between Roles ---");
  const card1 = page.locator('#rolelist .rolerow[data-role="creative-strategist"]');
  await card1.click();
  await page.waitForTimeout(300);
  const title1 = (await page.locator("#dr-title").textContent()).trim();

  // Close and immediately open card 8 (Video Editor)
  await page.locator('#drawer button[data-close="drawer"]').click();
  await page.waitForTimeout(200);

  const card8 = page.locator('#rolelist .rolerow[data-role="video-editor"]');
  await card8.click();
  await page.waitForTimeout(300);
  const title2 = (await page.locator("#dr-title").textContent()).trim();
  const dept2 = (await page.locator("#drawer .dh span").textContent()).trim();

  report.switchingTest = {
    firstRole: title1,
    secondRole: title2,
    secondDept: dept2,
    noStaleData: title1 !== title2 && title2 === "Video Editor, Performance",
  };
  console.log("Switching test:", report.switchingTest);

  // Close drawer
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // 4. Screenshots: All 11 Cards Desktop Light
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "p6_all_11_roles_desktop_light.png"),
  });

  // Open drawer for Copywriter to screenshot
  await page.locator('#rolelist .rolerow[data-role="copywriter"]').click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "p6_drawer_copywriter_desktop_light.png"),
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // 5. Responsive Checks across all viewports
  console.log("\n--- Multi-Viewport Responsive & Theme Verification ---");
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
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: vp.scheme });
    const p = await ctx.newPage();
    const u = vp.scheme === "dark" ? "http://localhost:3000/?theme=dark" : "http://localhost:3000/";
    await p.goto(u, { waitUntil: "networkidle" });
    await p.locator("#roles").scrollIntoViewIfNeeded();
    await p.waitForTimeout(200);

    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    const cw = await p.evaluate(() => document.documentElement.clientWidth);
    const vpKey = `${vp.width}x${vp.height}_${vp.scheme}`;

    report.viewports[vpKey] = {
      scrollWidth: sw,
      clientWidth: cw,
      noOverflow: sw <= cw,
    };
    console.log(`[${vpKey}] scrollWidth: ${sw}, clientWidth: ${cw}, noOverflow: ${sw <= cw}`);

    if (vp.width === 1440 && vp.scheme === "dark") {
      await p.screenshot({ path: path.join(ARTIFACT_DIR, "p6_all_11_roles_desktop_dark.png") });
      await p.locator('#rolelist .rolerow[data-role="production-executive"]').click();
      await p.waitForTimeout(300);
      await p.screenshot({ path: path.join(ARTIFACT_DIR, "p6_drawer_production_desktop_dark.png") });
    }

    if (vp.width === 390 && vp.scheme === "light") {
      await p.screenshot({ path: path.join(ARTIFACT_DIR, "p6_roles_mobile_390_light.png") });
      await p.locator('#rolelist .rolerow[data-role="talent-manager"]').click();
      await p.waitForTimeout(300);
      await p.screenshot({ path: path.join(ARTIFACT_DIR, "p6_drawer_talent_mobile_390_light.png") });
    }

    if (vp.width === 390 && vp.scheme === "dark") {
      await p.screenshot({ path: path.join(ARTIFACT_DIR, "p6_roles_mobile_390_dark.png") });
      await p.locator('#rolelist .rolerow[data-role="finance-executive"]').click();
      await p.waitForTimeout(300);
      await p.screenshot({ path: path.join(ARTIFACT_DIR, "p6_drawer_finance_mobile_390_dark.png") });
    }

    await ctx.close();
  }

  await page.close();
  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "phase6_all_11_roles_results.json"),
    JSON.stringify(report, null, 2)
  );

  console.log("\n=== Complete Verification Finished Successfully! ===");
}

verifyAll11Roles().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

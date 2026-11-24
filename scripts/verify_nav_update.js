const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function verifyNav() {
  console.log("=== Verifying Nav Update ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const navLinks = await page.locator("header.nav nav ul li a").allTextContents();
  console.log("Current nav links:", navLinks);

  const hasOpenRolesInNav = navLinks.some((txt) => txt.toLowerCase().includes("open roles"));
  if (hasOpenRolesInNav) {
    throw new Error("Nav still contains 'Open roles'!");
  }

  const ctaText = await page.locator("header.nav .btn").textContent();
  console.log("Nav CTA button text:", ctaText);

  const navScreenshot = path.join(ARTIFACT_DIR, "nav_after_open_roles_removed.png");
  await page.locator("header.nav").screenshot({ path: navScreenshot });
  console.log("Saved nav screenshot:", navScreenshot);

  // Check Dashboard Overview KPIs
  await page.evaluate(async () => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ devEmail: "people@theboredmonkey.com" }),
    });
    const data = await res.json();
    if (data.user) {
      localStorage.setItem("tbm-dash-session", JSON.stringify(data.user));
    }
    window.location.hash = "#dashboard";
  });

  await page.goto("http://localhost:3000/#dashboard", { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".kpis .kpi");

  const kpis = await page.locator(".kpis .kpi").allTextContents();
  console.log("Dashboard Overview KPIs:", kpis);

  const overviewScreenshot = path.join(ARTIFACT_DIR, "dashboard_overview_kpis_restored.png");
  await page.locator(".kpis").screenshot({ path: overviewScreenshot });
  console.log("Saved overview KPIs screenshot:", overviewScreenshot);

  console.log("=== All Nav and Dashboard verifications PASSED! ===");
  await browser.close();
}

verifyNav().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});

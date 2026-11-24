const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function verifyMonthlyPay() {
  console.log("=== Testing Monthly Pay across Careers Platform ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Check Job Details Drawer for Monthly Pay
  console.log("1. Checking Role Detail Drawer...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  // Click Creative Strategist
  const stratBtn = page.locator('button[data-role="creative-strategist"]').first();
  await stratBtn.click();
  await page.waitForSelector(".drawer.on");
  
  const drawerMeta = await page.locator(".drawer .meta-row").textContent();
  console.log("Creative Strategist drawer meta:", drawerMeta);
  if (!drawerMeta.includes("/ month") || drawerMeta.includes("LPA")) {
    throw new Error("Drawer does not show monthly pay or still shows LPA: " + drawerMeta);
  }

  const ssDrawer = path.join(ARTIFACT_DIR, "monthly_pay_01_role_drawer.png");
  await page.screenshot({ path: ssDrawer });
  console.log("Saved role drawer screenshot to:", ssDrawer);

  // Close drawer
  await page.locator('.drawer .x[data-close="drawer"]').click();
  await page.waitForTimeout(300);

  // 2. Check Application Modal Step 3 (Pay)
  console.log("2. Checking Application Modal Step 3 (Pay)...");
  // Open application modal for Creative Strategist
  await stratBtn.click();
  await page.waitForSelector(".drawer.on");
  await page.locator('.drawer button[data-apply]').click();
  await page.waitForSelector("#modal.on");

  // Step 1: Personal
  await page.fill('#f-name', 'Rhea Sharma');
  await page.fill('#f-email', 'rhea.sharma@example.com');
  await page.fill('#f-phone', '9820098200');
  await page.fill('#f-city', 'Mumbai');
  await page.locator('button[data-seg="mumbai"][data-val="Yes"]').click();
  await page.locator('button[data-next]').click();
  await page.waitForTimeout(400);

  // Step 2: Role
  await page.fill('#f-joining', '2026-12-01');
  await page.selectOption('#f-notice', '30 days');
  await page.locator('button[data-next]').click();
  await page.waitForTimeout(400);

  // Step 3: Comp / Pay
  const ctcLabel = await page.locator('label[for="f-ctc"]').textContent();
  const ectcLabel = await page.locator('label[for="f-ectc"]').textContent();
  console.log("Step 3 CTC label:", ctcLabel);
  console.log("Step 3 ECTC label:", ectcLabel);

  if (!ctcLabel.includes("monthly") || ctcLabel.includes("LPA") || !ectcLabel.includes("monthly") || ectcLabel.includes("LPA")) {
    throw new Error("Application step 3 labels do not mention monthly pay or still mention LPA!");
  }

  await page.fill('#f-ctc', '65000');
  await page.fill('#f-ectc', '90000');
  await page.locator('button[data-seg="negotiable"][data-val="Yes"]').click();

  const ssModal = path.join(ARTIFACT_DIR, "monthly_pay_02_apply_step3.png");
  await page.screenshot({ path: ssModal });
  console.log("Saved application step 3 screenshot to:", ssModal);

  // Close modal via Escape
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // 3. Check HR Dashboard (Applicants Table and Applicant Drawer)
  console.log("3. Submitting test application and authenticating into HR Dashboard...");
  const applyRes = await page.request.post("http://localhost:3000/api/apply", {
    data: {
      id: "test-monthly-applicant",
      name: "Aanya Verma",
      email: "aanya.verma@example.com",
      phone: "9876543210",
      city: "Mumbai",
      mumbai: "Yes",
      role: "creative-strategist",
      total: 3,
      rel: 2.5,
      ctc: 65000,
      ectc: 90000,
      notice: "30 days",
      buyout: "Yes",
      negotiable: "Yes",
      why: "I build data-backed creative briefs that solve actual business problems.",
      admire: "A creator who turned high retention into direct commerce sales.",
      problem: "A fintech brand with low search volume. Brief creators on regional trust."
    }
  });
  console.log("Test candidate submission status:", applyRes.status());

  const authRes = await page.evaluate(async () => {
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
    return data;
  });
  console.log("Auth response:", authRes);

  await page.goto("http://localhost:3000/#dashboard", { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector('button[data-tab="applicants"]');

  // Click Applicants tab
  await page.locator('button[data-tab="applicants"]').click();
  await page.waitForSelector(".scroll table");

  // Check table header
  const tableHeader = await page.locator(".scroll table thead").textContent();
  console.log("Applicants table header:", tableHeader);
  if (!tableHeader.includes("Expected / mo")) {
    throw new Error("Applicants table header does not contain 'Expected / mo'!");
  }

  // Check filter placeholder
  const minPlaceholder = await page.locator("#fmin").getAttribute("placeholder");
  const maxPlaceholder = await page.locator("#fmax").getAttribute("placeholder");
  console.log("Min placeholder:", minPlaceholder, "Max placeholder:", maxPlaceholder);

  // Check table cells
  const firstRowExpected = await page.locator(".scroll table tbody tr td.num.hide-m").first().textContent();
  console.log("First row expected pay cell:", firstRowExpected);
  if (!firstRowExpected.includes("/ mo") || firstRowExpected.includes("L")) {
    throw new Error("First row pay cell does not show monthly pay: " + firstRowExpected);
  }

  const ssDashboard = path.join(ARTIFACT_DIR, "monthly_pay_03_applicants_view.png");
  await page.screenshot({ path: ssDashboard });
  console.log("Saved applicants view screenshot to:", ssDashboard);

  // Open candidate drawer
  await page.locator(".scroll table tbody tr").first().click();
  await page.waitForSelector(".drawer.on");

  const candidateDrawerText = await page.locator(".drawer.on .db").textContent();
  console.log("Candidate drawer contains pay information.");
  if (!candidateDrawerText.includes("/ mo")) {
    throw new Error("Candidate drawer does not display monthly pay format!");
  }

  const ssCandidateDrawer = path.join(ARTIFACT_DIR, "monthly_pay_04_candidate_drawer.png");
  await page.screenshot({ path: ssCandidateDrawer });
  console.log("Saved candidate drawer screenshot to:", ssCandidateDrawer);

  console.log("=== All Monthly Pay verifications PASSED flawlessly! ===");
  await browser.close();

  // Clean up test applicant from database
  const { Pool } = require("pg");
  const pool = new Pool({
    connectionString: "postgresql://postgres.xvtuwezritdychsgcsbb:Sarvesh%402004@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  await pool.query("DELETE FROM applicants WHERE id = 'test-monthly-applicant'");
  await pool.end();
  console.log("Cleaned up test applicant. Live DB remains 100% clean.");
}

verifyMonthlyPay().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});

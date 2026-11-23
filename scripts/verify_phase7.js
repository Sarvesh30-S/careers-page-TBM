const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

// Sample resume buffer for file upload test
const dummyResumePath = path.join(__dirname, "test_resume.pdf");
fs.writeFileSync(dummyResumePath, "%PDF-1.4\n%Demo PDF Content for Application Testing\n%%EOF");

async function verifyPhase7() {
  console.log("=== Phase 7: Application Modal & Multi-Step Candidate System Verification ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const results = {
    stepsCompleted: [],
    validationTested: [],
    draftTested: false,
    viewportsTested: [],
    submissionVerified: false,
    toastVerified: false,
  };

  try {
    // -------------------------------------------------------------------------
    // 1. Desktop Light (1280 x 800) - Full Multi-Step Happy Path & Validation
    // -------------------------------------------------------------------------
    console.log("--- 1. Testing Desktop Light Full Flow ---");
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      colorScheme: "light",
    });
    const page = await context.newPage();
    await page.goto("http://localhost:3000/#roles", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Open first role: Creative Strategist
    const firstRole = page.locator('.rolerow').first();
    await firstRole.scrollIntoViewIfNeeded();
    await firstRole.click();
    await page.waitForTimeout(350);

    // Click "Apply for this role" in drawer
    const applyBtn = page.locator('button[data-apply="creative-strategist"]');
    await applyBtn.click();
    await page.waitForTimeout(400);

    // Verify modal is open and drawer is closed
    const modalVisible = await page.locator('#modal.on').isVisible();
    const sheetVisible = await page.locator('#sheet').isVisible();
    const headerTitle = await page.locator('#ap-title').textContent();
    console.log(`Modal open: ${modalVisible}, Sheet visible: ${sheetVisible}, Title: "${headerTitle}"`);

    // Screenshot Step 1 initial
    const shotStep1 = path.join(ARTIFACT_DIR, "p7_step1_desktop_light.png");
    await page.screenshot({ path: shotStep1 });

    // Test Step 1 Validation (empty required fields)
    console.log("Testing Step 1 validation...");
    const continueBtn = page.locator('#sheet button[data-next]');
    await continueBtn.click();
    await page.waitForTimeout(250);

    const nameErr = await page.locator('#e-name').textContent();
    const emailErr = await page.locator('#e-email').textContent();
    const phoneErr = await page.locator('#e-phone').textContent();
    const cityErr = await page.locator('#e-city').textContent();
    const mumbaiErr = await page.locator('#e-mumbai').textContent();

    console.log(`Step 1 validation errors: name="${nameErr}", email="${emailErr}", phone="${phoneErr}", city="${cityErr}", mumbai="${mumbaiErr}"`);
    results.validationTested.push({
      step: 1,
      errors: { nameErr, emailErr, phoneErr, cityErr, mumbaiErr },
      pass: !!nameErr && !!emailErr && !!phoneErr && !!cityErr && !!mumbaiErr,
    });

    const shotStep1Err = path.join(ARTIFACT_DIR, "p7_step1_validation_error.png");
    await page.screenshot({ path: shotStep1Err });

    // Test invalid email
    await page.fill('#f-name', 'Aarav Sharma');
    await page.fill('#f-email', 'invalid-email');
    await continueBtn.click();
    await page.waitForTimeout(200);
    const typoEmailErr = await page.locator('#e-email').textContent();
    console.log(`Typo email error: "${typoEmailErr}"`);

    // Fill valid Step 1
    await page.fill('#f-email', 'aarav.sharma@example.com');
    await page.fill('#f-phone', '9876543210');
    await page.fill('#f-age', '26');
    await page.selectOption('#f-gender', 'Man');
    await page.fill('#f-city', 'Mumbai');
    await page.click('button[data-seg="mumbai"][data-val="Yes"]');
    await page.waitForTimeout(200);

    // Advance to Step 2
    await continueBtn.click();
    await page.waitForTimeout(400);

    // Step 2: Role
    console.log("Step 2 (Role)...");
    const step2Title = await page.locator('#sheet .steplabel').textContent();
    console.log(`Step 2 Label: "${step2Title}"`);
    const shotStep2 = path.join(ARTIFACT_DIR, "p7_step2_desktop_light.png");
    await page.screenshot({ path: shotStep2 });
    results.stepsCompleted.push("Step 1: You -> Step 2: Role");

    // Fill Step 2
    const todayStr = new Date().toISOString().slice(0, 10);
    await page.fill('#f-joining', todayStr);
    await page.selectOption('#f-notice', 'Immediate');
    await page.click('button[data-seg="buyout"][data-val="No"]');
    await page.waitForTimeout(200);

    // Advance to Step 3
    await continueBtn.click();
    await page.waitForTimeout(400);

    // Step 3: Pay
    console.log("Step 3 (Pay)...");
    const shotStep3 = path.join(ARTIFACT_DIR, "p7_step3_desktop_light.png");
    await page.screenshot({ path: shotStep3 });
    results.stepsCompleted.push("Step 2: Role -> Step 3: Pay");

    // Fill Step 3
    await page.fill('#f-ctc', '8');
    await page.fill('#f-ectc', '11');
    await page.click('button[data-seg="negotiable"][data-val="Yes"]');
    await page.waitForTimeout(200);

    // Advance to Step 4
    await continueBtn.click();
    await page.waitForTimeout(400);

    // Step 4: Experience
    console.log("Step 4 (Experience)...");
    const shotStep4 = path.join(ARTIFACT_DIR, "p7_step4_desktop_light.png");
    await page.screenshot({ path: shotStep4 });
    results.stepsCompleted.push("Step 3: Pay -> Step 4: Experience");

    // Test relevant exp > total exp validation
    await page.fill('#f-total', '3');
    await page.fill('#f-rel', '5');
    await page.click('button[data-multi="langs"][data-val="English"]');
    await continueBtn.click();
    await page.waitForTimeout(200);
    const relExpErr = await page.locator('#e-rel').textContent();
    console.log(`Rel exp error: "${relExpErr}"`);
    results.validationTested.push({
      field: "rel > total",
      error: relExpErr,
      pass: relExpErr.includes("Relevant can't be more than total experience"),
    });

    // Fix Step 4
    await page.fill('#f-rel', '3');
    await page.fill('#f-lastco', 'FCB Ulka');
    await page.fill('#f-lastdes', 'Senior Brand Strategist');
    await page.click('button[data-multi="langs"][data-val="Hindi"]');
    await page.waitForTimeout(200);

    // Advance to Step 5
    await continueBtn.click();
    await page.waitForTimeout(400);

    // Step 5: Links & Resume
    console.log("Step 5 (Links & Resume)...");
    const shotStep5 = path.join(ARTIFACT_DIR, "p7_step5_desktop_light.png");
    await page.screenshot({ path: shotStep5 });
    results.stepsCompleted.push("Step 4: Experience -> Step 5: Links");

    // File upload
    const fileInput = page.locator('#f-resume input[type="file"]');
    await fileInput.setInputFiles(dummyResumePath);
    await page.waitForTimeout(300);

    await page.fill('#f-portfolio', 'https://aaravportfolio.com');
    await page.fill('#f-linkedin', 'https://linkedin.com/in/aaravsharma');
    await page.fill('#f-instagram', '@aaravcreates');
    await page.waitForTimeout(200);

    // Advance to Step 6
    await continueBtn.click();
    await page.waitForTimeout(400);

    // Step 6: Thinking
    console.log("Step 6 (Thinking)...");
    const shotStep6 = path.join(ARTIFACT_DIR, "p7_step6_desktop_light.png");
    await page.screenshot({ path: shotStep6 });
    results.stepsCompleted.push("Step 5: Links -> Step 6: Thinking");

    // Test short answer validation
    await page.fill('#f-why', 'Too short');
    await continueBtn.click();
    await page.waitForTimeout(200);
    const whyErr = await page.locator('#e-why').textContent();
    console.log(`Why min length error: "${whyErr}"`);
    results.validationTested.push({
      field: "why min length",
      error: whyErr,
      pass: whyErr.includes("A line or two, please"),
    });

    // Fill Step 6
    await page.fill(
      '#f-why',
      'I track why some creator campaigns blow up and others flop. I want to build systems that scale culture-defining creator partnerships.'
    );
    await page.fill(
      '#f-admire',
      'The Swiggy Instamart regional campaigns that used hyperlocal creators with unscripted comedy.'
    );
    await page.fill(
      '#f-problem',
      'A direct-to-consumer health brand struggling with repeat orders. Creator 14-day trials measuring cohort retention.'
    );
    await page.waitForTimeout(200);

    // Advance to Step 7
    await continueBtn.click();
    await page.waitForTimeout(400);

    // Step 7: Final
    console.log("Step 7 (Final & Consent)...");
    const shotStep7 = path.join(ARTIFACT_DIR, "p7_step7_desktop_light.png");
    await page.screenshot({ path: shotStep7 });
    results.stepsCompleted.push("Step 6: Thinking -> Step 7: Final");

    await page.selectOption('#f-source', 'LinkedIn');
    await page.fill('#f-referral', 'Rahul Verma');

    // Test consent required
    const submitBtn = page.locator('#sheet button[data-next]');
    await submitBtn.click();
    await page.waitForTimeout(200);
    const consentErr = await page.locator('#e-consent').textContent();
    console.log(`Consent error: "${consentErr}"`);
    results.validationTested.push({
      field: "consent",
      error: consentErr,
      pass: consentErr.includes("We need your consent"),
    });

    // Check consent and submit
    await page.check('#f-consent');
    await page.waitForTimeout(200);
    await submitBtn.click();
    await page.waitForTimeout(600);

    // Confirmation screen verification
    const doneScreen = page.locator('#sheet .done-screen');
    const isDoneVisible = await doneScreen.isVisible();
    const doneHeading = await page.locator('#ap-title').textContent();
    const refText = await page.locator('.done-screen p.small').textContent();
    console.log(`Confirmation screen: visible=${isDoneVisible}, heading="${doneHeading}", ref="${refText}"`);

    const shotDone = path.join(ARTIFACT_DIR, "p7_done_screen_desktop_light.png");
    await page.screenshot({ path: shotDone });

    results.submissionVerified =
      isDoneVisible && doneHeading.includes("Application in. Thank you, Aarav.") && refText.includes("Reference TBM-");

    // Close confirmation screen
    const backToRolesBtn = page.locator('button[data-close="modal"]');
    await backToRolesBtn.click();
    await page.waitForTimeout(400);

    const modalClosedAfterDone = !(await page.locator('#modal.on').isVisible());
    console.log(`Modal closed after done: ${modalClosedAfterDone}`);

    await context.close();

    // -------------------------------------------------------------------------
    // 2. Draft Autosave, Toast & Pick Up Test
    // -------------------------------------------------------------------------
    console.log("--- 2. Testing Draft Autosave & Restoration ---");
    const draftContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const draftPage = await draftContext.newPage();
    await draftPage.goto("http://localhost:3000/#roles", { waitUntil: "networkidle" });
    await draftPage.waitForTimeout(500);

    // Open second role: Copywriter
    const secondRole = draftPage.locator('.rolerow').nth(1);
    await secondRole.scrollIntoViewIfNeeded();
    await secondRole.click();
    await draftPage.waitForTimeout(300);

    await draftPage.locator('button[data-apply="copywriter"]').click();
    await draftPage.waitForTimeout(400);

    // Fill partial data
    await draftPage.fill('#f-name', 'Rohan Mehra');
    await draftPage.fill('#f-email', 'rohan.mehra@example.com');
    await draftPage.waitForTimeout(300);

    // Close modal via close button
    await draftPage.locator('#sheet button[data-close="modal"]').click();
    await draftPage.waitForTimeout(300);

    // Check toast: "Draft saved. Come back any time."
    const toastSaved = await draftPage.locator('#toast.on').textContent();
    console.log(`Toast on close: "${toastSaved}"`);

    // Reopen Copywriter
    await secondRole.scrollIntoViewIfNeeded();
    await secondRole.click();
    await draftPage.waitForTimeout(300);
    await draftPage.locator('button[data-apply="copywriter"]').click();
    await draftPage.waitForTimeout(500);

    // Check toast: "Picked up where you left off."
    const toastPickedUp = await draftPage.locator('#toast.on').textContent();
    const restoredName = await draftPage.inputValue('#f-name');
    const restoredEmail = await draftPage.inputValue('#f-email');
    console.log(`Draft Restored: toast="${toastPickedUp}", name="${restoredName}", email="${restoredEmail}"`);

    const shotDraftRestored = path.join(ARTIFACT_DIR, "p7_draft_restored.png");
    await draftPage.screenshot({ path: shotDraftRestored });

    results.draftTested =
      toastSaved.includes("Draft saved") &&
      toastPickedUp.includes("Picked up where you left off") &&
      restoredName === "Rohan Mehra" &&
      restoredEmail === "rohan.mehra@example.com";

    await draftContext.close();

    // -------------------------------------------------------------------------
    // 3. Responsive & Dark Mode Telemetry Testing
    // -------------------------------------------------------------------------
    console.log("--- 3. Testing Responsive Viewports & Themes ---");
    const testConfigs = [
      { name: "Desktop 1440 Light", width: 1440, height: 900, theme: "light" },
      { name: "Desktop 1280 Dark", width: 1280, height: 800, theme: "dark" },
      { name: "Tablet 768 Light", width: 768, height: 1024, theme: "light" },
      { name: "Tablet 768 Dark", width: 768, height: 1024, theme: "dark" },
      { name: "Mobile 390 Light", width: 390, height: 844, theme: "light" },
      { name: "Mobile 390 Dark", width: 390, height: 844, theme: "dark" },
      { name: "Mobile 375 Light", width: 375, height: 812, theme: "light" },
      { name: "Mobile 375 Dark", width: 375, height: 812, theme: "dark" },
      { name: "Mobile 360 Light", width: 360, height: 800, theme: "light" },
    ];

    for (const conf of testConfigs) {
      const respCtx = await browser.newContext({
        viewport: { width: conf.width, height: conf.height },
        colorScheme: conf.theme,
      });
      const p = await respCtx.newPage();
      await p.goto("http://localhost:3000/#roles", { waitUntil: "networkidle" });
      if (conf.theme === "dark") {
        await p.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
      }
      await p.waitForTimeout(400);

      // Open drawer and click apply
      const card = p.locator('.rolerow').first();
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await p.waitForTimeout(350);

      const apply = p.locator('button[data-apply="creative-strategist"]');
      await apply.waitFor({ state: "visible", timeout: 5000 });
      await apply.click();
      await p.waitForTimeout(400);

      // DOM overflow check
      const overflowInfo = await p.evaluate(() => {
        const doc = document.documentElement;
        const sheet = document.getElementById("sheet");
        return {
          docScroll: doc.scrollWidth,
          docClient: doc.clientWidth,
          sheetWidth: sheet ? sheet.offsetWidth : 0,
          noOverflow: doc.scrollWidth <= doc.clientWidth + 1,
        };
      });

      console.log(`Viewport ${conf.name}: docScroll=${overflowInfo.docScroll}, docClient=${overflowInfo.docClient}, sheetWidth=${overflowInfo.sheetWidth}, noOverflow=${overflowInfo.noOverflow}`);

      const filename = `p7_${conf.width}_${conf.theme}_modal.png`;
      const shotPath = path.join(ARTIFACT_DIR, filename);
      await p.screenshot({ path: shotPath });

      results.viewportsTested.push({
        ...conf,
        ...overflowInfo,
        screenshot: filename,
        pass: overflowInfo.noOverflow && overflowInfo.sheetWidth > 0,
      });

      await respCtx.close();
    }

    // Save final report JSON
    const reportPath = path.join(ARTIFACT_DIR, "phase7_verification_results.json");
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`Verification completed successfully. Results saved to: ${reportPath}`);
  } catch (err) {
    console.error("Test failure:", err);
  } finally {
    try {
      fs.unlinkSync(dummyResumePath);
    } catch {}
    await browser.close();
  }
}

verifyPhase7();

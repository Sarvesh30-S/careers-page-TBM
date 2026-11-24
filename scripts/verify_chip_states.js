const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function verifyChip() {
  console.log("=== Testing 'All 11' Chip White Initially -> Black When Clicked ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const allChip = page.locator('#deptchips button[data-dept="All"]');
  await allChip.scrollIntoViewIfNeeded();

  // 1. Initial State Check
  const initialAriaPressed = await allChip.getAttribute("aria-pressed");
  const initialStyles = await allChip.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      color: cs.color,
      border: cs.borderColor,
    };
  });

  console.log("Initial state:", {
    ariaPressed: initialAriaPressed,
    ...initialStyles,
  });

  const ssInitial = path.join(ARTIFACT_DIR, "all_chip_01_white_initial.png");
  await allChip.screenshot({ path: ssInitial });
  console.log("Saved initial screenshot:", ssInitial);

  if (initialAriaPressed !== "false") {
    throw new Error(`Expected initial aria-pressed to be 'false', but got '${initialAriaPressed}'`);
  }
  // Check that initial background is light/white (not black)
  if (initialStyles.bg === "rgb(5, 6, 8)" || initialStyles.bg === "rgb(0, 0, 0)") {
    throw new Error(`Expected initial background to be white, but got black: ${initialStyles.bg}`);
  }

  // 2. Click to Expand
  console.log("Clicking 'All 11' chip...");
  await allChip.click();
  await page.waitForTimeout(300);

  const clickedAriaPressed = await allChip.getAttribute("aria-pressed");
  const clickedStyles = await allChip.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      color: cs.color,
      border: cs.borderColor,
    };
  });

  console.log("Clicked state:", {
    ariaPressed: clickedAriaPressed,
    ...clickedStyles,
  });

  const ssClicked = path.join(ARTIFACT_DIR, "all_chip_02_black_clicked.png");
  await allChip.screenshot({ path: ssClicked });
  console.log("Saved clicked screenshot:", ssClicked);

  if (clickedAriaPressed !== "true") {
    throw new Error(`Expected clicked aria-pressed to be 'true', but got '${clickedAriaPressed}'`);
  }
  // Check that clicked background is black
  if (clickedStyles.bg !== "rgb(5, 6, 8)" && clickedStyles.bg !== "rgb(0, 0, 0)") {
    throw new Error(`Expected clicked background to be black, but got: ${clickedStyles.bg}`);
  }

  // Also take full section screenshot showing revealed chips
  const ssSection = path.join(ARTIFACT_DIR, "all_chip_03_expanded_section.png");
  const rolesHead = page.locator("#roles");
  await rolesHead.screenshot({ path: ssSection });
  console.log("Saved section screenshot:", ssSection);

  // 3. Click again to Collapse
  console.log("Clicking 'All 11' chip again to collapse...");
  await allChip.click();
  await page.waitForTimeout(300);

  const collapsedAriaPressed = await allChip.getAttribute("aria-pressed");
  const collapsedStyles = await allChip.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      color: cs.color,
      border: cs.borderColor,
    };
  });

  console.log("Collapsed state:", {
    ariaPressed: collapsedAriaPressed,
    ...collapsedStyles,
  });

  if (collapsedAriaPressed !== "false") {
    throw new Error(`Expected collapsed aria-pressed to be 'false', but got '${collapsedAriaPressed}'`);
  }

  console.log("=== All Chip White -> Black tests PASSED successfully! ===");
  await browser.close();
}

verifyChip().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});

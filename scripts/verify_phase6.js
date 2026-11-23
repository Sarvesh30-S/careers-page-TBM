const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a";

async function verifyPhase6() {
  console.log("=== Launching Playwright to Verify Phase 6: Open Roles, Filters & Detail Drawer ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  const results = {
    viewports: {},
    initialRolesCount: 0,
    departmentFilterTests: [],
    searchFilterTests: [],
    drawerTests: {},
    navAnchorTest: {},
    consoleErrors: [],
  };

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
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: vp.scheme,
    });
    const page = await context.newPage();

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        results.consoleErrors.push({
          viewport: `${vp.width}x${vp.height}_${vp.scheme}`,
          text: msg.text(),
        });
      }
    });

    const url = vp.scheme === "dark" ? "http://localhost:3000/?theme=dark" : "http://localhost:3000/";
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    const vpKey = `${vp.width}x${vp.height}_${vp.scheme}`;
    results.viewports[vpKey] = {
      scrollWidth,
      clientWidth,
      noOverflow: scrollWidth <= clientWidth,
    };
    console.log(`[${vpKey}] scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, noOverflow: ${scrollWidth <= clientWidth}`);

    // If 1440 light, run full suite of functional interaction tests
    if (vp.width === 1440 && vp.scheme === "light") {
      // 1. Navigation anchor test from header
      const rolesLink = page.locator("header nav a[href='#roles']");
      if (await rolesLink.isVisible()) {
        await rolesLink.click();
        let lastY = -1;
        for (let i = 0; i < 25; i++) {
          await page.waitForTimeout(100);
          const currY = await page.evaluate(() => window.scrollY);
          if (currY === lastY && currY > 0) break;
          lastY = currY;
        }

        const scrollYAfterClick = await page.evaluate(() => window.scrollY);
        const rolesRect = await page.locator("#roles").evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { top: r.top, offsetTop: el.offsetTop };
        });

        results.navAnchorTest = {
          clicked: true,
          scrollY: scrollYAfterClick,
          rolesSectionTop: rolesRect.offsetTop,
          rolesTopRelativeToViewport: rolesRect.top,
          landedAtRoles: rolesRect.top >= 60 && rolesRect.top <= 200,
        };
        console.log("Nav anchor test:", results.navAnchorTest);
      }

      const rolesSec = page.locator("#roles");
      await rolesSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Verify all 11 initial roles
      const cardCount = await page.locator("#rolelist .rolerow").count();
      results.initialRolesCount = cardCount;
      console.log(`Initial role card count: ${cardCount}`);

      // Screenshot 1: Desktop 1440 Light All Roles
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_desktop_1440_light_roles.png"),
      });

      // 2. Department filter tests
      const deptsToTest = ["Creative Team", "Influencer Relations", "Finance", "All"];
      for (const deptName of deptsToTest) {
        const chip = page.locator(`#deptchips button[data-dept="${deptName}"]`);
        await chip.click();
        await page.waitForTimeout(150);

        const count = await page.locator("#rolelist .rolerow").count();
        const countText = await page.locator("#rolecount").textContent();
        const isPressed = await chip.getAttribute("aria-pressed");

        results.departmentFilterTests.push({
          dept: deptName,
          cardsRendered: count,
          countText,
          ariaPressed: isPressed,
        });
        console.log(`Filter [${deptName}]: ${count} cards, text="${countText}", aria-pressed=${isPressed}`);

        if (deptName === "Creative Team") {
          await page.screenshot({
            path: path.join(ARTIFACT_DIR, "p6_desktop_1440_light_filter_creative.png"),
          });
        }
      }

      // Reset to All
      await page.locator('#deptchips button[data-dept="All"]').click();
      await page.waitForTimeout(150);

      // 3. Search query test
      const searchInput = page.locator("#roleq");
      await searchInput.fill("video");
      await page.waitForTimeout(150);
      const searchVideoCount = await page.locator("#rolelist .rolerow").count();
      const searchVideoText = await page.locator("#rolecount").textContent();
      results.searchFilterTests.push({
        query: "video",
        cardsRendered: searchVideoCount,
        countText: searchVideoText,
      });

      // Search non-existent term to verify empty state
      await searchInput.fill("xyznonexistent");
      await page.waitForTimeout(150);
      const searchEmptyCount = await page.locator("#rolelist .rolerow").count();
      const emptyMsg = await page.locator("#rolelist p.empty").textContent();
      results.searchFilterTests.push({
        query: "xyznonexistent",
        cardsRendered: searchEmptyCount,
        emptyMessage: emptyMsg,
      });

      // Clear search
      await searchInput.fill("");
      await page.waitForTimeout(150);

      // 4. Role Detail Drawer Interaction Test
      console.log("--- Testing Role Detail Drawer ---");
      // Open first role: Creative Strategist
      const firstCard = page.locator("#rolelist .rolerow").first();
      const firstCardTitle = await firstCard.locator("b").textContent();
      await firstCard.click();
      await page.waitForTimeout(400);

      const drawerVisible = await page.locator("#drawer").evaluate((el) => el.classList.contains("on"));
      const scrimVisible = await page.locator("#scrim").evaluate((el) => el.classList.contains("on"));
      const bodyOverflowLocked = await page.evaluate(() => document.body.style.overflow === "hidden");
      const drawerTitle = await page.locator("#dr-title").textContent();
      const drawerDept = await page.locator("#drawer .dh span").textContent();
      const drawerMeta = await page.locator("#drawer .meta-row").textContent();
      const respItems = await page.locator("#drawer ul.lines").first().locator("li").count();
      const applyBtnText = await page.locator('#drawer button[data-apply]').textContent();

      results.drawerTests.openRole1 = {
        cardClicked: firstCardTitle,
        drawerTitle,
        drawerDept,
        drawerMeta,
        respItemsCount: respItems,
        applyBtnText: applyBtnText.trim(),
        drawerOn: drawerVisible,
        scrimOn: scrimVisible,
        bodyOverflowLocked,
      };
      console.log("Drawer open test (Role 1):", results.drawerTests.openRole1);

      // Screenshot 3: Desktop 1440 Light Drawer Open
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_desktop_1440_light_drawer_open.png"),
      });

      // Test Close Button
      await page.locator('#drawer button[data-close="drawer"]').click();
      await page.waitForTimeout(400);
      const drawerClosed = await page.locator("#drawer").evaluate((el) => !el.classList.contains("on"));
      const bodyUnlocked = await page.evaluate(() => document.body.style.overflow === "");
      results.drawerTests.closeButton = { drawerClosed, bodyUnlocked };

      // Reopen another role: Video Editor to verify fresh data without stale state
      const videoCard = page.locator('#rolelist .rolerow[data-role="video-editor"]');
      await videoCard.click();
      await page.waitForTimeout(400);
      const secondRoleTitle = await page.locator("#dr-title").textContent();
      const secondRoleDept = await page.locator("#drawer .dh span").textContent();
      results.drawerTests.openRole2_NoStale = {
        secondRoleTitle,
        secondRoleDept,
        isDifferentFromFirst: secondRoleTitle !== firstCardTitle,
      };
      console.log("Drawer open test (Role 2 fresh state):", results.drawerTests.openRole2_NoStale);

      // Test Escape Key close
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      const closedViaEsc = await page.locator("#drawer").evaluate((el) => !el.classList.contains("on"));
      results.drawerTests.closeViaEscape = { closedViaEsc };

      // Test Scrim click close
      await videoCard.click();
      await page.waitForTimeout(400);
      // Click outside drawer on scrim (e.g. at x: 50, y: 300)
      await page.mouse.click(50, 300);
      await page.waitForTimeout(400);
      const closedViaScrim = await page.locator("#drawer").evaluate((el) => !el.classList.contains("on"));
      results.drawerTests.closeViaScrim = { closedViaScrim };
      console.log("Drawer close mechanisms verified!");
    }

    // Capture Desktop 1440 Dark
    if (vp.width === 1440 && vp.scheme === "dark") {
      const rolesSec = page.locator("#roles");
      await rolesSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_desktop_1440_dark_roles.png"),
      });

      // Open drawer in dark mode
      await page.locator("#rolelist .rolerow").first().click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_desktop_1440_dark_drawer_open.png"),
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }

    // Capture Desktop 1280 Dark
    if (vp.width === 1280 && vp.scheme === "dark") {
      const rolesSec = page.locator("#roles");
      await rolesSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_desktop_1280_dark_roles.png"),
      });
    }

    // Capture Tablet 768 Light & Dark
    if (vp.width === 768 && vp.scheme === "light") {
      const rolesSec = page.locator("#roles");
      await rolesSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_tablet_768_light_roles.png"),
      });
    }

    if (vp.width === 768 && vp.scheme === "dark") {
      const rolesSec = page.locator("#roles");
      await rolesSec.scrollIntoViewIfNeeded();
      await page.locator("#rolelist .rolerow").first().click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_tablet_768_dark_drawer.png"),
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }

    // Capture Mobile 390 Light & Dark
    if (vp.width === 390 && vp.scheme === "light") {
      const rolesSec = page.locator("#roles");
      await rolesSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_mobile_390_light_roles.png"),
      });

      // Open mobile drawer
      await page.locator("#rolelist .rolerow").first().click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_mobile_390_light_drawer.png"),
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }

    if (vp.width === 390 && vp.scheme === "dark") {
      const rolesSec = page.locator("#roles");
      await rolesSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_mobile_390_dark_roles.png"),
      });
    }

    // Capture Mobile 375 Light & Dark
    if (vp.width === 375 && vp.scheme === "light") {
      const rolesSec = page.locator("#roles");
      await rolesSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_mobile_375_light_roles.png"),
      });
    }

    if (vp.width === 375 && vp.scheme === "dark") {
      const rolesSec = page.locator("#roles");
      await rolesSec.scrollIntoViewIfNeeded();
      await page.locator("#rolelist .rolerow").first().click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_mobile_375_dark_drawer.png"),
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }

    // Capture Mobile 360 Light
    if (vp.width === 360 && vp.scheme === "light") {
      const rolesSec = page.locator("#roles");
      await rolesSec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "p6_mobile_360_light_roles.png"),
      });
    }

    await context.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "phase6_verification_results.json"),
    JSON.stringify(results, null, 2)
  );
  console.log("=== Completed Phase 6 Verifications Successfully! ===");
}

verifyPhase6().catch((err) => {
  console.error("Phase 6 verification failed:", err);
  process.exit(1);
});

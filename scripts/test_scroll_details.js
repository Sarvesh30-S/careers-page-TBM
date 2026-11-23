const { chromium } = require("playwright");

async function check() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const res = await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "1200px";
    document.body.appendChild(spacer);

    const steps = document.getElementById("steps");
    const lastLi = steps.querySelector("li:last-child");

    // Scroll window
    const targetY = lastLi.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4;
    window.scrollTo({ top: targetY, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));

    return {
      scrollY: window.scrollY,
      targetY,
      srTop: steps.getBoundingClientRect().top,
      srHeight: steps.getBoundingClientRect().height,
      vh: window.innerHeight,
      lastLiTop: lastLi.getBoundingClientRect().top
    };
  });

  console.log("Scroll target:", res);
  await page.waitForTimeout(300);

  const after = await page.evaluate(() => {
    const steps = document.getElementById("steps");
    const lastLi = steps.querySelector("li:last-child");
    return {
      fill: steps.style.getPropertyValue("--fill"),
      activeCount: steps.querySelectorAll("li.on").length,
      lastLiClasses: lastLi.className,
      dotBg: window.getComputedStyle(lastLi, "::before").backgroundColor
    };
  });
  console.log("After scroll:", after);

  await browser.close();
}

check().catch(console.error);

const { chromium } = require("playwright");

(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const p = await b.newPage();
  p.on("requestfailed", (r) => {
    console.log("REQUEST FAILED:", r.url(), r.failure()?.errorText);
  });
  p.on("response", (r) => {
    if (r.status() >= 400) {
      console.log("RESPONSE 400+:", r.url(), r.status());
    }
  });
  p.on("console", (msg) => {
    console.log("PAGE CONSOLE:", msg.type(), msg.text(), msg.location());
  });
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await b.close();
})();

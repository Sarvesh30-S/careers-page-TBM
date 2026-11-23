const fs = require("fs");
const indexHtml = fs.readFileSync("reference/index.html", "utf8");

const classNames = [
  "roles-head",
  "search",
  "rolelist",
  "rolerow",
  "empty",
  "scrim",
  "drawer",
  "dh",
  "db",
  "df",
  "meta-row",
  "problem",
  "lines",
  "x"
];

const cssRegex = /<style>([\s\S]*?)<\/style>/;
const cssMatch = indexHtml.match(cssRegex);
if (cssMatch) {
  const css = cssMatch[1];
  console.log("Found CSS length:", css.length);

  // Search each class rule
  classNames.forEach((cls) => {
    const r = new RegExp(`(\\.[\\w-]*${cls}[\\w-]*[^{]*\\{[^}]*\\})`, "g");
    const matches = css.match(r);
    console.log(`\n--- Rules for .${cls} ---`);
    if (matches) {
      matches.slice(0, 10).forEach((m) => console.log(m));
    } else {
      console.log("No direct class rule found");
    }
  });

  // Also check media queries containing drawer, rolerow, roles
  console.log("\n--- Media queries mentioning roles, rolerow, drawer ---");
  const mqRegex = /@media[^{]*\{[\s\S]*?\}(?=\s*@media|\s*$)/g;
  const mqs = css.match(mqRegex) || [];
  mqs.forEach((mq) => {
    if (mq.includes("roles") || mq.includes("rolerow") || mq.includes("drawer") || mq.includes("scrim")) {
      console.log(mq);
    }
  });
}

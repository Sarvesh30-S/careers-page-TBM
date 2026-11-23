const fs = require("fs");

const indexHtml = fs.readFileSync("reference/index.html", "utf8");
const appJs = fs.readFileSync("reference/app.js", "utf8");
const dataJs = fs.readFileSync("reference/data.js", "utf8");

console.log("=== 1. HTML around #roles and #drawer ===");
const rolesMatch = indexHtml.match(/<section[^>]*id=["']roles["'][\s\S]*?<\/section>/);
console.log(rolesMatch ? rolesMatch[0] : "No #roles section in index.html");

const drawerMatch = indexHtml.match(/<div[^>]*id=["']drawer["'][\s\S]*?<\/div>/);
console.log("\n=== Drawer HTML ===");
// find any drawer in indexHtml
const dIdx = indexHtml.indexOf("drawer");
if (dIdx !== -1) {
  console.log(indexHtml.slice(Math.max(0, dIdx - 100), dIdx + 400));
}

console.log("\n=== 2. Check app.js for roles, deptchips, drawer ===");
const lines = appJs.split("\n");
lines.forEach((line, idx) => {
  if (
    line.includes("deptchips") ||
    line.includes("roles") ||
    line.includes("drawer") ||
    line.includes("rolecard") ||
    line.includes("openRoles") ||
    line.includes("renderRoles")
  ) {
    console.log(`${idx + 1}: ${line}`);
  }
});

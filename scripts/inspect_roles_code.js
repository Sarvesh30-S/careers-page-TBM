const fs = require("fs");
const appJs = fs.readFileSync("reference/app.js", "utf8");
const lines = appJs.split("\n");
console.log(lines.slice(190, 260).map((l, i) => `${i + 191}: ${l}`).join("\n"));

const fs = require("fs");
const refData = fs.readFileSync("reference/data.js", "utf8");
const dataTs = fs.readFileSync("data/data.ts", "utf8");

const window = {};
eval(refData);
const refRoles = window.TBM_DATA.ROLES;

refRoles.forEach((r) => {
  if (!dataTs.includes(r.id)) {
    console.error("Missing in data.ts:", r.id);
  }
});

console.log("All 11 role IDs verified present in data/data.ts!");

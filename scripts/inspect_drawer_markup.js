const fs = require("fs");
const indexHtml = fs.readFileSync("reference/index.html", "utf8");
const m = indexHtml.match(/<aside[\s\S]*?<\/aside>|<div[^>]*id=["']drawer["'][\s\S]*?<\/div>|<div[^>]*id=["']scrim["'][\s\S]*?<\/div>/g);
console.log(m);

const scrimIdx = indexHtml.indexOf('id="scrim"');
if (scrimIdx !== -1) {
  console.log("Around scrim:");
  console.log(indexHtml.slice(scrimIdx - 50, scrimIdx + 500));
}

const fs = require('fs');
const css = fs.readFileSync('app/globals.css', 'utf8');

const regex = /(\.filters|\.chip)[^{]*\{[^}]*\}/g;
let m;
while ((m = regex.exec(css)) !== null) {
  console.log(m[0]);
}

const fs = require('fs');

const oldHtml = fs.readFileSync('reference/index.html', 'utf8');
const newHtml = fs.readFileSync('reference_updated/index.html', 'utf8');

// Extract CSS from both
const oldCssMatch = oldHtml.match(/<style>([\s\S]*?)<\/style>/);
const newCssMatch = newHtml.match(/<style>([\s\S]*?)<\/style>/);

const oldCss = oldCssMatch ? oldCssMatch[1] : '';
const newCss = newCssMatch ? newCssMatch[1] : '';

console.log('Old CSS length:', oldCss.length, 'New CSS length:', newCss.length);

fs.writeFileSync('scripts/old_styles.css', oldCss);
fs.writeFileSync('scripts/new_styles.css', newCss);

// Let's find CSS classes in newCss that are not in oldCss
const newSelectors = new Set();
const reg = /([.#][a-zA-Z0-9_-]+)/g;
let m;
while ((m = reg.exec(newCss)) !== null) {
  if (!oldCss.includes(m[1])) {
    newSelectors.add(m[1]);
  }
}
console.log('New CSS selectors in updated design:', Array.from(newSelectors));

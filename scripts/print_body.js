const fs = require('fs');

const oldHtml = fs.readFileSync('reference/index.html', 'utf8');
const newHtml = fs.readFileSync('reference_updated/index.html', 'utf8');

// print lines 450 to 585 of reference_updated/index.html
console.log('--- UPDATED INDEX.HTML BODY ---');
const newLines = newHtml.split('\n');
for (let i = 455; i < 585; i++) {
  if (newLines[i] !== undefined) {
    console.log(`${i+1}: ${newLines[i]}`);
  }
}

const fs = require('fs');

const newCss = fs.readFileSync('scripts/new_styles.css', 'utf8');

// lines 295 to 365
const lines = newCss.split('\n');
console.log('--- CSS lines 295 to 365 ---');
for (let i = 295; i <= 365; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}

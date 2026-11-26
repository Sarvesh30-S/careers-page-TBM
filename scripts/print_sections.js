const fs = require('fs');
const html = fs.readFileSync('reference_updated/index.html', 'utf8');
const lines = html.split('\n');
console.log('Total lines:', lines.length);
lines.forEach((l, i) => {
  if (l.includes('<section') || l.includes('<header') || l.includes('<footer') || l.includes('class="band"') || (l.includes('id=') && (l.includes('<div') || l.includes('<main')))) {
    console.log(`${i+1}: ${l.trim().slice(0, 120)}`);
  }
});

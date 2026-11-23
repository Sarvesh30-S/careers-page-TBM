const fs = require('fs');
const dir = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';
const files = fs.readdirSync(dir).filter(f => f.startsWith('p5_'));
console.log('Phase 5 Part A Screenshots:');
files.forEach(f => {
  const stat = fs.statSync(`${dir}/${f}`);
  console.log(` - ${f} (${Math.round(stat.size / 1024)} KB)`);
});

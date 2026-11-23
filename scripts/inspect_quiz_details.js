const fs = require('fs');
const html = fs.readFileSync('reference/index.html', 'utf8');

const regex = /\.(quiz|qbar|qopts|qopt|qres|dot)[^{]*\{[^}]*\}/g;
let m;
console.log('=== CSS RULES IN REFERENCE/INDEX.HTML ===');
while ((m = regex.exec(html)) !== null) {
  console.log(m[0]);
}

const app = fs.readFileSync('reference/app.js', 'utf8');
console.log('\n=== APP.JS EVENT HANDLING FOR QUIZ ===');
const appLines = app.split('\n');
appLines.forEach((l, i) => {
  if (l.includes('data-q') || l.includes('qreset') || l.includes('drawQuiz')) {
    console.log(`${i + 1}: ${l}`);
  }
});

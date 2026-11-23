const fs = require('fs');
const html = fs.readFileSync('reference/index.html', 'utf8');
const app = fs.readFileSync('reference/app.js', 'utf8');

console.log('=== INSPECTING #FIT AND #HIRING IN INDEX.HTML ===');
const fitStart = html.indexOf('<section class="band" id="fit"');
const hiringStart = html.indexOf('<section class="band" id="hiring"');
const rolesStart = html.indexOf('<section class="band" id="roles"');

if (fitStart !== -1 && hiringStart !== -1) {
  console.log('\n--- #FIT HTML ---');
  console.log(html.substring(fitStart, hiringStart));
}

if (hiringStart !== -1 && rolesStart !== -1) {
  console.log('\n--- #HIRING HTML ---');
  console.log(html.substring(hiringStart, rolesStart));
}

console.log('\n=== INSPECTING QUIZ AND HIRING IN APP.JS ===');
const appLines = app.split('\n');
let quizLines = [];
let hiringLines = [];
let inQuiz = false, inHiring = false;

for (let i = 0; i < appLines.length; i++) {
  const line = appLines[i];
  if (line.includes('this or that') || line.includes('QUIZ =')) {
    inQuiz = true;
  }
  if (inQuiz) {
    quizLines.push(`${i + 1}: ${line}`);
    if (line.includes('how we hire') || line.includes('STEPS6 =')) {
      inQuiz = false;
      inHiring = true;
    }
  } else if (inHiring) {
    hiringLines.push(`${i + 1}: ${line}`);
    if (line.includes('open roles') || line.includes('ROLES =') || line.includes('renderRoles')) {
      inHiring = false;
    }
  }
}

console.log('--- QUIZ CODE IN APP.JS ---');
console.log(quizLines.slice(0, 50).join('\n'));

console.log('--- HIRING CODE IN APP.JS ---');
console.log(hiringLines.slice(0, 50).join('\n'));

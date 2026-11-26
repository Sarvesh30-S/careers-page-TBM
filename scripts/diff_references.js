const fs = require('fs');

function checkDiff(f1, f2, label) {
  console.log('---------------- ' + label + ' ----------------');
  const c1 = fs.readFileSync(f1, 'utf8');
  const c2 = fs.readFileSync(f2, 'utf8');
  console.log('Length:', f1, '=', c1.length, 'vs', f2, '=', c2.length);
  if (c1 === c2) {
    console.log('NO CHANGES');
    return;
  }
  const l1 = c1.split(/\r?\n/);
  const l2 = c2.split(/\r?\n/);
  console.log('Lines:', l1.length, 'vs', l2.length);
}

checkDiff('reference/index.html', 'reference_updated/index.html', 'index.html');
checkDiff('reference/data.js', 'reference_updated/data.js', 'data.js');
checkDiff('reference/app.js', 'reference_updated/app.js', 'app.js');

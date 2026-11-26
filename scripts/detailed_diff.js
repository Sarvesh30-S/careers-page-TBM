const fs = require('fs');

function detailedDiff(f1, f2, label) {
  console.log('====================================');
  console.log('DIFF ANALYSIS FOR:', label);
  console.log('====================================');
  const c1 = fs.readFileSync(f1, 'utf8');
  const c2 = fs.readFileSync(f2, 'utf8');
  
  const l1 = c1.split(/\r?\n/);
  const l2 = c2.split(/\r?\n/);

  // For data.js: check differences in exported objects / keys
  if (label === 'data.js') {
    // find lines added or changed
    const s1 = new Set(l1.map(l => l.trim()));
    const s2 = new Set(l2.map(l => l.trim()));
    console.log('Lines in new but not old:');
    l2.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed && !s1.has(trimmed)) {
        console.log(`+ [Line ${idx+1}]: ${trimmed}`);
      }
    });
  }

  // For index.html: check style differences, section changes
  if (label === 'index.html') {
    // Let's find sections or major tags in new file
    console.log('New sections/IDs in updated index.html:');
    l2.forEach((line, idx) => {
      if (line.includes('<section') || line.includes('id=') || line.includes('class=')) {
        // check if this pattern existed in old
        if (!c1.includes(line.trim())) {
          console.log(`+ [L${idx+1}]: ${line.trim()}`);
        }
      }
    });
  }

  if (label === 'app.js') {
    console.log('Lines in updated app.js not in old:');
    const s1 = new Set(l1.map(l => l.trim()));
    l2.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed && !s1.has(trimmed) && trimmed.length > 3) {
        console.log(`+ [L${idx+1}]: ${trimmed.slice(0, 100)}`);
      }
    });
  }
}

detailedDiff('reference/data.js', 'reference_updated/data.js', 'data.js');
detailedDiff('reference/index.html', 'reference_updated/index.html', 'index.html');
detailedDiff('reference/app.js', 'reference_updated/app.js', 'app.js');

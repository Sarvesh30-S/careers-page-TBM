const fs = require('fs');
const html = fs.readFileSync('reference/index.html', 'utf8');

const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
if (cssMatch) {
  const css = cssMatch[1];
  const rules = css.split(/(?<=})/);
  console.log('=== CSS RULES FOR PROC AND STEPS ===');
  rules.forEach(r => {
    if (r.includes('.proc') || r.includes('.steps')) {
      console.log(r.trim());
    }
  });
}

const fs = require('fs');

const newCss = fs.readFileSync('scripts/new_styles.css', 'utf8');

// Find sections in newCss: .brands, .marquee, .gallery, .games, .gtabs, etc.
const keywords = ['.brands', '.marquee', '.gallery', '.games', '.gtabs', '.lmeta', '.lhist', '.lwhy', '.lstate'];
const lines = newCss.split('\n');

lines.forEach((l, idx) => {
  if (keywords.some(k => l.includes(k))) {
    console.log(`L${idx+1}: ${l}`);
  }
});

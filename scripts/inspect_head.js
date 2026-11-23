const fs = require('fs');
const html = fs.readFileSync('reference/index.html', 'utf8');
const headEnd = html.indexOf('</head>');
console.log(html.substring(0, headEnd + 7));

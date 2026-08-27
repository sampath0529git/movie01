const fs = require('fs');
let code = fs.readFileSync('public/manifest.json', 'utf8');

code = code.replace(/MovieVibe/g, 'MovieZen');

fs.writeFileSync('public/manifest.json', code);

const fs = require('fs');
let content = fs.readFileSync('src/views/HomeView.tsx', 'utf8');

content = content.replace(/with HD moviestitles/gi, 'in HD Quality');
content = content.replace(/HD moviestitles/gi, 'HD movies');
content = content.replace(/free movies online Sri Lanka/gi, 'watch free movies online');
content = content.replace(/Tamil & TV Series/gi, 'European & Asian TV Series');
content = content.replace(/HD movies/gi, 'HD Movies');

fs.writeFileSync('src/views/HomeView.tsx', content, 'utf8');

const fs = require('fs');
let content = fs.readFileSync('app/layout.tsx', 'utf8');
content = content.replace(/<html lang="en">/g, '<html lang="en">');
// Try removing the actual html tags from layout to see if it fixes the build
// Just to isolate the issue.
content = content.replace(/<html lang="en">/g, '<div lang="en" id="html-replacement">');
content = content.replace(/<\/html>/g, '</div>');
fs.writeFileSync('app/layout.tsx', content);

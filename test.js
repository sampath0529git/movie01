const fs = require('fs');
const files = [
  'app/layout.tsx',
  'src/components/CustomVideoPlayer.tsx',
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('Html')) {
    console.log(`Found 'Html' in ${f}`);
  }
});

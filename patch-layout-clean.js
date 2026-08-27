const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');

const metadataStr = `export const metadata: Metadata = {
  title: 'MovieZen',
  description: 'Watch free movies and TV shows online',
};`;

code = code.replace(/export const metadata: Metadata = {[\s\S]*?};/, metadataStr);

fs.writeFileSync('app/layout.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');

const metadataStr = `export const metadata: Metadata = {
  title: 'MovieZen',
  description: 'Watch free movies and TV shows online',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' }
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ]
  },
  manifest: '/manifest.json'
};`;

code = code.replace(/export const metadata: Metadata = {[\s\S]*?};/, metadataStr);

fs.writeFileSync('app/layout.tsx', code);

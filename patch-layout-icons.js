const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');

const metadataStr = `export const metadata: Metadata = {
  title: 'MovieZen',
  description: 'Watch free movies and TV shows online',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon-512x512.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json'
};`;

code = code.replace(/export const metadata: Metadata = {[\s\S]*?};/, metadataStr);

fs.writeFileSync('app/layout.tsx', code);

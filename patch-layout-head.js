const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');

const headTags = `
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon-512x512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body`;

code = code.replace('<body', headTags);

fs.writeFileSync('app/layout.tsx', code);

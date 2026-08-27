const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');

const gaScript = `
        {/* Google Analytics Script */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_TRACKING_ID"></script>
        <script dangerouslySetInnerHTML={{
          __html: \`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YOUR_TRACKING_ID', {
              page_path: window.location.pathname,
            });
          \`
        }} />
`;

if (!code.includes('googletagmanager.com')) {
    code = code.replace(/<head>/, '<head>' + gaScript);
    fs.writeFileSync('app/layout.tsx', code);
}

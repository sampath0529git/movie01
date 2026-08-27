const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');

const newMetadata = `import { Viewport } from 'next';
export const viewport: Viewport = {
  themeColor: '#050800',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://moviezen.me'),
  title: {
    template: '%s | MovieZen - Free Streaming',
    default: 'MovieZen - Watch Free Movies & TV Shows Online in HD (USA)',
  },
  description: 'Stream and watch free movies and TV shows online in HD quality on MovieZen. Enjoy the best free streaming site for Hollywood movies and trending TV series without registration.',
  keywords: ['watch free movies online', 'stream TV shows free', 'HD movies online free', 'best free streaming sites USA', 'watch movies online free USA', 'MovieZen', 'free HD movies no registration'],
  authors: [{ name: 'MovieZen' }],
  creator: 'MovieZen',
  publisher: 'MovieZen',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MovieZen - Watch Free Movies & TV Shows Online in HD',
    description: 'Stream and watch free movies and TV shows online in HD quality on MovieZen without registration.',
    url: 'https://moviezen.me',
    siteName: 'MovieZen',
    images: [
      {
        url: '/favicon-512x512.png',
        width: 512,
        height: 512,
        alt: 'MovieZen Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MovieZen - Watch Free Movies & TV Shows Online in HD',
    description: 'Stream and watch free movies and TV shows online in HD quality on MovieZen.',
    images: ['/favicon-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
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

code = code.replace(/export const metadata: Metadata = {[\s\S]*?manifest: '\/manifest.json'\s*};/, newMetadata);

const jsonLdStr = `
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://moviezen.me/#website",
      "url": "https://moviezen.me/",
      "name": "MovieZen",
      "description": "Watch free movies and TV shows online in HD.",
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://moviezen.me/discover?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      ],
      "inLanguage": "en-US"
    },
    {
      "@type": "Organization",
      "@id": "https://moviezen.me/#organization",
      "name": "MovieZen",
      "url": "https://moviezen.me/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://moviezen.me/favicon-512x512.png"
      }
    }
  ]
};
`;

if (!code.includes('const jsonLd')) {
    code = code.replace(/export default function RootLayout/, jsonLdStr + '\nexport default function RootLayout');
}

const scriptTag = `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />`;

if (!code.includes('application/ld+json')) {
    code = code.replace(/<head>/, '<head>\n        ' + scriptTag);
}

fs.writeFileSync('app/layout.tsx', code);

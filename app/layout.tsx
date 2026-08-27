import './globals.css';
import { Metadata } from 'next';
import { I18nProvider } from '@/components/I18nProvider';

export const dynamic = 'force-dynamic';

import { Viewport } from 'next';
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
};


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
    },
    {
      "@type": "FAQPage",
      "@id": "https://moviezen.me/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is MovieZen free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, MovieZen is completely free to use. You can stream movies and TV shows online in HD without any registration or subscription fees."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need to create an account to watch movies?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, registration is not required. You can start streaming your favorite movies and TV shows immediately without signing up."
          }
        },
        {
          "@type": "Question",
          "name": "Is it safe to stream on MovieZen?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, MovieZen provides a secure streaming experience. We only link to publicly available content hosted on non-affiliated third-party platforms."
          }
        },
        {
          "@type": "Question",
          "name": "Can I watch movies in HD quality?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! Most of our movies and TV shows are available in high definition (HD) for the best viewing experience."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://moviezen.me/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://moviezen.me/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Movies",
          "item": "https://moviezen.me/movies"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "TV Series",
          "item": "https://moviezen.me/tv-series"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Discover",
          "item": "https://moviezen.me/discover"
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Collections",
          "item": "https://moviezen.me/collections"
        }
      ]
    },
    {
      "@type": "VideoObject",
      "@id": "https://moviezen.me/#video",
      "name": "Watch Free Movies & TV Shows Online in HD - MovieZen",
      "description": "Stream the latest Hollywood blockbuster movies and trending TV series in full HD quality. Watch free online streaming with no registration required.",
      "thumbnailUrl": [
        "https://moviezen.me/favicon-512x512.png"
      ],
      "uploadDate": new Date().toISOString(),
      "publisher": {
        "@id": "https://moviezen.me/#organization"
      },
      "contentUrl": "https://moviezen.me/",
      "embedUrl": "https://moviezen.me/",
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": { "@type": "http://schema.org/WatchAction" },
        "userInteractionCount": 1500000
      }
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      
            <head>
        {/* Google Analytics Script */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_TRACKING_ID"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YOUR_TRACKING_ID', {
              page_path: window.location.pathname,
            });
          `
        }} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon-512x512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-black text-white min-h-screen flex flex-col font-sans selection:bg-brand-700/50">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

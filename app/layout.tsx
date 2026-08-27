import './globals.css';
import { Metadata } from 'next';
import { I18nProvider } from '@/components/I18nProvider';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'MovieZen',
  description: 'Watch free movies and TV shows online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png?v=2" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png?v=2" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-192x192.png?v=2" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon-512x512.png?v=2" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" sizes="180x180" type="image/png" />
        <link rel="manifest" href="/manifest.json?v=2" />
      </head>
      <body className="bg-black text-white min-h-screen flex flex-col font-sans selection:bg-brand-700/50">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

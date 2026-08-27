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
      <body className="bg-black text-white min-h-screen flex flex-col font-sans selection:bg-brand-700/50">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

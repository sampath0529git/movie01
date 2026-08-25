import fs from 'fs';
import path from 'path';

function createDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function createFile(file: string, content: string) {
    fs.writeFileSync(file, content.trim() + '\n');
}

createDir('app');
createDir('app/(main)');
createDir('app/(main)/movies');
createDir('app/(main)/tv-series');
createDir('app/(main)/[mediaType]');
createDir('app/(main)/[mediaType]/[id]');

// Move globals
if (fs.existsSync('src/index.css')) {
    fs.copyFileSync('src/index.css', 'app/globals.css');
}

// Create Root Layout
createFile('app/layout.tsx', `
import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MovieVibe',
  description: 'Watch movies and TV shows',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="si">
      <body className="bg-black text-white min-h-screen flex flex-col font-sans selection:bg-brand-700/50">
        {children}
      </body>
    </html>
  );
}
`);

// Create Main Layout (with Navbar/Footer)
createFile('app/(main)/layout.tsx', `
"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import GlobalMonetization from '@/components/GlobalMonetization';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/firebase';
import { Toaster } from 'react-hot-toast';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, user } = useAuth();
  
  const currentView = pathname === '/' ? 'home' 
    : pathname.startsWith('/discover') ? 'discover'
    : pathname.startsWith('/movies') ? 'movies'
    : pathname.startsWith('/tv-series') ? 'tv-series'
    : pathname.startsWith('/watchlist') ? 'watchlist'
    : pathname.startsWith('/admin') ? 'admin'
    : 'home';

  const handleSelectMedia = (item: any) => {
    let prefix = item.type.toLowerCase() === 'movie' ? 'movies' : 'tv';
    let slug = item.slug || item.id;
    if (slug.endsWith('-sinhala-sub')) slug = slug.replace(/-sinhala-sub$/, '-sinhala-subtitles');
    router.push(\`/\${prefix}/\${slug}\`);
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#385600', color: '#fff', border: '1px solid #444' } }} />
      <Navbar 
        currentView={currentView} 
        setCurrentView={(view) => router.push(view === 'home' ? '/' : \`/\${view}\`)} 
        onLoginClick={() => setLoginModalOpen(true)}
        onSelectMedia={handleSelectMedia}
        isAdmin={isAdmin}
        user={user}
      />
      <main className="flex-grow flex flex-col w-full pb-20 lg:pb-0 pt-20">
        {children}
      </main>
      <Footer />
      <CookieConsent />
      <ScrollToTopButton />
      <GlobalMonetization />
      {isLoginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} />}
    </>
  );
}
`);

// Home
createFile('app/(main)/page.tsx', `
"use client";
import HomeView from '@/views/HomeView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <HomeView setCurrentView={(v) => router.push(v === 'home' ? '/' : \`/\${v}\`)} onSelectMedia={(i: any) => router.push(\`/\${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/\${i.slug || i.id}\`)} customMedia={[]} isLoading={false} loadMore={() => {}} hasMore={false} />;
}
`);

// Dynamic Route
createFile('app/(main)/[mediaType]/[id]/page.tsx', `
"use client";
import WatchView from '@/views/WatchView';
export default function Page() {
    return <WatchView item={null} onSelectMedia={() => {}} onBack={() => {}} />;
}
`);

// Next config
createFile('next.config.mjs', `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;
`);

// tsconfig update
let tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
tsconfig.compilerOptions.plugins = [{ name: "next" }];
tsconfig.compilerOptions.paths = { "@/*": ["./src/*"] };
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

// package.json update
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.dev = "next dev -p 3000 -H 0.0.0.0";
pkg.scripts.build = "next build";
pkg.scripts.start = "next start -p 3000 -H 0.0.0.0";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

console.log('Next.js setup complete.');

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
    if (slug.endsWith('-watch-free')) slug = slug.replace(/-watch-free$/, '-watch-online');
    router.push(`/${prefix}/${slug}`);
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#385600', color: '#fff', border: '1px solid #444' } }} />
      <Navbar 
        currentView={currentView} 
        setCurrentView={(view) => router.push(view === 'home' ? '/' : `/${view}`)} 
        onLoginClick={() => setLoginModalOpen(true)}
        onSelectMedia={handleSelectMedia}
        isAdmin={isAdmin}
        user={user}
      />
      <main className={`flex-grow flex flex-col w-full pb-20 lg:pb-0 ${currentView === 'home' ? 'pt-0' : 'pt-[76px]'}`}>
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

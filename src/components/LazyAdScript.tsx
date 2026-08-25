"use client";
import { useEffect, useRef } from 'react';

interface LazyAdScriptProps {
  src: string;
  id?: string;
  strategy?: 'lazyOnload' | 'afterInteractive';
}

/**
 * A Next.js `next/script` equivalent for Vite/React to load Ads (Monetag/Pop-under) 
 * without hurting Core Web Vitals (especially LCP or TBT).
 */
export default function LazyAdScript({ src, id, strategy = 'lazyOnload' }: LazyAdScriptProps) {
  const scriptInjected = useRef(false);

  useEffect(() => {
    if (scriptInjected.current) return;

    const loadScript = () => {
      if (document.getElementById(id || src)) return;
      
      const script = document.createElement('script');
      script.src = src;
      script.id = id || src;
      script.async = true;
      script.defer = true; // Prevents render blocking!
      document.body.appendChild(script);
      scriptInjected.current = true;
    };

    if (strategy === 'afterInteractive') {
      // afterInteractive: Wait until the browser is idle to load ads.
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => loadScript(), { timeout: 2000 });
      } else {
        setTimeout(loadScript, 2000); // Safari fallback
      }
    } else if (strategy === 'lazyOnload') {
      // lazyOnload: Load only AFTER the user scrolls or interacts. PERFECT for pop-unders.
      const handleInteraction = () => {
        loadScript();
        window.removeEventListener('scroll', handleInteraction);
        window.removeEventListener('mousemove', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
      };

      window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
      window.addEventListener('mousemove', handleInteraction, { once: true, passive: true });
      window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
    }

  }, [src, id, strategy]);

  return null; // This component is invisible
}

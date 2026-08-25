"use client";
import { HelmetProvider } from 'react-helmet-async';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      {children}
    </HelmetProvider>
  );
}

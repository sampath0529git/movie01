import Link from 'next/link';
import { Home, Film, Tv, Search } from 'lucide-react';
import { LogoImage } from '@/components/LogoImage';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050800] text-white p-6 relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/20 via-black to-black z-0 pointer-events-none"></div>
      
      <div className="z-10 text-center max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <LogoImage className="w-16 h-16 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]" />
        </div>
        
        <h1 className="text-7xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back to the movies!
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-left">
          <Link href="/" className="flex items-center gap-3 p-4 bg-[#111] hover:bg-[#1a1a1a] border border-white/5 hover:border-brand-500/50 rounded-xl transition-all group">
            <div className="p-2 bg-brand-600/10 rounded-lg group-hover:bg-brand-600/20 text-brand-500">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Home</div>
              <div className="text-xs text-gray-500">Back to homepage</div>
            </div>
          </Link>
          
          <Link href="/movies" className="flex items-center gap-3 p-4 bg-[#111] hover:bg-[#1a1a1a] border border-white/5 hover:border-brand-500/50 rounded-xl transition-all group">
            <div className="p-2 bg-brand-600/10 rounded-lg group-hover:bg-brand-600/20 text-brand-500">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Movies</div>
              <div className="text-xs text-gray-500">Browse films</div>
            </div>
          </Link>
          
          <Link href="/tv-series" className="flex items-center gap-3 p-4 bg-[#111] hover:bg-[#1a1a1a] border border-white/5 hover:border-brand-500/50 rounded-xl transition-all group">
            <div className="p-2 bg-brand-600/10 rounded-lg group-hover:bg-brand-600/20 text-brand-500">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">TV Series</div>
              <div className="text-xs text-gray-500">Binge trending shows</div>
            </div>
          </Link>

          <Link href="/discover" className="flex items-center gap-3 p-4 bg-[#111] hover:bg-[#1a1a1a] border border-white/5 hover:border-brand-500/50 rounded-xl transition-all group">
            <div className="p-2 bg-brand-600/10 rounded-lg group-hover:bg-brand-600/20 text-brand-500">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Discover</div>
              <div className="text-xs text-gray-500">Find new content</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

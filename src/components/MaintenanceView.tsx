"use client";
import { Film, MonitorPlay, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MaintenanceView() {
  const [showOverlay, setShowOverlay] = useState(false);
  const monetagLink = localStorage.getItem("monetag_link") || "https://omg10.com/4/10928402";

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const newWindow = typeof window !== 'undefined' && window.open(monetagLink, "_blank");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Popup blocked, show overlay to capture click
          setShowOverlay(true);
        }
      } catch (err) {
        setShowOverlay(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [monetagLink]);

  const handleInteraction = () => {
    if (showOverlay) {
      typeof window !== 'undefined' && window.open(monetagLink, "_blank");
      setShowOverlay(false); // Hide after one click
    }
  };

  return (
    <div className="min-h-screen bg-[#050A05] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Invisible overlay fallback if auto-redirect is blocked */}
      {showOverlay && (
        <div 
          className="fixed inset-0 z-[9999] bg-transparent cursor-pointer"
          onClick={handleInteraction}
          onTouchStart={handleInteraction}
        />
      )}

      {/* Background Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200vw] sm:w-full max-w-5xl h-[80vh] bg-green-900/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 z-0"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
        
        {/* Icon Group */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
          <div className="relative flex items-center justify-center">
            {/* Main Monitor */}
            <MonitorPlay className="w-40 h-40 text-green-500 stroke-[1.5]" />
            
            {/* Surrounding Tools/Icons */}
            <div className="absolute -top-4 -right-4 bg-[#0a140a] p-3 rounded-full border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Wrench className="w-8 h-8 text-green-400" />
            </div>
            
            <div className="absolute -bottom-2 -left-4 bg-[#0a140a] p-3 rounded-full border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Film className="w-8 h-8 text-green-400" />
            </div>
            
            {/* Crane Graphic */}
            <div className="absolute -top-8 -left-8 right-0 h-10 border-t-2 border-l-2 border-dashed border-green-600/50 rounded-tl-xl w-32"></div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-md">
          We'll Be Back Soon!
        </h1>
        
        <div className="space-y-3 text-gray-300 text-lg md:text-xl font-medium drop-shadow-sm">
          <p>Our website is currently under maintenance to improve your movie watching experience.</p>
          <p>We'll be back online shortly with better speed and new content.</p>
          <p className="text-green-400 font-bold pt-2 text-2xl drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
            Coming back very soon
          </p>
          <p className="pt-4 opacity-80">Thank you for your patience!</p>
        </div>
        
      </div>

      {/* Film strips on the edges */}
      <div className="absolute top-0 bottom-0 left-0 w-16 opacity-10 pointer-events-none hidden md:flex flex-col justify-around">
        {[...Array(6)].map((_, i) => (
          <Film key={i} className="w-full h-24 text-green-500 rotate-12" />
        ))}
      </div>
      <div className="absolute top-0 bottom-0 right-0 w-16 opacity-10 pointer-events-none hidden md:flex flex-col justify-around">
        {[...Array(6)].map((_, i) => (
          <Film key={`r${i}`} className="w-full h-24 text-green-500 -rotate-12" />
        ))}
      </div>
    </div>
  );
}

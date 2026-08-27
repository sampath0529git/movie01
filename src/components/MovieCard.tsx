import React from "react";
import { Star, Plus, Check } from "lucide-react";
import { MediaItem } from "../types";
import { prefetchNextRoute } from "../utils/prefetch";
import { useWatchlist } from "../hooks/useWatchlist";
import toast from "react-hot-toast";

interface MovieCardProps {
  item: MediaItem;
  key?: React.Key;
  onClick?: () => void;
  priority?: boolean;
}

export default function MovieCard({ item, onClick, priority = false }: MovieCardProps) {
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const isAdded = isInWatchlist(item.id);

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(item);
    toast.success(isAdded ? "Removed from watchlist" : "Added to watchlist!");
  };

  const handleMouseEnter = () => {
    // Pre-fetch the watch page route
    prefetchNextRoute(`/watch/${item.id}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only intercept the click if we actually have a monetag link
    const monetagLink = localStorage.getItem("monetag_link");
    if (monetagLink) {
      try {
        const newWindow = typeof window !== 'undefined' && window.open(monetagLink, "_blank");
        if (newWindow) {
          window.focus();
        }
      } catch(err) {
        // Silently ignore popup blocker errors
      }
    }
    
    // Always trigger the original click behavior (e.g. navigation)
    if (onClick) onClick();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${item.title}`}
      className="movie-card-element group cursor-pointer flex flex-col gap-3 relative transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.2)] hover:z-10 focus-within:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        } else if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          e.preventDefault();
          const target = e.currentTarget as HTMLElement;
          const container = target.parentElement; // Immediate parent (grid or flex container)
          if (!container) return;
          
          const cards = Array.from(container.querySelectorAll('.movie-card-element')) as HTMLElement[];
          const index = cards.indexOf(target);
          if (index === -1) return;
          
          let nextIndex = index;
          if (e.key === 'ArrowRight') nextIndex = Math.min(index + 1, cards.length - 1);
          if (e.key === 'ArrowLeft') nextIndex = Math.max(index - 1, 0);
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
             const rect = target.getBoundingClientRect();
             // Find items per row by checking items with same top position
             let rowStart = index;
             while(rowStart > 0 && Math.abs(cards[rowStart - 1].getBoundingClientRect().top - rect.top) < 10) {
                rowStart--;
             }
             let rowEnd = index;
             while(rowEnd < cards.length - 1 && Math.abs(cards[rowEnd + 1].getBoundingClientRect().top - rect.top) < 10) {
                rowEnd++;
             }
             const itemsPerRow = rowEnd - rowStart + 1;
             
             if (e.key === 'ArrowDown') {
                 nextIndex = index + itemsPerRow;
                 if (nextIndex >= cards.length) nextIndex = cards.length - 1;
             } else {
                 nextIndex = index - itemsPerRow;
                 if (nextIndex < 0) nextIndex = 0;
             }
          }
          
          if (nextIndex !== index && cards[nextIndex]) {
            cards[nextIndex].focus();
            // Optional: scroll into view nicely
            cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }}
      onMouseEnter={handleMouseEnter}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#253900] shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.8)] border-2 border-transparent group-hover:border-brand-600/60">
        <img
          src={item.imageUrl}
          alt={item.imageAlt || `${item.title} ${item.year ? item.year : ''} Watch Free | watch online`.trim().replace(/  +/g, ' ')}
          width="300"
          height="450"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
        
        {/* Subtle gradient overlay to make things pop on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Overlays top-left */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-20">
          {item.hasSinhalaSub && (
            <div className="bg-brand-600 text-white text-[12px] font-black px-2 py-1 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              සි
            </div>
          )}
          {item.isUpcoming && (
            <div className="bg-yellow-500 text-black text-[12px] font-black px-2 py-1 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              UPCOMING
            </div>
          )}
          {item.completedSeasonTag && (
            <div className="bg-[#E50914] text-white text-[12px] font-black px-2 py-1 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.5)] uppercase">
              {item.completedSeasonTag}
            </div>
          )}
        </div>

        {/* Rating overlay */}
        {item.rating && (
          <div className="absolute top-2 right-2 bg-[#f5c518] text-black text-[12px] px-2 py-1 rounded-md flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-20 transition-transform hover:scale-105">
            <span className="flex items-center gap-1 font-black">
              <Star className="w-3.5 h-3.5 fill-black text-black" />
              <span className="text-[13px]">{item.rating}</span>
            </span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end z-20">
          <div className="flex gap-1.5 transition-opacity">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${
                item.quality === "HD"
                  ? "bg-[#0d1400] text-white border-white/20"
                  : "bg-[#0d1400] text-brand-500 border-brand-500/30"
              }`}
            >
              {item.quality}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                item.type === "MOVIE"
                  ? "bg-yellow-600 text-black"
                  : "bg-brand-700 text-white"
              }`}
            >
              {item.type}
            </span>
          </div>

          <button
            onClick={handleAddToWatchlist}
            className={`p-1.5 rounded-md flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isAdded
                ? "bg-brand-600/90 text-white hover:bg-brand-600"
                : "bg-black/80 text-white hover:bg-brand-600 border border-white/20 hover:border-brand-600"
            }`}
            title={isAdded ? "Remove from Watchlist" : "Add to Watchlist"}
            aria-label={isAdded ? `Remove ${item.title} from Watchlist` : `Add ${item.title} to Watchlist`}
          >
            {isAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      
            <div>
        <h3 className="text-[15px] font-bold text-white truncate group-hover:text-brand-500 transition-colors">
          {item.title}
        </h3>
        <div className="flex justify-between items-center text-[13px] text-gray-400 mt-1">
          <span>{item.year}</span>
          {item.duration && <span>{item.duration}</span>}
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 group-hover:text-gray-400 transition-colors" title={item.description}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
"use client";
import React, { useState, useEffect } from "react";
import { Play, Bookmark } from "lucide-react";
import { MediaItem } from "../types";
import { channelsData } from "../data";

interface HeroSectionProps {
  movies: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
}

export default function HeroSection({ movies, onSelectMedia }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(movies.length, 6));
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const activeMovie = movies[activeIndex];

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] md:h-[600px] rounded-xl overflow-hidden mb-12 group">
      {/* Background Image Carousel */}
      {movies.slice(0, 6).map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={movie.bannerUrl || movie.imageUrl}
            alt={`${movie.title} Watch Online`}
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-[100px] sm:pb-[120px] md:pb-[100px] px-4 sm:px-6 md:px-12 lg:px-16 pointer-events-none">
        <div className="max-w-2xl pointer-events-auto">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-md text-xs font-bold text-gray-200 mb-4 border border-white/10 uppercase tracking-wider">
            {activeMovie.type === "TV" ? "TV Show" : "Movie"}
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-3 leading-tight">
            {activeMovie.title}
          </h1>
          <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-4 max-w-xl leading-relaxed drop-shadow-md">
            {activeMovie.description || `Experience the thrilling and compelling story of ${activeMovie.title}. This critically acclaimed masterpiece brings unexpected twists, powerful drama, and unforgettable moments.`}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm md:text-base text-gray-300 mb-6 font-medium">
            {activeMovie.year && <span>{activeMovie.year}</span>}
            {activeMovie.year && <span>•</span>}
            <span>{Array.isArray(activeMovie.genres) ? activeMovie.genres.join(" • ") : activeMovie.genre}</span>
            {activeMovie.quality && (
              <>
                <span>•</span>
                <span className="text-white bg-white/20 px-1.5 py-0.5 rounded text-xs backdrop-blur-sm">
                  {activeMovie.quality}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => onSelectMedia(activeMovie)}
              className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold text-[14px] md:text-base transition-colors whitespace-nowrap w-fit shadow-lg shadow-brand-500/20"
            >
              <Play fill="currentColor" className="w-4 h-4 md:w-5 md:h-5" />
              <span className="truncate">Watch Trailer</span>
            </button>
            <button
              onClick={() => onSelectMedia(activeMovie)}
              className="flex items-center justify-center gap-2 bg-black/40 hover:bg-black/60 text-white border border-white/20 md:border-white/10 w-[42px] h-[42px] md:w-auto md:h-auto md:px-8 md:py-3 rounded-full font-bold text-[14px] md:text-base transition-all duration-300 backdrop-blur-sm shrink-0"
              aria-label="Add to Watchlist"
            >
              <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">Add Watchlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-[90px] md:bottom-[100px] left-6 md:left-auto right-6 md:right-12 flex justify-start md:justify-end gap-2 z-20">
        {movies.slice(0, 6).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === activeIndex ? "bg-brand-500 w-6" : "bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Channels Marquee */}
      <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-[#0A0D14]/80 backdrop-blur-md border-t border-white/5 flex items-center z-20">
        <div className="w-full overflow-hidden pause-marquee group/channels relative">
          <div className="flex w-max animate-marquee space-x-12 px-6 items-center">
            {[...channelsData, ...channelsData, ...channelsData].map((channel, i) => (
              <div
                key={`channel-${i}`}
                className="flex items-center justify-center hover:opacity-80 transition-all cursor-pointer min-w-[100px]"
              >
                <img
                  src={channel.logoUrl}
                  alt={channel.name}
                  className={`h-8 object-contain ${channel.invert ? "invert" : ""}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

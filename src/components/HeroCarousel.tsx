"use client";
import { useState, useEffect, useCallback } from "react";
import { MediaItem } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroCarouselProps {
  items: (MediaItem & { heroUrl?: string })[];
  onSelectMedia: (item: MediaItem) => void;
  interval?: number;
}

export default function HeroCarousel({
  items,
  onSelectMedia,
  interval = 7000,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, interval]);

  if (!items || items.length === 0) return null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-gray-900 group shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {items.map((item, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image with subtle zoom */}
            <div
              className={`w-full h-full transition-transform duration-[10000ms] ease-out ${isActive ? "scale-100 group-hover:scale-110" : "scale-100"}`}
            >
              <img
                src={item.heroUrl || item.imageUrl}
                alt={`Watch ${item.title} ${item.year ? `(${item.year})` : ''} Sinhala sub High Definition Stream Online Free`}
                width="1920"
                height="1080"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

            <div className="absolute inset-x-4 md:inset-x-6 bottom-8 flex flex-col justify-end pointer-events-none">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-md">
                {item.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs lg:text-sm text-gray-300 font-medium mb-3">
                <span className="border border-gray-600 px-1 rounded text-[10px] lg:text-xs">
                  IMDb
                </span>{" "}
                {item.rating || "N/A"}
                <span>•</span>
                <span>
                  <span className="text-gray-400">Genre:</span>{" "}
                  {item.genre || "Various"}
                </span>
                {item.duration && (
                  <>
                    <span>•</span>
                    <span>
                      <span className="text-gray-400">Duration:</span>{" "}
                      {item.duration}
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-xs lg:text-sm line-clamp-2 max-w-lg mb-4 pointer-events-auto">
                {item.description ||
                  "No description available for this content."}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMedia(item);
                }}
                className="self-end bg-brand-600 hover:bg-brand-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] text-white px-6 py-3 rounded flex items-center gap-2 font-bold transition-all duration-300 pointer-events-auto hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>{" "}
                Watch Now
              </button>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/90 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/90 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "bg-brand-600 w-5"
                : "bg-white/40 hover:bg-white/80 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

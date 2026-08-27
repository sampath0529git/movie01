"use client";
import { motion } from "motion/react";
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, Filter } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import SectionHeader from "../components/SectionHeader";
import Pagination from "../components/Pagination";
import { MediaItem } from "../types";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";
import HeroSection from "../components/HeroSection";
import SkeletonGrid from "../components/SkeletonGrid";

interface DiscoverViewProps {
  onSelectMedia: (item: MediaItem) => void;
  customMedia?: MediaItem[];
  isLoading?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
}

export default function DiscoverView({
  onSelectMedia,
  customMedia = [],
  isLoading,
  hasMore,
  loadMore
}: DiscoverViewProps) {
  const { t } = useTranslation();
  const pathname = usePathname(); 
  const nextSearchParams = useSearchParams();
  const location = { pathname, search: nextSearchParams ? nextSearchParams.toString() : "", state: { genre: "All", year: "All" } };
  const queryParam = nextSearchParams?.get('q') || "";
  
  const [quality, setQuality] = useState("All");
  const [genre, setGenre] = useState(location.state?.genre || "All");
  const [year, setYear] = useState(location.state?.year || "All");
  const [rating, setRating] = useState(0);
  const [network, setNetwork] = useState("All");

  const genres = [
    { id: "All", name: "All" },
    { id: "Action", name: "Action" },
    { id: "Crime", name: "Crime" },
    { id: "Mystery", name: "Mystery" },
    { id: "Romance", name: "Romance" },
    { id: "Animation", name: "Animation" },
    { id: "History", name: "History" },
    { id: "Sports", name: "Sports" },
    { id: "Thriller", name: "Thriller" },
    { id: "Drama", name: "Drama" },
    { id: "Horror", name: "Horror" },
    { id: "Fantasy", name: "Fantasy" },
    { id: "Documentary", name: "Documentary" },
    { id: "Sci-Fi", name: "Sci-Fi" },
    { id: "Comedy", name: "Comedy" },
    { id: "Ghost", name: "Ghost" }
  ];
  const years = ["All", "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2005"];
  const networks = [
    "All",
    "Netflix",
    "Amazon",
    "Disney",
    "HBO Max",
    "Apple TV",
    "Hulu",
  ];
  const qualities = ["All", "HD", "CAM"];

  const [itemsPerPage, setItemsPerPage] = useState((typeof window !== 'undefined' ? window.innerWidth : 1024) < 768 ? 8 : 18);

  useEffect(() => {
    const handleResize = () => setItemsPerPage((typeof window !== 'undefined' ? window.innerWidth : 1024) < 768 ? 8 : 18);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filteredMovies = useMemo(() => {
    // Only search through all customMedia (both movie and tv-series) when there's a search term
    const combined = queryParam ? [...customMedia] : [...customMedia.filter((m) => m.type === "MOVIE")];
    
    return combined.filter((movie) => {
      if (quality !== "All" && movie.quality !== quality) return false;
      if (genre !== "All") {
        const itemGenres = movie.genres && movie.genres.length > 0 
          ? movie.genres 
          : (movie.genre ? movie.genre.split(',').map(g => g.trim()) : []);
        if (!itemGenres.includes(genre)) return false;
      }
      if (year !== "All" && movie.year !== year) return false;
      if (network !== "All" && movie.network !== network) return false;
      if (parseFloat(movie.rating as string) < rating) return false;
      
      if (queryParam) {
        const titleMatch = movie.title?.toLowerCase().includes(queryParam.toLowerCase());
        const descMatch = movie.description?.toLowerCase().includes(queryParam.toLowerCase());
        if (!titleMatch && !descMatch) return false;
      }
      
      return true;
    });
  }, [quality, genre, year, rating, network, customMedia, queryParam]);

  // Reset pagination on filter change
  useMemo(() => {
    setCurrentPage(1);
  }, [quality, genre, year, rating, network, queryParam]);

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const currentItems = filteredMovies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectClassName =
    "w-full bg-[#161616] border border-[#1a2700] rounded-md px-4 py-2.5 text-sm text-gray-300 font-medium hover:bg-[#0d1400] focus:outline-none appearance-none cursor-pointer";

  return (
    <div className="px-3 py-4 sm:p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <SEO 
        title="Trending Movies & TV Shows  | Watch Latest Updates" 
        description="Discover trending movies and TV shows . Updated daily with latest releases and popular titles."
        keywords={["discover movies", "find tv shows", "trending movies", "top rated tv series", "movie recommendations", "moviezen discover", "HD moviestitle"]}
      />

      {/* Hero Section */}
      {!queryParam && <HeroSection movies={customMedia} onSelectMedia={onSelectMedia} />}

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full bg-[#0d1400] border border-[#1a2700] rounded-md pl-4 pr-8 py-2 text-sm text-gray-300 font-medium hover:bg-[#253900] appearance-none focus:outline-none cursor-pointer"
          >
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.id === "All" ? t("discover.genre", "Genres") : g.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
        <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full bg-[#0d1400] border border-[#1a2700] rounded-md pl-4 pr-8 py-2 text-sm text-gray-300 font-medium hover:bg-[#253900] appearance-none focus:outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y === "All" ? t("discover.year", "Years") : y}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-lg font-bold text-gray-300">Advanced Filters</h2>
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className={`border rounded-md p-2 transition-colors ${isFiltersOpen ? "bg-[#253900] border-brand-500 text-brand-500" : "bg-[#161616] border-[#1a2700] text-gray-300 hover:bg-[#0d1400]"}`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isFiltersOpen ? "auto" : 0, opacity: isFiltersOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden md:!h-auto md:!opacity-100 md:!overflow-visible"
      >
        <div className="flex flex-wrap gap-6 mb-10 pb-6 border-b border-[#253900]">
          <div className="flex flex-col gap-2 min-w-[140px] flex-1 max-w-[200px]">
          <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
            {t("discover.all", "ALL")}
          </span>
          <div className="relative">
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className={selectClassName}
            >
              {qualities.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px] flex-1 max-w-[200px]">
          <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
            {t("discover.genre", "GENRE")}
          </span>
          <div className="relative">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={selectClassName}
            >
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px] flex-1 max-w-[200px]">
          <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
            {t("discover.year", "BY YEAR")}
          </span>
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={selectClassName}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px] flex-1 max-w-[200px]">
          <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
            {t("discover.rating", "IMDB RATING")}
          </span>
          <div className="h-[42px] flex items-center gap-4 bg-transparent px-2">
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full accent-yellow-500 h-1 bg-[#1a2700] rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #eab308 ${rating * 10}%, #1a2700 ${rating * 10}%)`,
              }}
            />
            <span className="text-sm font-bold text-yellow-500 w-6">
              {rating}+
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px] flex-1 max-w-[200px]">
          <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
            {t("discover.network", "NETWORK")}
          </span>
          <div className="relative">
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className={selectClassName}
            >
              {networks.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        </div>
      </motion.div>

      <div className="mb-10 mt-4">
        <h2 className="text-2xl font-bold text-white mb-6">Popular Of The Week</h2>
        <div className="relative overflow-hidden py-2 group pause-marquee">
          <div className="flex w-max animate-marquee space-x-8 px-3">
            {[...customMedia.slice(0, 10), ...customMedia.slice(0, 10)].map((movie, i) => {
              const rank = (i % 10) + 1;
              return (
                <div
                  key={`${movie.id}-popular-${i}`}
                  className="flex items-center gap-3 sm:gap-4 group cursor-pointer flex-shrink-0 w-[300px] sm:w-[350px]"
                  onClick={() => onSelectMedia(movie)}
                >
                  <span className="text-[80px] sm:text-[100px] font-black text-[#2a2d36] italic leading-none tracking-tighter">
                    {rank}
                  </span>
                  <img
                    src={movie.imageUrl}
                    alt={`${movie.title} HD movies`}
                    className="w-[70px] h-[100px] sm:w-[90px] sm:h-[130px] rounded-lg object-cover shadow-lg group-hover:ring-2 ring-brand-500 transition-all"
                  />
                  <div className="flex flex-col justify-center flex-1 overflow-hidden">
                    <span className="text-[10px] text-gray-300 border border-gray-600 px-1.5 py-0.5 rounded w-max mb-1.5">
                      {movie.quality || "HD"}
                    </span>
                    <h3 className="text-white font-bold text-base sm:text-lg truncate group-hover:text-brand-500 transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 truncate">
                      <span className="text-gray-500 text-[8px]">■</span>
                      <span className="truncate">{Array.isArray(movie.genres) ? movie.genres.join(" • ") : movie.genre}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                      <span className="text-yellow-500 font-bold flex items-center gap-1">
                        ★ {movie.rating || "N/A"}
                      </span>
                      <span className="text-gray-500">
                        | {movie.type === "TV" ? "TV Show" : "Movie"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SectionHeader title={queryParam ? `Search Results for "${queryParam}"` : t("discover.title", "Discover Movies")} />

      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {currentItems.length > 0 ? (
            currentItems.map((movie, index) => (
              <MovieCard
                key={movie.id}
                item={movie}
                onClick={() => onSelectMedia(movie)}
                priority={index < 12}
              />
            ))
          ) : (
            <div className="col-span-full flex justify-center py-20 text-gray-500">
              {t("discover.no_movies", "No movies match the selected filters.")}
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && !isLoading && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
      
      {hasMore && !isLoading && (
        <div className="flex justify-center mt-8 pb-8">
          <button 
            onClick={loadMore}
            className="px-6 py-3 bg-[#243600] text-gray-200 hover:text-white rounded-md font-medium transition duration-200 hover:bg-[#385600] flex items-center justify-center space-x-2"
          >
            <span>Load More Items from Database</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
}

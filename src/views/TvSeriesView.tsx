"use client";
import { motion } from "motion/react";
import { useRouter } from 'next/navigation';
import { ChevronDown, Filter } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import SectionHeader from "../components/SectionHeader";
import MovieCard from "../components/MovieCard";
import HeroSection from "../components/HeroSection";
import { MediaItem } from "../types";
import { useTranslation } from "react-i18next";
import PageSearchBar from "../components/PageSearchBar";
import SEO from "../components/SEO";
import Pagination from "../components/Pagination";
import SkeletonGrid from "../components/SkeletonGrid";

interface TvSeriesViewProps {
  onSelectMedia: (item: MediaItem) => void;
  customMedia?: MediaItem[];
  isLoading?: boolean;
  defaultLanguage?: string;
  defaultGenre?: string;
  hasMore?: boolean;
  loadMore?: () => void;
}


export default function TvSeriesView({
  onSelectMedia,
  customMedia = [],
  isLoading,
  defaultLanguage = "All",
  defaultGenre = "All",
  hasMore,
  loadMore
}: TvSeriesViewProps) {
  const navigate = useRouter();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [quality, setQuality] = useState("All");
  const [genre, setGenre] = useState(defaultGenre);
  const [year, setYear] = useState("All");
  const [rating, setRating] = useState(0);
  const [network, setNetwork] = useState("All");

  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);

  useEffect(() => {
    setGenre(defaultGenre);
  }, [defaultGenre]);

  useEffect(() => {
    setSelectedLanguage(defaultLanguage);
  }, [defaultLanguage]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState((typeof window !== 'undefined' ? window.innerWidth : 1024) < 768 ? 8 : 18);

  useEffect(() => {
    const handleResize = () => setItemsPerPage((typeof window !== 'undefined' ? window.innerWidth : 1024) < 768 ? 8 : 18);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const years = ["All", "2026", "2025", "2024", "2019", "2005"];
  const languages = [
    { id: "All", name: "All" },
    { id: "English", name: "English" },
    { id: "Hindi", name: "Hindi" },
    { id: "Korean", name: "Korean" },
    { id: "Chinese", name: "Chinese" },
    { id: "Japanese", name: "Japanese" },
    { id: "Thai", name: "Thai" },
    { id: "Telugu", name: "Telugu" },
    { id: "Tamil", name: "Tamil" },
    { id: "Kannada", name: "Kannada" },
    { id: "Malayalam", name: "Malayalam" },
    
  ];
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

  const combined = [...customMedia.filter((m) => m.type === "TV")];

  const filteredTv = useMemo(() => {
    return combined.filter((tv) => {
      if (searchTerm && !tv.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (quality !== "All" && tv.quality !== quality) return false;
      if (genre !== "All") {
        const itemGenres = tv.genres && tv.genres.length > 0 
          ? tv.genres 
          : (tv.genre ? tv.genre.split(',').map(g => g.trim()) : []);
        if (!itemGenres.includes(genre)) return false;
      }
      if (year !== "All" && tv.year !== year) return false;
      
      if (selectedLanguage !== "All") {
        const langLower = selectedLanguage.toLowerCase();
        const langMatch = tv.language?.toLowerCase() === langLower;
        const titleMatch = tv.title?.toLowerCase().includes(langLower);
        const descMatch = tv.description?.toLowerCase().includes(langLower);
        if (!langMatch && !titleMatch && !descMatch) return false;
      }

      if (parseFloat(tv.rating as string) < rating) return false;
      return true;
    });
  }, [combined, searchTerm, quality, genre, year, rating, network, selectedLanguage]);

  const selectClassName =
    "w-full bg-[#161616] border border-[#1a2700] rounded-md px-4 py-2.5 text-sm text-gray-300 font-medium hover:bg-[#0d1400] focus:outline-none appearance-none cursor-pointer";

  // Reset pagination on filter change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, quality, genre, year, rating, network, selectedLanguage]);

  const totalPages = Math.ceil(filteredTv.length / itemsPerPage);
  const currentItems = filteredTv.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const latestEpisodesShows = useMemo(() => {
    // Collect the 12 most recently added/updated TV series that actually have episodes
    const withEpisodes = combined.filter(tv => tv.seasons && tv.seasons.length > 0 && tv.seasons.some(s => s.episodes && s.episodes.length > 0));
    
    if (withEpisodes.length > 0) {
      return withEpisodes.map(tv => {
        // Find the last season that has episodes
        const seasonsWithEps = tv.seasons!.filter(s => s.episodes && s.episodes.length > 0);
        const lastSeason = seasonsWithEps[seasonsWithEps.length - 1];
        const lastEp = lastSeason.episodes[lastSeason.episodes.length - 1];
        return {
          ...tv,
          duration: `S${lastSeason.seasonNumber} E${lastEp.episodeNumber}`
        };
      }).slice(0, 12);
    }
    
    // Fallback so the section always renders at least something for demonstration
    return combined.slice(0, 12);
  }, [combined]);

  // Use featured/trending for hero slider, fallback to top 10
  let heroItems = combined.filter((m) => m.featured || m.trending);
  if (heroItems.length < 4) {
    const additional = combined.filter(m => !heroItems.includes(m)).slice(0, 10 - heroItems.length);
    heroItems = [...heroItems, ...additional];
  } else {
    heroItems = heroItems.slice(0, 10);
  }

  const carouselItems = heroItems.map((item) => ({
    ...item,
    heroUrl:
      item.bannerUrl || `https://picsum.photos/seed/herotv${item.id}/1200/500`,
  }));

  const leftItems = carouselItems.filter((_, i) => i % 2 === 0);
  const rightItems = carouselItems.filter((_, i) => i % 2 === 1);

  const isKorean = selectedLanguage === 'Korean';
  
  let seoTitle = "Watch Free TV Series Online - Full Episodes HD";
  let seoDescription = "Watch full episodes of your favorite TV shows online for free in HD. Fast streaming, daily updates of the latest TV series. No account needed.";
  
  if (isKorean) {
    seoTitle = "Korean Drama  | Watch Online Free HD";
    seoDescription = "Watch latest Korean drama TV series in HD quality. Free streaming with fast servers and daily updates.";
  } else if (genre !== "All") {
    seoTitle = `${genre} TV Series  | Watch Online Free HD`;
    seoDescription = `Watch best ${genre} TV series in HD quality. Free streaming with fast servers and no signup required.`;
  } else if (selectedLanguage !== "All") {
    seoTitle = `${selectedLanguage} TV Series  | Watch Free HD Online`;
    seoDescription = `Watch ${selectedLanguage} TV shows . Free HD streaming with daily updates.`;
  }

  const getSeoDescription = () => {
    if (selectedLanguage === "All" && genre === "All") return null;

    const langName = selectedLanguage !== "All" ? languages.find(l => l.id === selectedLanguage)?.name : "";
    const genreName = genre !== "All" ? genres.find(g => g.id === genre)?.name : "";
    
    const englishTitle = `${selectedLanguage !== "All" ? selectedLanguage : ""}${selectedLanguage !== "All" && genre !== "All" ? " " : ""}${genre !== "All" ? genre : ""}`.trim();

    return `Watch the latest ${englishTitle} TV Series online for free. Enjoy our best and newest ${englishTitle} series collection in HD quality. Download and stream the most popular ${englishTitle} episodes easily right now.`;
  };

  return (
    <div className="px-3 py-4 sm:p-6 md:p-10 max-w-[1600px] mx-auto w-full flex-grow">
      <SEO 
        title={seoTitle} 
        description={seoDescription}
        keywords={["watch tv shows online", "free tv series", "stream tv shows free", "HD moviestitle", "korean dramas", "latest films"]}
      />
      <HeroSection movies={heroItems} onSelectMedia={onSelectMedia} />
      <div className="mb-8 md:mb-12">
        <PageSearchBar 
          onSelectMedia={onSelectMedia} 
          placeholder={t("nav.search", "Search for movies, TV shows...")}
          defaultLocalSearch={setSearchTerm}
        />
      </div>

      {getSeoDescription() && (
        <div className="mb-8 p-5 md:p-6 bg-[#0a0a0a] border-l-4 border-l-brand-600 rounded-r-xl shadow-lg border-y border-r border-y-[#1a2700] border-r-[#1a2700]">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
            {(selectedLanguage !== "All" ? languages.find(l => l.id === selectedLanguage)?.name : "")} {(genre !== "All" ? genres.find(g => g.id === genre)?.name : "")} ටෙලි නාට්‍ය සිංහලෙන්
          </h1>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-4xl">
            {getSeoDescription()}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => {
              if (lang.id === "All") {
                navigate.push("/tv-series");
              } else {
                navigate.push(`/category/${lang.id.toLowerCase()}-tv-shows`);
              }
            }}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
              selectedLanguage === lang.id
                ? "bg-brand-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                : "bg-[#161616] text-gray-400 hover:text-white border border-[#1a2700] hover:border-gray-700"
            }`}
          >
            {lang.name}
          </button>
        ))}
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
          <span className="text-[11px] font-bold text-gray-500 tracking-wider">
            ALL
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
          <span className="text-[11px] font-bold text-gray-500 tracking-wider">
            GENRE
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
          <span className="text-[11px] font-bold text-gray-500 tracking-wider">
            BY YEAR
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
          <span className="text-[11px] font-bold text-gray-500 tracking-wider">
            IMDB RATING
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
          <span className="text-[11px] font-bold text-gray-500 tracking-wider">
            NETWORK
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

      {!isLoading && latestEpisodesShows.length > 0 && currentPage === 1 && (
        <div className="mb-12">
          <SectionHeader title="Latest Episodes" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10">
            {latestEpisodesShows.map((tv, index) => (
              <div
                key={`latest-ep-${tv.id}`}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MovieCard
                  item={tv}
                  onClick={() => onSelectMedia(tv)}
                  priority={index < 12}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <SectionHeader title="Latest TV Series" />

      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10">
          {currentItems.length > 0 ? (
            currentItems.map((tv, index) => (
              <div
                key={tv.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MovieCard
                  item={tv}
                  onClick={() => onSelectMedia(tv)}
                  priority={index < 12}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full flex justify-center py-20 text-gray-500">
              No TV series match the selected filters.
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

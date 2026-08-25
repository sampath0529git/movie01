"use client";
import { useRouter } from 'next/navigation';
import SectionHeader from "../components/SectionHeader";
import MovieCard from "../components/MovieCard";
import HeroCarousel from "../components/HeroCarousel";
import { MediaItem } from "../types";
import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PageSearchBar from "../components/PageSearchBar";
import { ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import SEO from "../components/SEO";
import Pagination from "../components/Pagination";
import SkeletonGrid from "../components/SkeletonGrid";

interface MoviesViewProps {
  onSelectMedia: (item: MediaItem) => void;
  customMedia?: MediaItem[];
  isLoading?: boolean;
  defaultLanguage?: string;
  defaultGenre?: string;
  hasMore?: boolean;
  loadMore?: () => void;
}

const genres = [
  { id: "All", name: "All" },
  { id: "Action", name: "ක්‍රියාදාම" },
  { id: "Crime", name: "අපරාධ" },
  { id: "Mystery", name: "අභිරහස්" },
  { id: "Romance", name: "ආදර කතා" },
  { id: "Animation", name: "ඇනිමේෂන්" },
  { id: "History", name: "ඉතිහාස" },
  { id: "Sports", name: "ක්‍රීඩා" },
  { id: "Thriller", name: "ත්‍රාසජනක" },
  { id: "Drama", name: "නාට්‍යමය" },
  { id: "Horror", name: "භයානක" },
  { id: "Fantasy", name: "මනස්කල්පිත" },
  { id: "Documentary", name: "වාර්තාමය" },
  { id: "Sci-Fi", name: "විද්‍යා ප්‍රබන්ධ" },
  { id: "Comedy", name: "හාස්‍යජනක" },
  { id: "Ghost", name: "හොල්මන්" }
];
const qualities = ["All", "HD", "CAM"];
const sortOptions = ["Default", "Title", "Rating", "Year"];

const selectClassName = "w-full bg-[#161616] border border-[#1a2700] rounded-md px-4 py-2.5 text-sm text-gray-300 font-medium hover:bg-[#0d1400] focus:outline-none appearance-none cursor-pointer";


export default function MoviesView({
  onSelectMedia,
  customMedia = [],
  isLoading,
  defaultLanguage = "All",
  defaultGenre = "All",
  hasMore,
  loadMore
}: MoviesViewProps) {
  const navigate = useRouter();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState(defaultGenre);
  const [quality, setQuality] = useState("All");
  const [sortBy, setSortBy] = useState("Default");
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);

  useEffect(() => {
    setGenre(defaultGenre);
  }, [defaultGenre]);

  useEffect(() => {
    setSelectedLanguage(defaultLanguage);
  }, [defaultLanguage]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };
  
  const [itemsPerPage, setItemsPerPage] = useState((typeof window !== 'undefined' ? window.innerWidth : 1024) < 768 ? 8 : 18);

  useEffect(() => {
    const handleResize = () => setItemsPerPage((typeof window !== 'undefined' ? window.innerWidth : 1024) < 768 ? 8 : 18);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const combinedMovies = [...customMedia.filter((m) => m.type === "MOVIE")];
  
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
    { id: "Sinhala", name: "Sinhala" },
  ];

  const filteredMovies = useMemo(() => {
    let result = combinedMovies.filter(m => 
      m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (genre !== "All") {
      result = result.filter(m => {
        const itemGenres = m.genres && m.genres.length > 0 
          ? m.genres 
          : (m.genre ? m.genre.split(',').map(g => g.trim()) : []);
        return itemGenres.includes(genre);
      });
    }

    if (selectedLanguage !== "All") {
      result = result.filter(m => 
        (m.language?.toLowerCase() === selectedLanguage.toLowerCase()) ||
        (m.description?.toLowerCase().includes(selectedLanguage.toLowerCase())) ||
        (m.title?.toLowerCase().includes(selectedLanguage.toLowerCase()))
      );
    }

    if (quality !== "All") {
      result = result.filter(m => m.quality === quality);
    }

    if (sortBy === "Title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "Rating") {
      result.sort((a, b) => parseFloat(String(b.rating || "0")) - parseFloat(String(a.rating || "0")));
    } else if (sortBy === "Year") {
      result.sort((a, b) => {
        const yearA = parseInt(String(a.year || "0")) || 0;
        const yearB = parseInt(String(b.year || "0")) || 0;
        return yearB - yearA;
      });
    }

    return result;
  }, [combinedMovies, searchTerm, genre, quality, sortBy, selectedLanguage]);

  // Reset pagination on filter change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, genre, quality, sortBy, selectedLanguage]);

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const currentItems = filteredMovies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Use featured movies or trending for hero slider, fallback to top 10
  let heroItems = combinedMovies.filter((m) => m.featured || m.trending);
  if (heroItems.length < 4) {
    const additional = combinedMovies.filter(m => !heroItems.includes(m)).slice(0, 10 - heroItems.length);
    heroItems = [...heroItems, ...additional];
  } else {
    heroItems = heroItems.slice(0, 10);
  }

  // Map bannerUrl to heroUrl for the carousel
  const carouselItems = heroItems.map((item) => ({
    ...item,
    heroUrl:
      item.bannerUrl || `https://picsum.photos/seed/hero${item.id}/1200/500`,
  }));
  
  const leftItems = carouselItems.filter((_, i) => i % 2 === 0);
  const rightItems = carouselItems.filter((_, i) => i % 2 === 1);

  let seoTitle = "Latest Movies Sinhala Subtitle | Watch Online | MovieVibe";
  let seoDescription = "අලුත්ම චිත්‍රපට සිංහල උපසිරැසි සහිතව. Watch the latest action, marvel, tamil and hindi movies with sinhala subtitles online for free. Download movies in 1080p/720p HD.";

  if (sortBy === "Rating") {
    seoTitle = "Top Rated Movies IMDb Sinhala Subtitle | Best Movies Collection";
    seoDescription = "Watch top rated IMDb movies with Sinhala subtitles. Best collection of high quality movies and TV series.";
  } else if (genre !== "All") {
    seoTitle = `${genre} Movies Sinhala Subtitle | Watch Online Free HD`;
    seoDescription = `Watch best ${genre} movies with Sinhala subtitles in HD quality. Free streaming with fast servers and no signup required.`;
  } else if (selectedLanguage !== "All") {
    seoTitle = `${selectedLanguage} Movies Sinhala Subtitle | Watch Free HD Online`;
    seoDescription = `Watch ${selectedLanguage} movies and TV shows with Sinhala subtitles. Free HD streaming with daily updates.`;
  }

  const getSeoDescription = () => {
    if (selectedLanguage === "All" && genre === "All") return null;

    const langName = selectedLanguage !== "All" ? languages.find(l => l.id === selectedLanguage)?.name : "";
    const genreName = genre !== "All" ? genres.find(g => g.id === genre)?.name : "";
    
    const sinhalaTitle = `${langName || ""}${langName && genreName ? " " : ""}${genreName || ""}`.trim();
    const englishTitle = `${selectedLanguage !== "All" ? selectedLanguage : ""}${selectedLanguage !== "All" && genre !== "All" ? " " : ""}${genre !== "All" ? genre : ""}`.trim();

    return `අලුත්ම ${sinhalaTitle} චිත්‍රපට (${englishTitle} Movies) සිංහල උපසිරැසි සමඟ නැරඹීමට සහ බාගත කරගැනීමට. හොඳම සහ නවතම ${sinhalaTitle} චිත්‍රපට සිංහලෙන් උපසිරැසි ගන්වා ඇති අතර, ඔබට ඉතා පහසුවෙන් මෙම චිත්‍රපට අන්තර්ජාලය හරහා නැරඹිය හැකිය. ජනප්‍රිය ${sinhalaTitle} චිත්‍රපට රැසක් අප අඩවියෙන් නොමිලේ රසවිඳින්න.`;
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full flex-grow">
      <SEO 
        title={seoTitle} 
        description={seoDescription}
        keywords={["best action movies 2026 sinhala sub", "marvel movies sinhala sub list", "hindi movies with sinhala subtitles", "tamil movies sinhala sub", "watch movies online free sri lanka", "සිංහල උපසිරැසි සමඟ චිත්‍රපට", "sinhala subtitles movies", "sinhala sub download", "aluth film sinhala sub", "download english movies with sinhala subtitles"]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 md:mb-12">
        <PageSearchBar 
          onSelectMedia={onSelectMedia} 
          placeholder={t("nav.search", "Search for movies...")}
          defaultLocalSearch={setSearchTerm}
        />
        {leftItems.length > 0 && (
          <div className="hidden md:block">
            <HeroCarousel items={leftItems} onSelectMedia={onSelectMedia} interval={7000} />
          </div>
        )}
        {rightItems.length > 0 && (
          <div className="hidden md:block">
            <HeroCarousel items={rightItems} onSelectMedia={onSelectMedia} interval={8500} />
          </div>
        )}
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

      <div className={`md:flex flex-wrap gap-4 md:gap-6 mb-10 pb-6 border-b border-[#253900] ${isFiltersOpen ? "flex" : "hidden"}`}>
        <div className="flex flex-col gap-2 min-w-[140px] flex-1 max-w-[200px]">
          <label htmlFor="genre-select" className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
            {t("discover.genre", "GENRE")}
          </label>
          <div className="relative">
            <select
              id="genre-select"
              aria-label={t("discover.genre", "GENRE")}
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={selectClassName}
            >
              {genres.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px] flex-1 max-w-[200px]">
          <label htmlFor="quality-select" className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
            {t("discover.quality", "QUALITY")}
          </label>
          <div className="relative">
            <select
              id="quality-select"
              aria-label={t("discover.quality", "QUALITY")}
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className={selectClassName}
            >
              {qualities.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px] flex-1 max-w-[200px]">
          <label htmlFor="sort-select" className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
            {t("discover.sort", "SORT BY")}
          </label>
          <div className="relative">
            <select
              id="sort-select"
              aria-label={t("discover.sort", "SORT BY")}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={selectClassName}
            >
              {sortOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </div>

      {getSeoDescription() && (
        <div className="mb-8 p-5 md:p-6 bg-[#0a0a0a] border-l-4 border-l-brand-600 rounded-r-xl shadow-lg border-y border-r border-y-[#1a2700] border-r-[#1a2700]">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
            {(selectedLanguage !== "All" ? languages.find(l => l.id === selectedLanguage)?.name : "")} {(genre !== "All" ? genres.find(g => g.id === genre)?.name : "")} චිත්‍රපට සිංහලෙන්
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
                navigate.push("/movies");
              } else {
                navigate.push(`/category/${lang.id.toLowerCase()}-movies`);
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

      <SectionHeader title={t("movies.latest", "Latest Movies")} />

      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10" role="list" aria-label="Movies list">
          {currentItems.length > 0 ? (
            currentItems.map((movie, index) => (
              <div key={movie.id} role="listitem">
                <MovieCard
                  item={movie}
                  onClick={() => onSelectMedia(movie)}
                  priority={index < 12}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full flex justify-center py-20 text-gray-500" role="status" aria-live="polite">
              {t("movies.no_match", "No movies match the selected filters.")}
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

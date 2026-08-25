"use client";
import { useRouter } from 'next/navigation';
import { ViewState, MediaItem } from '../types';
import { Search, Star, TrendingUp, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MovieCard from '../components/MovieCard';
import { LogoImage } from '../components/LogoImage';
import SEO from '../components/SEO';
import SkeletonGrid from '../components/SkeletonGrid';

interface HomeViewProps {
  setCurrentView: (view: ViewState) => void;
  onSelectMedia: (item: MediaItem) => void;
  customMedia?: MediaItem[];
  isLoading?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
}

export default function HomeView({ setCurrentView, onSelectMedia, customMedia, isLoading, hasMore, loadMore }: HomeViewProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [apiResults, setApiResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const trendingSearches = [
    "Inception",
    "Breaking Bad",
    "Avengers",
    "Stranger Things",
  ];

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const navigate = useRouter();

  const handleSearchCommit = (query: string) => {
    if (!query.trim()) return;
    const q = query.trim();
    const updatedSearches = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    navigate.push(`/discover?q=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const trendingMedia = customMedia 
    ? [...customMedia].sort((a, b) => parseFloat(String(b.rating) || '0') - parseFloat(String(a.rating) || '0')).slice(0, 15) 
    : [];

  useEffect(() => {
    if (debouncedQuery.trim().length >= 3) {
      setIsSearching(true);
      try {
        if (customMedia) {
          const queryLower = debouncedQuery.toLowerCase();
          const results = customMedia
            .filter((item) => item.title && item.title.toLowerCase().includes(queryLower))
            .slice(0, 10);
          setApiResults(results);
        } else {
          setApiResults([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setApiResults([]);
    }
  }, [debouncedQuery, customMedia]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const HighlightMatch = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim() || highlight.length < 3) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? <span key={i} className="text-brand-500 bg-brand-500/10 rounded px-0.5">{part}</span> : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 bg-[#000000] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <SEO 
        title="Watch Free Movies & TV Shows Online in HD with Sinhala Subtitles" 
        description="Stream free movies and TV shows online with Sinhala subtitles. No registration required. Enjoy HD quality content updated daily."
        keywords={["Sinhala subtitles", "Sinhala sub", "movies sinhala subtitle", "Sinhala sub movies", "download movies sinhala subtitles", "movievibe", "සිංහල උපසිරැසි", "free movies online Sri Lanka", "watch TV shows free HD", "Korean dramas Sinhala subtitles"]}
      />
      <div className="flex items-center gap-3 mb-6 sm:mb-8 scale-[1.2] sm:scale-[1.3] drop-shadow-[0_0_15px_rgba(57,255,20,0.2)]">
        <LogoImage className="w-12 h-12 drop-shadow-lg" />
        <div className="flex items-center gap-0">
          <span className="text-[#39FF14] font-black text-4xl sm:text-5xl tracking-tighter">Movie</span>
          <span className="text-white font-black text-4xl sm:text-5xl tracking-tighter">Vibe</span>
        </div>
      </div>

      <h1 className="text-[18px] sm:text-3xl md:text-4xl font-bold text-white mt-4 mb-2 text-center drop-shadow-lg px-2 sm:px-4 leading-tight">
        Free Movies & TV Shows with Sinhala Subtitles
      </h1>
      <p className="text-gray-400 mb-10 text-center text-[13px] sm:text-base md:text-lg px-6 max-w-2xl leading-normal sm:leading-relaxed">
        {t("home.hero_subtitle", "Daily Updated English, Korean, Tamil & TV Series with Sinhala Subtitles.")}
      </p>

      <div className="flex w-full max-w-3xl gap-4 mb-6 relative group" ref={searchRef}>
        <div className="flex-grow relative">
          <input 
            type="text" 
            placeholder={t("nav.search", "Search for movies, TV shows...")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (selectedIndex >= 0 && selectedIndex < apiResults.length) {
                  onSelectMedia(apiResults[selectedIndex]);
                  handleSearchCommit(searchQuery);
                  setIsSearchOpen(false);
                  setSearchQuery("");
                } else {
                  handleSearchCommit(searchQuery);
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, apiResults.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, -1));
              }
            }}
            className={`w-full bg-[#0d1400] shadow-[0_8px_30px_rgb(0,0,0,0.5)] border text-white rounded-full px-6 py-4 focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] focus:scale-[1.02] ${isSearchOpen && searchQuery ? 'border-gray-500' : 'border-[#1a2700] group-hover:border-gray-600'}`}
          />
          
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-[#0d1400] border border-[#1a2700] rounded-xl shadow-2xl overflow-hidden z-50 text-left">
              <div className="p-4">
                {searchQuery.trim().length >= 3 ? (
                  <>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
                      Search Results for "{searchQuery}"
                    </h3>
                    {isSearching ? (
                      <div className="text-center py-8 text-gray-500 text-sm flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                        Searching...
                      </div>
                    ) : apiResults.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {apiResults.map((item, index) => (
                          <div
                            key={item.id}
                            className={`group cursor-pointer flex flex-col gap-2 p-2 rounded-lg transition-colors ${selectedIndex === index ? "bg-[#385600] border border-gray-600" : "hover:bg-[#253900] border border-transparent"}`}
                            onClick={() => {
                              handleSearchCommit(searchQuery);
                              onSelectMedia(item);
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <div className="relative aspect-[2/3] overflow-hidden rounded bg-[#253900]">
                              <img
                                src={item.imageUrl}
                                alt={`${item.title} Sinhala sub`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                              <div className="absolute top-1 left-1 bg-[#0d1400]/95 text-white text-[9px] px-1 py-0.5 rounded flex items-center gap-1 font-bold border border-[#385600]">
                                <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />{" "}
                                {item.rating}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white truncate">
                                <HighlightMatch text={item.title} highlight={debouncedQuery} />
                              </h4>
                              <div className="flex gap-1 mt-1 justify-between flex-wrap items-center">
                                <span className={`text-[8px] font-bold px-1 py-0.5 rounded-sm ${item.type === "MOVIE" ? "bg-yellow-600/20 text-yellow-500" : "bg-brand-700/20 text-brand-500"}`}>
                                  {item.type}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {item.year}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </>
                ) : searchQuery.trim().length > 0 && searchQuery.trim().length < 3 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Type at least 3 characters to search...
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-6 relative">
                    {recentSearches.length > 0 && (
                      <div className="sm:flex-1 flex flex-col gap-2 sm:border-r border-[#385600] sm:pr-4">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                          {t("nav.recent_searches", "Recent Searches")}
                        </h3>
                        {recentSearches.map((query, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-[#253900] rounded-lg cursor-pointer text-sm text-white transition-colors"
                            onClick={() => {
                              setSearchQuery(query);
                              setIsSearchOpen(true);
                            }}
                          >
                            <Search className="w-4 h-4 text-gray-500" />
                            {query}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="sm:flex-1 flex flex-col gap-2 pl-2">
                      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand-500" /> {t("nav.trending_searches", "Trending in")} {
                          (function() {
                            const code = i18n.language.toUpperCase();
                            const europe = ["GB", "DE", "FR", "ES", "IT", "PT", "NL", "SE"];
                            if (europe.includes(code)) return "Europe";
                            if (code === "US") return "US";
                            if (code === "LK") return "Sri Lanka";
                            try {
                              return new Intl.DisplayNames([i18n.language], { type: 'region' }).of(i18n.language) || code;
                            } catch {
                              return code;
                            }
                          })()
                        }
                      </h3>
                      {trendingSearches.map((query, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-[#253900] rounded-lg cursor-pointer text-sm text-gray-300 hover:text-white transition-colors"
                          onClick={() => {
                            setSearchQuery(query);
                            setIsSearchOpen(true);
                          }}
                        >
                          {query}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={() => handleSearchCommit(searchQuery)}
          className="hidden sm:block bg-brand-600 hover:bg-brand-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] text-white font-semibold rounded-full px-8 py-4 transition-all duration-300 hover:scale-[1.05]"
        >
          {t("home.search_button", "Search")}
        </button>
      </div>

      {isLoading ? (
        <div className="w-full max-w-7xl mx-auto mt-12 mb-8 overflow-hidden">
          <div className="flex items-center mb-4 px-2">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
              <TrendingUp className="text-brand-500 w-6 h-6" />
              {t("home.trending_now", "Trending Now")}
            </h2>
          </div>
          <div className="relative w-full">
            <div className="flex gap-3 md:gap-4 px-2 pb-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[120px] sm:w-[160px] md:w-[200px] lg:w-[220px] shrink-0">
                  <div className="w-full aspect-[2/3] rounded-xl bg-gray-900/50 animate-pulse border border-gray-800"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : trendingMedia.length > 0 ? (
        <div className="w-full max-w-7xl mx-auto mt-12 mb-8 overflow-hidden pause-marquee">
          <div className="flex items-center mb-4 px-2">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
              <TrendingUp className="text-brand-500 w-6 h-6" />
              {t("home.trending_now", "Trending Now")}
            </h2>
          </div>
          
          <div className="relative w-full">
            <div className="flex w-max animate-marquee gap-3 md:gap-4 px-2 pb-4">
              {[...trendingMedia, ...trendingMedia].map((media, index) => (
                <div key={`${media.id}-${index}`} className="w-[120px] sm:w-[160px] md:w-[200px] lg:w-[220px] shrink-0">
                  <MovieCard item={media} onClick={() => onSelectMedia(media)} priority={index < 5} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <button 
        onClick={() => setCurrentView('discover')}
        className="w-full max-w-3xl bg-brand-700/10 hover:bg-brand-700/20 text-brand-500 border border-brand-800/40 hover:border-brand-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] rounded-lg py-5 flex items-center justify-center gap-3 font-medium transition-all duration-300 hover:scale-[1.02] mt-4"
      >
        <span className="border border-brand-500 rounded p-1">
           <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        </span>
        {t("home.browse_all", "Browse All Content")}
      </button>

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

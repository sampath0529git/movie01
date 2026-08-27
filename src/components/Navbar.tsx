"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Star,
  LogOut,
  User as UserIcon,
  TrendingUp,
  Menu,
  X,
  Home,
  Crown,
  Sparkles,
  Compass,
  Film,
  Tv,
  LayoutGrid,
  Shield,
  Layers,
  Video,
  Globe,
  Folder,
  Calendar,
  Users
} from "lucide-react";
import { ViewState, MediaItem } from "../types";
import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { User } from "firebase/auth";
import { auth } from "../firebase";
import { useTranslation } from "react-i18next";
import { supabase, snakeToCamel } from "../supabase";

interface NavbarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  onLoginClick: () => void;
  onSelectMedia: (item: MediaItem) => void;
  customMedia?: MediaItem[];
  isAdmin?: boolean;
  user?: User | null;
}

import { LogoImage } from "./LogoImage";

const EMPTY_MEDIA: MediaItem[] = [];

export default function Navbar({
  currentView,
  setCurrentView,
  onLoginClick,
  onSelectMedia,
  customMedia = EMPTY_MEDIA,
  isAdmin = false,
  user = null,
}: NavbarProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [apiResults, setApiResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true);

  // Trending dummy data for empty state
  const trendingSearches = [
    "Inception",
    "Breaking Bad",
    "Avengers",
    "Stranger Things",
  ];

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        if ((typeof window !== 'undefined' ? window.innerWidth : 1024) >= 768) {
          setIsSearchOpen(true);
          // Small delay to ensure state update before focusing
          setTimeout(() => {
             searchInputRef.current?.focus();
          }, 0);
        } else {
          setIsMobileSearchOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        // ignore JSON parse error
      }
    }
  }, []);

  useEffect(() => {
    let lastScrollY = (typeof window !== 'undefined' ? window.scrollY : 0);

    const handleScroll = () => {
      const currentScrollY = (typeof window !== 'undefined' ? window.scrollY : 0);
      
      if (currentScrollY <= 0) {
        setIsMobileNavVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY + 5) {
        setIsMobileNavVisible(false);
        lastScrollY = currentScrollY;
      } else if (currentScrollY < lastScrollY - 10) {
        setIsMobileNavVisible(true);
        lastScrollY = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = useRouter();

  const handleSearchCommit = (query: string) => {
    if (!query.trim()) return;
    const q = query.trim();
    const updatedSearches = [q, ...recentSearches.filter((s) => s !== q)].slice(
      0,
      5,
    );
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    navigate.push(`/discover?q=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    if (debouncedQuery.trim().length >= 3) {
      setIsSearching(true);
      const fetchResults = async () => {
        try {
          const { data, error } = await supabase
            .from('media')
            .select('*')
            .ilike('title', `%${debouncedQuery.trim()}%`)
            .order('created_at', { ascending: false })
            .limit(10);
            
          if (error) {
            console.error(error);
          } else if (isActive) {
            setApiResults(snakeToCamel(data) || []);
          }
        } catch (error) {
          console.error(error);
        } finally {
          if (isActive) setIsSearching(false);
        }
      };
      fetchResults();
    } else {
      setApiResults([]);
      setIsSearching(false);
    }

    return () => {
      isActive = false;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedIndex >= 0) {
      const el = document.getElementById(`search-result-${selectedIndex}`);
      if (el) {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const searchResults = apiResults;

  const HighlightMatch = ({
    text,
    highlight,
  }: {
    text: string;
    highlight: string;
  }) => {
    if (!highlight.trim() || highlight.length < 3) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="text-brand-500 bg-brand-500/10 rounded px-0.5">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </span>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems: { label: string; view: ViewState | "watchlist" | "collections" | "cast-collections"; icon: any }[] = [
    { label: t("nav.home", "Home"), view: "home", icon: Home },
    { label: t("nav.discover", "Discover"), view: "discover", icon: Compass },
    { label: t("nav.movies", "Movies"), view: "movies", icon: Film },
    { label: t("nav.tv_series", "TV Series"), view: "tv-series", icon: Tv },
    { label: "Collections", view: "collections", icon: Layers },
    { label: "Cast", view: "cast-collections", icon: Users },
    { label: "Watchlist", view: "watchlist", icon: Star },
  ];

  if (isAdmin) {
    navItems.push({ label: t("nav.admin", "Admin"), view: "admin", icon: Shield });
  }

  return (
    <>
    <nav className="flex items-center justify-between px-3 md:px-6 py-4 bg-[#000000]/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-[#0c1200] gap-2 lg:gap-4">
      <div className="flex items-center gap-3 lg:gap-4 xl:gap-8 w-[110px] sm:w-auto overflow-hidden">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
        >
          <LogoImage className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
          <div className="flex items-center gap-0">
            <span className="text-[#39FF14] font-black text-lg sm:text-xl md:text-2xl tracking-tighter">
              Movie
            </span>
            <span className="text-white font-black text-lg sm:text-xl md:text-2xl tracking-tighter">
              Zen
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-3 xl:gap-6 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.view}
              href={item.view === 'home' ? '/' : `/${item.view}`}
              className={`relative font-medium transition-colors hover:text-white whitespace-nowrap shrink-0 overflow-hidden group ${
                currentView === item.view ? "text-white" : "text-gray-400"
              }`}
            >
              {item.label}
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-brand-600 transition-transform duration-300 origin-left ${currentView === item.view ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 justify-end shrink-0">
        <button
          className="md:hidden text-gray-400 hover:text-white shrink-0 hover:bg-[#253900] p-1.5 rounded-md transition-colors"
          onClick={() => setIsMobileSearchOpen(true)}
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          className="lg:hidden text-white shrink-0 hover:bg-[#253900] p-1 rounded-md transition-colors hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        <div className="relative hidden md:flex shrink-0" ref={searchRef}>
          <div
            className={`flex items-center bg-[#0d1400] rounded-full px-2 sm:px-3 py-1.5 border focus-within:border-gray-500 transition-colors ${isSearchOpen && searchQuery ? "border-gray-500" : "border-[#1a2700]"}`}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("nav.search_short", "Search... (Press '/')")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (
                    selectedIndex >= 0 &&
                    selectedIndex < searchResults.length
                  ) {
                    const item = searchResults[selectedIndex];
                    handleSearchCommit(searchQuery);
                    onSelectMedia(item);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  } else {
                    handleSearchCommit(searchQuery);
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedIndex((prev) =>
                    Math.min(prev + 1, searchResults.length - 1),
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedIndex((prev) => Math.max(prev - 1, -1));
                }
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-28 lg:w-36 xl:w-48 placeholder:text-sm"
            />
            {isSearching && (
              <div className="mx-1 shrink-0">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <button
              onClick={() => handleSearchCommit(searchQuery)}
              className="bg-brand-700 hover:bg-brand-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full ml-1 transition-colors hidden sm:block shrink-0"
            >
              Search
            </button>
            <button
              onClick={() => handleSearchCommit(searchQuery)}
              className="sm:hidden text-gray-400 hover:text-white mr-1 shrink-0"
            >
              <Search className="w-4 h-4 ml-1" />
            </button>
          </div>

          {isSearchOpen && (
            <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 w-[300px] sm:w-[500px] max-w-[calc(100vw-24px)] md:max-w-[90vw] bg-[#0d1400] border border-[#1a2700] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 pb-24 max-h-[70vh] overflow-y-auto" id="search-results-container">
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
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {searchResults.map((item, index) => (
                          <div
                            key={item.id}
                            id={`search-result-${index}`}
                            className={`group cursor-pointer flex flex-col gap-2 p-2 rounded-lg transition-colors ${selectedIndex === index ? "bg-[#385600] border border-gray-600 ring-2 ring-brand-500" : "hover:bg-[#253900] border border-transparent"}`}
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
                                alt={`${item.title} Watch Online`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute top-1 left-1 bg-[#0d1400]/95 text-white text-[9px] px-1 py-0.5 rounded flex items-center gap-1 font-bold border border-[#385600]">
                                <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />{" "}
                                {item.rating}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white truncate">
                                <HighlightMatch
                                  text={item.title}
                                  highlight={debouncedQuery}
                                />
                              </h4>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`text-[8px] font-bold px-1 py-0.5 rounded-sm ${item.type === "MOVIE" ? "bg-yellow-600/20 text-yellow-500" : "bg-brand-700/20 text-brand-500"}`}
                                >
                                  {item.type}
                                </span>
                                {item.quality && (
                                  <span className="text-[8px] font-bold px-1 py-0.5 rounded-sm bg-gray-700 text-white">
                                    {item.quality}
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-400 ml-auto">
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
                ) : searchQuery.trim().length > 0 &&
                  searchQuery.trim().length < 3 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Type at least 3 characters to search...
                  </div>
                ) : (
                   <div className="flex gap-6 relative">
                    {recentSearches.length > 0 && (
                      <div className="flex-1 flex flex-col gap-2 border-r border-[#385600] pr-4">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                          {t("nav.recent_searches", "Recent Searches")}
                        </h3>
                        {recentSearches.map((query, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-[#253900] rounded-lg cursor-pointer text-sm text-white transition-colors"
                            onClick={() => setSearchQuery(query)}
                          >
                            <Search className="w-4 h-4 text-gray-500" />
                            {query}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex-1 flex flex-col gap-2 pl-2">
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
                          onClick={() => setSearchQuery(query)}
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

        <div className="relative shrink-0 flex items-center gap-2">
          <div className="flex items-center bg-[#0d1400] border border-[#1a2700] p-1.5 rounded-md transition-colors">
            <img
              src="https://flagcdn.com/w40/lk.png"
              width="24"
              alt="Sri Lanka"
              className="rounded-sm object-contain"
            />
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-4 ml-1 md:ml-2">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User"
                  className="w-8 h-8 rounded-full border border-[#385600]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#253900] border border-[#385600] flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <span className="max-w-[70px] md:max-w-[100px] truncate">
                {user.displayName || user.email?.split("@")[0]}
              </span>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="bg-[#0d1400] hover:bg-[#0c1200] border border-[#1a2700] text-gray-400 hover:text-white p-2 rounded-md transition-colors"
              title={t("nav.sign_out", "Sign Out")}
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="bg-[#0d1400] hover:bg-brand-600 border border-[#1a2700] hover:border-brand-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] text-white px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-base inline-flex font-semibold rounded-md transition-all duration-300 ml-1 whitespace-nowrap shrink-0 hover:scale-105"
          >
            {t("nav.sign_in", "Sign In")}
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && createPortal(
        <div className="lg:hidden fixed inset-0 z-[100] flex flex-col text-center">
          {/* Overlay background */}
          <div className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" />
          
          {/* Content */}
          <div className="relative w-full h-full flex flex-col animate-in slide-in-from-bottom-8 fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6">
              <div
                className="flex items-center gap-1 cursor-pointer shrink-0"
                onClick={() => {
                  setCurrentView("home");
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogoImage className="w-8 h-8 drop-shadow-md mr-1" />
                <div className="flex items-center gap-0">
                  <span className="text-[#39FF14] font-black text-2xl tracking-tighter">Movie</span>
                  <span className="text-white font-black text-2xl tracking-tighter">Zen</span>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors shrink-0"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Centered Scrollable Nav Links */}
            <div className="flex-1 overflow-y-auto py-8 flex flex-col justify-center items-center gap-3 px-6 pb-24">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.view}
                    href={item.view === 'home' ? '/' : `/${item.view}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full max-w-[280px] py-4 px-6 rounded-2xl font-bold transition-all duration-300 text-lg flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in fill-mode-both ${
                      currentView === item.view
                        ? "text-white bg-brand-600/20 text-brand-500 shadow-[0_0_20px_rgba(220,38,38,0.15)] border border-brand-500/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${currentView === item.view ? 'text-brand-500' : 'text-gray-500'}`} />
                    {item.label}
                  </Link>
                );
              })}

              <div className="w-[80px] h-px bg-white/10 my-6 animate-in fade-in fill-mode-both" style={{ animationDelay: `${navItems.length * 50}ms` }}></div>

              <div className="w-full max-w-[280px] mt-2 animate-in slide-in-from-bottom-4 fade-in fill-mode-both" style={{ animationDelay: `${(navItems.length + 1) * 50}ms` }}>
                {user ? (
                   <button 
                     onClick={() => { auth.signOut(); setIsMobileMenuOpen(false); }}
                     className="w-full bg-[#9b2226] hover:bg-[#801b1f] border border-red-900/50 text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                   >
                     <LogOut className="w-5 h-5" /> {t("nav.sign_out", "Sign Out")}
                   </button>
                ) : (
                   <button 
                     onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
                     className="w-full bg-brand-600 hover:bg-brand-500 border border-brand-500/50 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.2)] flex items-center justify-center gap-3"
                   >
                     <UserIcon className="w-5 h-5" />
                     {t("nav.sign_in", "Sign In")}
                   </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && createPortal(
        <div className="sm:hidden fixed inset-0 z-[110] bg-[#000000] flex flex-col animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3 p-4 border-b border-[#253900]">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder={t("nav.search", "Search for movies, TV shows...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchCommit(searchQuery);
                }
              }}
            />
            {isSearching && (
              <div className="shrink-0 mr-1">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery("");
              }}
              className="text-brand-500 hover:text-brand-400 text-sm font-semibold ml-2"
            >
              Cancel
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 pb-32 max-h-[calc(100svh-65px)] custom-scrollbar">
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
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {searchResults.map((item, index) => (
                      <div
                        key={item.id}
                        className="group cursor-pointer flex flex-col gap-2 p-2 rounded-lg transition-colors hover:bg-[#253900]"
                        onClick={() => {
                          handleSearchCommit(searchQuery);
                          onSelectMedia(item);
                          setIsMobileSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="relative aspect-[2/3] overflow-hidden rounded bg-[#253900]">
                          <img
                            src={item.imageUrl}
                            alt={`${item.title} Watch Online`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-[#0d1400]/95 text-white text-[9px] px-1 py-0.5 rounded flex items-center gap-1 font-bold border border-[#385600]">
                            <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />{" "}
                            {item.rating}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">
                            <HighlightMatch
                              text={item.title}
                              highlight={debouncedQuery}
                            />
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[8px] font-bold px-1 py-0.5 rounded-sm ${item.type === "MOVIE" ? "bg-yellow-600/20 text-yellow-500" : "bg-brand-700/20 text-brand-500"}`}>
                              {item.type}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-auto">
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
              <div className="flex flex-col gap-8">
                {recentSearches.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                      {t("nav.recent_searches", "Recent Searches")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((query, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0d1400] border border-[#385600] hover:border-gray-500 hover:bg-[#253900] rounded-full cursor-pointer text-sm text-white transition-colors"
                          onClick={() => setSearchQuery(query)}
                        >
                          <Search className="w-3.5 h-3.5 text-gray-500" />
                          {query}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col gap-3">
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
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
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((query, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-4 py-2 bg-[#253900] text-gray-300 hover:text-white hover:bg-[#385600] rounded-full cursor-pointer text-sm transition-colors"
                        onClick={() => setSearchQuery(query)}
                      >
                        {query}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </nav>

      {/* Mobile Bottom Navigation Bar */}
        <nav 
        className={`lg:hidden fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] bg-[#0d100c]/90 backdrop-blur-xl border border-white/5 shadow-[0_16px_32px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.02)] rounded-full z-50 flex items-center justify-between px-2 py-2 transition-all duration-500 hover:border-white/10 ${
          isMobileNavVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view && !isMobileMenuOpen;
          return (
            <Link
              key={item.view}
              href={item.view === 'home' ? '/' : `/${item.view}`}
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
              className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 flex-1 h-[56px] z-10 outline-none group`}
            >
              <div className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center ${isActive ? '-translate-y-1.5' : 'translate-y-0'}`}>
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${isActive ? "text-brand-500" : "text-gray-400 group-hover:text-gray-300"}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-black tracking-widest transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full text-center absolute bottom-1 ${isActive ? 'text-brand-500 opacity-100 translate-y-0 scale-100' : 'text-gray-500 opacity-0 translate-y-4 scale-75'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 flex-1 h-[56px] z-10 outline-none group`}
        >
          <div className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center ${isMobileMenuOpen ? '-translate-y-1.5' : 'translate-y-0'}`}>
            {user && user.photoURL ? (
              <img src={user.photoURL} className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all duration-300 ${isMobileMenuOpen ? "border-brand-500" : "border-transparent opacity-70 group-hover:opacity-100 object-cover"}`} alt="Menu" />
            ) : (
              <Menu className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${isMobileMenuOpen ? "text-brand-500" : "text-gray-400 group-hover:text-gray-300"}`} strokeWidth={isMobileMenuOpen ? 2.5 : 2} />
            )}
          </div>
          <span className={`text-[10px] font-black tracking-widest transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full text-center absolute bottom-1 ${isMobileMenuOpen ? 'text-brand-500 opacity-100 translate-y-0 scale-100' : 'text-gray-500 opacity-0 translate-y-4 scale-75'}`}>
            {t("nav.menu", "Menu")}
          </span>
        </button>
      </nav>
    </>
  );
}

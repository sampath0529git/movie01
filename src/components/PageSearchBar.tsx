"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Star } from "lucide-react";
import { MediaItem } from "../types";
import { useTranslation } from "react-i18next";

interface PageSearchBarProps {
  onSelectMedia: (item: MediaItem) => void;
  placeholder?: string;
  defaultLocalSearch?: (query: string) => void;
  className?: string;
}

export default function PageSearchBar({ onSelectMedia, placeholder, defaultLocalSearch, className }: PageSearchBarProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [apiResults, setApiResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Also trigger local search if provided
    if (defaultLocalSearch) {
      defaultLocalSearch(searchQuery);
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, defaultLocalSearch]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 3) {
      setIsSearching(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          setApiResults(data.results || []);
          setIsSearchOpen(true);
        })
        .catch(console.error)
        .finally(() => setIsSearching(false));
    } else {
      setApiResults([]);
    }
  }, [debouncedQuery]);

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
          regex.test(part) ? (
            <span key={i} className="text-brand-500 bg-brand-500/10 rounded px-0.5">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className={className || "w-full relative mb-6 md:hidden"} ref={searchRef}>
      <input
        type="text"
        placeholder={placeholder || t("nav.search", "Search...")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => {
          if (searchQuery.trim().length >= 3) setIsSearchOpen(true);
        }}
        className={`w-full bg-[#0d1400] border text-white rounded-full px-5 py-3 focus:outline-none transition-colors ${
          isSearchOpen && searchQuery.trim().length >= 3 ? "border-gray-500" : "border-[#385600] focus:border-brand-500"
        }`}
      />
      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors">
        <Search className="w-5 h-5" />
      </button>

      {isSearchOpen && searchQuery.trim().length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1400] border border-[#1a2700] rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Search Results
            </h3>
            {isSearching ? (
              <div className="text-center py-8 text-gray-500 text-sm flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </div>
            ) : apiResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {apiResults.map((item, index) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer flex flex-col gap-2 p-2 rounded-lg transition-colors hover:bg-[#253900] border border-transparent"
                    onClick={() => {
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
                      <div className="flex items-center gap-1 mt-1 justify-between">
                        <span className={`text-[8px] font-bold px-1 py-0.5 rounded-sm ${item.type === "MOVIE" ? "bg-yellow-600/20 text-yellow-500" : "bg-brand-700/20 text-brand-500"}`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {item.year || "-"}
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
          </div>
        </div>
      )}
    </div>
  );
}

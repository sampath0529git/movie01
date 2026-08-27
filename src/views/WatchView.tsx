"use client";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { MediaItem } from "../types";
import {
  Play,
  Flag,
  X as CloseIcon,
  ChevronLeft,
  Plus,
  MessageCircle,
  Send,
  Check,
  Share2,
  Facebook,
  ArrowUpDown,
  ArrowDown,
  Download,
} from "lucide-react";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { saveToWatchlist, saveReport } from "../firebase";
import { supabase, snakeToCamel } from "../supabase";
const CustomVideoPlayer = React.lazy(() => import("../components/CustomVideoPlayer"));
import VideoPlayerErrorBoundary from "../components/VideoPlayerErrorBoundary";
import SEO from "../components/SEO";
import toast from "react-hot-toast";
import ShareModal from "../components/ShareModal";
import MovieCard from "../components/MovieCard";
import { ChevronDown } from "lucide-react";
import { useWatchlist } from "../hooks/useWatchlist";

interface WatchViewProps {
  item: MediaItem | null;
  onBack: () => void;
  onSelectMedia?: (item: MediaItem) => void;
}

import CastMember from "../components/CastMember";
import Breadcrumbs from "../components/Breadcrumbs";

export default function WatchView({ item: propItem, onBack, onSelectMedia }: WatchViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const [item, setItem] = useState<MediaItem | null>(propItem);
  const [loading, setLoading] = useState(!propItem);
  const [monetagUrl, setMonetagUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'system').single();
        if (data && data.monetag_direct_link) {
          setMonetagUrl(data.monetag_direct_link);
        }
      } catch (err) {
        console.error("Monetization config error:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (propItem) {
      setItem(propItem);
      setLoading(false);
    } else if (id) {
      // Fetch from API or Firestore
      setLoading(true);
      const fetchItem = async () => {
        try {
          let matchedItem = null;
          
          if (id && id.length === 36) { // Supabase UUID
            const { data, error } = await supabase.from('media').select('*').eq('id', id).single();
            if (data && !error) {
              matchedItem = snakeToCamel(data);
            }
          }
          
          if (!matchedItem && id) {
            // Try fetching by slug exactly
            const { data: slugData } = await supabase.from('media').select('*').eq('slug', id).limit(1);
            if (slugData && slugData.length > 0) {
              matchedItem = snakeToCamel(slugData[0]);
            } else {
              // Try matching without "-watch-online" or "-watch-free" if the URL has it
              let alternateSlug = id;
              if (id.endsWith('-watch-online')) {
                alternateSlug = id.replace('-watch-online', '-watch-free');
              } else if (id.endsWith('-watch-free')) {
                alternateSlug = id.replace('-watch-free', '-watch-online');
              }
              
              const { data: altSlugData } = await supabase.from('media').select('*').eq('slug', alternateSlug).limit(1);
              if (altSlugData && altSlugData.length > 0) {
                matchedItem = snakeToCamel(altSlugData[0]);
              }
            }
          }

          if (matchedItem) {
            setItem(matchedItem as any);
          } else {
             console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching media:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchItem();
    }
  }, [propItem, id]);

  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const isAdded = isInWatchlist(item?.id || '');

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleAddToWatchlist = () => {
    if (item) {
      toggleWatchlist(item);
      toast.success(isAdded ? "Removed from watchlist" : "Added to watchlist!");
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const shareLinks = useMemo(() => {
    if (!item) return null;
    const url = (typeof window !== 'undefined' ? window.location.href : '');
    const title = item.title;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    };
  }, [item]);

  // For TV Shows, track selected episode
  const isSeries = item?.type === "TV";
  const defaultSeason = item?.seasons?.[0];
  const defaultEpisode = defaultSeason?.episodes?.[0];
  const [selectedSeason, setSelectedSeason] = useState(defaultSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(defaultEpisode);
  const [browsingSeasonNumber, setBrowsingSeasonNumber] = useState(defaultSeason?.seasonNumber || null);
  const [episodeSortOrder, setEpisodeSortOrder] = useState<"asc" | "desc">("asc");
  const [isPlaying, setIsPlaying] = useState(false);
  const [relatedItems, setRelatedItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (item) {
      const fetchRelated = async () => {
        try {
          // 1. Try fetching by genre and type
          const { data: snap1 } = await supabase.from('media').select('*')
            .eq('type', item.type)
            .eq('genre', item.genre || '')
            .eq('status', 'Published')
            .limit(15);
            
          let related = (snap1 || [])
            .map((doc) => snakeToCamel(doc) as MediaItem)
            .filter((i) => i.id !== item.id);
            
          // 2. If not enough, fetch more by type
          if (related.length < 5) {
            const { data: snap2 } = await supabase.from('media').select('*')
              .eq('type', item.type)
              .eq('status', 'Published')
              .limit(15);
              
            const more = (snap2 || [])
              .map((doc) => snakeToCamel(doc) as MediaItem)
              .filter((i) => i.id !== item.id);
              
            const existingIds = new Set(related.map(r => r.id));
            for (const m of more) {
              if (!existingIds.has(m.id)) {
                related.push(m);
                existingIds.add(m.id);
              }
            }
          }

          setRelatedItems(related.slice(0, 10));
        } catch (error) {
          console.error("Error fetching related items:", error);
        }
      };
      
      fetchRelated();
    }
  }, [item]);

  const plyrRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSubtitle, setLocalSubtitle] = useState<{ url: string, label: string } | null>(null);

  const [aspectRatio, setAspectRatio] = useState<"auto" | "16:9" | "21:9" | "4:3" | "stretch">("auto");
  const [subtitleSize, setSubtitleSize] = useState<"small" | "normal" | "large">("normal");
  const [subtitleColor, setSubtitleColor] = useState<"white" | "yellow" | "cyan">("white");
  const [playerMode, setPlayerMode] = useState<"auto" | "native" | "iframe">("auto");

  const extractUrl = (inputStr: string | undefined): string => {
    if (!inputStr) return "";
    return inputStr.trim();
  };

  const rawVideoUrl = extractUrl(isSeries ? selectedEpisode?.videoUrl : item?.videoUrl);
  const player2Url = extractUrl(isSeries ? selectedEpisode?.player2Url : item?.player2Url);
  const player3Url = extractUrl(isSeries ? selectedEpisode?.player3Url : item?.player3Url);
  const player3Working = isSeries ? selectedEpisode?.player3Working : item?.player3Working;
  const player4Url = extractUrl(isSeries ? selectedEpisode?.player4Url : item?.player4Url);

  const urlIsOriginalIframe = (url?: string) => {
    if (!url) return false;
    const isRawIframe = (inputStr?: string) => {
      if (!inputStr) return false;
      return inputStr.trim().toLowerCase().startsWith("<iframe");
    };
    if (url === rawVideoUrl) return isRawIframe(isSeries ? selectedEpisode?.videoUrl : item?.videoUrl);
    if (url === player2Url) return isRawIframe(isSeries ? selectedEpisode?.player2Url : item?.player2Url);
    if (url === player3Url) return isRawIframe(isSeries ? selectedEpisode?.player3Url : item?.player3Url);
    if (url === player4Url) return isRawIframe(isSeries ? selectedEpisode?.player4Url : item?.player4Url);
    return false;
  };

  const allPlayers = useMemo(() => {
    let list: {url: string, label: string, isAdFree: boolean}[] = [];
    if (rawVideoUrl && rawVideoUrl.includes(",")) {
      const parts = rawVideoUrl.split(',').map((u: string) => u.trim()).filter(Boolean);
      parts.forEach((p, idx) => {
        let label = `Server 1 Source ${idx + 1} (Ad-Free)`;
        if (p.toLowerCase().includes('1080')) label = 'Server 1 (1080p, Ad-Free)';
        else if (p.toLowerCase().includes('720')) label = 'Server 1 (720p, Ad-Free)';
        else if (p.toLowerCase().includes('480')) label = 'Server 1 (480p, Ad-Free)';
        else if (p.toLowerCase().includes('4k')) label = 'Server 1 (4K, Ad-Free)';
        list.push({ url: p, label, isAdFree: true });
      })
    } else {
      list.push({ url: rawVideoUrl || "", label: "Server 1 (Ad-Free)", isAdFree: true });
    }
    list.push({ url: player2Url || "", label: "Server 2 (Ads)", isAdFree: false });
    list.push({ url: player3Url || "", label: player3Working ? "Server 3 (Ads) ✅" : "Server 3 (Ads)", isAdFree: false });
    list.push({ url: player4Url || "", label: "Server 4 (Ads)", isAdFree: false });
    return list;
  }, [rawVideoUrl, player2Url, player3Url, player3Working, player4Url]);

  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [playingMode, setPlayingMode] = useState<"video" | "trailer">("video");

  const triggerMonetagOnClick = () => {
    if (monetagUrl) {
      try {
        const newWindow = typeof window !== 'undefined' && window.open(monetagUrl, "_blank");
        if (newWindow) {
          window.focus();
          try {
            newWindow.blur();
          } catch(e){}
        }
      } catch(e){}
    }
  };

  // Anti-Download & Security Protection
  useEffect(() => {
    // Disable right click inside the app
    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    };

    // Disable common DevTools shortcuts (F12, Ctrl+Shift+I, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
          (e.ctrlKey && e.key === 'U')
        ) {
             e.preventDefault();
             return false;
        }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('contextmenu', handleContextMenu);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setSelectedVideoIndex(0);
    setPlayingMode("video");
  }, [item, selectedEpisode]);

  const currentVideoUrl = useMemo(() => {
    let url = playingMode === "trailer" ? item?.trailerUrl : (allPlayers[selectedVideoIndex]?.url || null);
    if (url) {
      if (url.includes("youtube.com/watch?v=")) {
        url = url.replace("watch?v=", "embed/");
        const ampersandIndex = url.indexOf("&");
        if (ampersandIndex !== -1) {
          url = url.substring(0, ampersandIndex);
        }
      } else if (url.includes("youtu.be/")) {
        url = url.replace("youtu.be/", "youtube.com/embed/");
        const questionIndex = url.indexOf("?");
        if (questionIndex !== -1) {
          url = url.substring(0, questionIndex);
        }
      }
    }
    return url;
  }, [playingMode, item, allPlayers, selectedVideoIndex]);

  const subtitleVttText = playingMode === "trailer" ? null : (isSeries
    ? selectedEpisode?.subtitleVtt
    : item?.subtitleVtt);

  const [dynamicSubtitleUrl, setDynamicSubtitleUrl] = useState<string | null>(null);

  useEffect(() => {
    if (subtitleVttText) {
      const blob = new Blob([subtitleVttText], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);
      setDynamicSubtitleUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setDynamicSubtitleUrl(null);
    }
  }, [subtitleVttText]);

  const currentSubtitleUrl = useMemo(() => {
    if (playingMode === "trailer") return null;
    const base = dynamicSubtitleUrl || (isSeries ? selectedEpisode?.subtitleUrl : item?.subtitleUrl);
    if (base === "LOCAL_SUBTITLE_UPLOADED") return null;
    return base;
  }, [playingMode, dynamicSubtitleUrl, isSeries, selectedEpisode, item]);

  useEffect(() => {
    if (item) {
        setSelectedSeason(item.seasons?.[0]);
        setSelectedEpisode(item.seasons?.[0]?.episodes?.[0]);
        setBrowsingSeasonNumber(item.seasons?.[0]?.seasonNumber || null);
        setIsPlaying(false);
    }
  }, [item]);

  useEffect(() => {
    if (selectedSeason) {
      setBrowsingSeasonNumber(selectedSeason.seasonNumber);
    }
  }, [selectedSeason]);

  const handleSubtitleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let text = await file.text();
    
    // convert simple SRT to VTT if needed
    if (file.name.endsWith('.srt') || text.trim().match(/^\d+$/m)) {
      text = 'WEBVTT\n\n' + text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    }

    const blob = new Blob([text], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    
    setLocalSubtitle({ url, label: file.name });
    toast.success(`Loaded subtitle: ${file.name}`);
    
    // reset input
    e.target.value = '';
  };

  const handlePlay = () => {
    setPlayingMode("video");
    if (allPlayers.length > 0) {
      setIsPlaying(true);
    } else {
      alert("No video URL available for this item.");
    }
  };



  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) {
      alert("Please select a reason");
      return;
    }
    setIsSubmittingReport(true);
    try {
      await saveReport(item!.id, reportReason);
      alert("Report submitted successfully. We will review it shortly.");
      setIsReportModalOpen(false);
      setReportReason("");
    } catch (error: any) {
      console.error(error);
      alert("Failed to submit report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleNextEpisode = () => {
    if (!isSeries || !item?.seasons || !selectedSeason || !selectedEpisode) return;
    
    const seasonIndex = item.seasons.findIndex(s => s.seasonNumber === selectedSeason.seasonNumber);
    if (seasonIndex === -1) return;
    
    const season = item.seasons[seasonIndex];
    if (!season.episodes) return;
    const epIndex = season.episodes.findIndex(e => e.episodeNumber === selectedEpisode.episodeNumber);
    
    if (epIndex >= 0 && epIndex < season.episodes.length - 1) {
      // Next episode in current season
      const nextEp = season.episodes[epIndex + 1];
      setSelectedEpisode(nextEp);
      setIsPlaying(false);
    } else if (seasonIndex < item.seasons.length - 1) {
      // First episode of next season
      const nextSeason = item.seasons[seasonIndex + 1];
      if (nextSeason.episodes && nextSeason.episodes.length > 0) {
        const nextEp = nextSeason.episodes[0];
        setSelectedSeason(nextSeason);
        setSelectedEpisode(nextEp);
        setIsPlaying(false);
      } else {
        alert("Next season has no episodes available yet.");
      }
    } else {
      alert("You have reached the final episode!");
    }
  };

  const plyrOptions = useMemo(() => ({
    autoplay: true,
    playsinline: true,
    controls: [
      "play-large",
      "play",
      "progress",
      "current-time",
      "mute",
      "volume",
      "captions",
      "settings",
      "pip",
      "airplay",
      "fullscreen",
    ],
    settings: ["captions", "quality", "speed", "loop"],
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
  }), []);

  const plyrSource = useMemo(() => {
    return {
      type: "video" as const,
      sources: [
        {
          src: currentVideoUrl || "",
          type: currentVideoUrl?.match(/\.mkv/i) ? "video/webm" : currentVideoUrl?.match(/\.m3u8/i) ? "application/x-mpegURL" : "video/mp4",
        },
      ],
      tracks: [
        ...(currentSubtitleUrl
          ? [
              {
                kind: "captions" as const,
                label: "Sinhala",
                srcLang: "si",
                src: currentSubtitleUrl,
                default: !localSubtitle,
              },
            ]
          : []),
        ...(localSubtitle 
          ? [
              {
                kind: "captions" as const,
                label: "Sinhala (Local)",
                srcLang: "si-LK",
                src: localSubtitle.url,
                default: true,
              }
            ]
          : [])
      ],
    };
  }, [currentVideoUrl, currentSubtitleUrl, localSubtitle]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 gap-4 min-h-[50vh]">
        <h2 className="text-2xl font-bold text-white">Media Not Found</h2>
        <p className="text-gray-400">The requested movie or show could not be found.</p>
        <button onClick={() => navigate.push('/')} className="px-6 py-2 bg-brand-700 text-white font-medium rounded">Return Home</button>
      </div>
    );
  }

  // Derive Next Episode Details for Auto-Play popup
  let nextEpisodeTitle = "";
  if (isSeries && item.seasons && selectedSeason && selectedEpisode) {
    const seasonIndex = item.seasons.findIndex(s => s.seasonNumber === selectedSeason.seasonNumber);
    if (seasonIndex !== -1) {
      const season = item.seasons[seasonIndex];
      const epIndex = season.episodes?.findIndex(e => e.episodeNumber === selectedEpisode.episodeNumber) ?? -1;
      if (epIndex >= 0 && season.episodes) {
        if (epIndex < season.episodes.length - 1) {
          const nextEp = season.episodes[epIndex + 1];
          nextEpisodeTitle = `S${selectedSeason.seasonNumber} E${nextEp.episodeNumber} - ${nextEp.title}`;
        } else if (seasonIndex < item.seasons.length - 1) {
          const nextSeason = item.seasons[seasonIndex + 1];
          if (nextSeason.episodes && nextSeason.episodes.length > 0) {
            const nextEp = nextSeason.episodes[0];
            nextEpisodeTitle = `S${nextSeason.seasonNumber} E${nextEp.episodeNumber} - ${nextEp.title}`;
          }
        }
      }
    }
  }

  return (
    <>
      <SEO item={item} type={item.type === 'MOVIE' ? 'video.movie' : 'video.tv_show'} />
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={(typeof window !== 'undefined' ? window.location.href : '')} 
        title={item.title} 
      />

      <div className="px-3 py-4 sm:p-6 md:p-10 max-w-[1600px] mx-auto w-full flex-grow flex flex-col items-center">
        
        {/* Breadcrumb Navigation Schema & UI */}
        <Breadcrumbs item={item} />
        
        {/* Top filter bar */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl mb-8 gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full md:w-auto">
            <div className="relative">
              <select
                defaultValue=""
                onChange={(e) => navigate.push('/discover?genre=' + e.target.value)}
                className="bg-[#0d1400] border border-[#1a2700] rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-[#253900] appearance-none focus:outline-none cursor-pointer pr-8"
              >
                <option value="" disabled>Genres</option>
                {["Action", "Comedy", "Drama", "Romance", "Sci-Fi", "Horror", "Thriller"].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
            
            <div className="relative">
              <select
                defaultValue=""
                onChange={(e) => navigate.push('/discover?year=' + e.target.value)}
                className="bg-[#0d1400] border border-[#1a2700] rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-[#253900] appearance-none focus:outline-none cursor-pointer pr-8"
              >
                <option value="" disabled>Years</option>
                {["2026", "2025", "2024", "2019", "2005"].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
          </div>

        </div>

        <div className="w-full max-w-6xl flex flex-col gap-6">
        {/* Action bar above player */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Series Only */}
          {isSeries ? (
            <div className="flex gap-4">
              <button
                onClick={onBack}
                aria-label="Go Back"
                className="bg-brand-700/80 hover:bg-brand-700 w-10 h-10 rounded flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="text-white w-5 h-5" />
              </button>
              <button className="bg-brand-700 hover:bg-brand-600 text-white px-6 py-2 rounded font-semibold text-sm transition-colors">
                Series Home
              </button>
            </div>
          ) : <div />}
        </div>

        {/* Video Player Area */}
        <div className="w-full relative shadow-2xl rounded-xl overflow-hidden border border-[#253900] bg-black">
          {/* Hidden File Input for Subtitles */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleSubtitleUpload} 
            accept=".srt,.vtt" 
            className="hidden" 
          />

          <VideoPlayerErrorBoundary fallbackUrl={currentVideoUrl || undefined}>
            {isPlaying ? (
              currentVideoUrl ? (
                <React.Suspense fallback={<div className="w-full aspect-video flex items-center justify-center bg-black text-white/50"><div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                  <CustomVideoPlayer
                    url={currentVideoUrl}
                    playerMode={playingMode === "trailer" || urlIsOriginalIframe(currentVideoUrl) ? "iframe" : "auto"}
                    tracks={plyrSource.tracks as any}
                    options={plyrOptions}
                    aspectRatio={aspectRatio}
                    subtitleSize={subtitleSize}
                    subtitleColor={subtitleColor}
                    mediaId={item?.id}
                    title={isSeries ? `${item?.title} - S${selectedSeason?.seasonNumber}E${selectedEpisode?.episodeNumber}: ${selectedEpisode?.title || ""}` : item?.title}
                    onEnded={isSeries ? handleNextEpisode : undefined}
                    nextEpisodeTitle={nextEpisodeTitle}
                    onNextEpisode={nextEpisodeTitle ? handleNextEpisode : undefined}
                    item={item}
                    seasonNumber={selectedSeason?.seasonNumber}
                    episodeNumber={selectedEpisode?.episodeNumber}
                  />
                </React.Suspense>
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center bg-black text-white gap-4 border border-[#253900]">
                  <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center">
                    <CloseIcon className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold">Player not working</h3>
                  <p className="text-gray-400">Video source is currently unavailable for this player.</p>
                </div>
              )
            ) : (
              <div className="w-full aspect-video flex items-center justify-center relative">
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || `${item.title} ${item.year ? item.year : ''} Watch Free | watch online`.trim().replace(/  +/g, ' ')}
                  width="1920"
                  height="1080"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm pointer-events-none"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center gap-6">
                  {item.isUpcoming && !currentVideoUrl ? (
                    <div className="flex flex-col items-center gap-4 bg-black/60 px-8 py-6 rounded-2xl border border-yellow-500/30 backdrop-blur-md shadow-[0_0_50px_rgba(234,179,8,0.15)] max-w-sm text-center">
                      <span className="text-yellow-500 font-bold uppercase tracking-widest text-sm">UPCOMING</span>
                      <h3 className="text-white font-black text-2xl">This {item.type === "MOVIE" ? "Movie" : "Series"} is Upcoming</h3>
                      <p className="text-gray-400 text-sm">
                        Check back later when it's officially released!
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handlePlay}
                        aria-label="Play Video"
                        className="w-20 h-20 bg-white hover:bg-gray-200 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)] pointer-events-auto"
                      >
                        <Play className="fill-black w-8 h-8 ml-1" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </VideoPlayerErrorBoundary>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4 w-full">
          {allPlayers.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 bg-[#0a0f00] p-3 rounded-xl border border-[#1a2700] md:flex-1">
              <span className="text-gray-400 font-bold text-sm mr-2 hidden sm:inline-block uppercase tracking-wider">Select Server:</span>
              {allPlayers.map((player, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedVideoIndex(idx);
                    if (!player.isAdFree) {
                      triggerMonetagOnClick();
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    selectedVideoIndex === idx
                      ? "bg-brand-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-brand-500"
                      : "bg-[#0d1400] text-gray-400 border border-[#253900] hover:text-white hover:border-[#385600] hover:bg-[#141d00]"
                  }`}
                >
                  {player.label}
                </button>
              ))}
            </div>
          )}

          {((isSeries ? selectedEpisode?.downloadTelegram : item.downloadTelegram) || (isSeries ? selectedEpisode?.downloadDirect : item.downloadDirect) || (isSeries ? selectedEpisode?.downloadTorrent : item.downloadTorrent) || (isSeries ? selectedEpisode?.subtitleDownloadUrl : item.subtitleDownloadUrl)) && (
            <div className="flex flex-wrap items-center gap-2 bg-[#0a0f00] p-3 rounded-xl border border-[#1a2700]">
              {(isSeries ? selectedEpisode?.downloadTelegram : item.downloadTelegram) && (
                <a href={(isSeries ? selectedEpisode?.downloadTelegram : item.downloadTelegram)} target="_blank" rel="noreferrer" onClick={triggerMonetagOnClick} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all bg-[#2AABEE]/10 text-[#2AABEE] border border-[#2AABEE]/30 hover:bg-[#2AABEE] hover:text-white">
                  <Download className="w-4 h-4" /> Telegram
                </a>
              )}
              {(isSeries ? selectedEpisode?.downloadDirect : item.downloadDirect) && (
                <a href={(isSeries ? selectedEpisode?.downloadDirect : item.downloadDirect)} target="_blank" rel="noreferrer" onClick={triggerMonetagOnClick} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-white">
                  <Download className="w-4 h-4" /> Direct
                </a>
              )}
              {(isSeries ? selectedEpisode?.downloadTorrent : item.downloadTorrent) && (
                <a href={(isSeries ? selectedEpisode?.downloadTorrent : item.downloadTorrent)} target="_blank" rel="noreferrer" onClick={triggerMonetagOnClick} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all bg-purple-500/10 text-purple-500 border border-purple-500/30 hover:bg-purple-500 hover:text-white">
                  <Download className="w-4 h-4" /> Torrent
                </a>
              )}
              {(isSeries ? selectedEpisode?.subtitleDownloadUrl : item.subtitleDownloadUrl) && (() => {
                  const subUrl = isSeries ? selectedEpisode?.subtitleDownloadUrl : item.subtitleDownloadUrl;
                  let hostname = "";
                  try {
                    hostname = new URL(subUrl!).hostname;
                  } catch(e) {}
                  
                  return (
                    <a href={subUrl} target="_blank" rel="noreferrer" title="Download Subtitle" onClick={triggerMonetagOnClick} className="flex items-center justify-center w-[38px] h-[38px] rounded-lg transition-all bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 group">
                      {hostname ? (
                        <img src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=128`} alt={`${hostname} icon`} className="w-5 h-5 rounded-sm object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                      ) : null}
                      <Download className={`w-5 h-5 text-yellow-500 ${hostname ? 'hidden' : ''}`} />
                    </a>
                  )
              })()}
            </div>
          )}
        </div>

        {/* Below Player Actions */}
        <div className="flex justify-between items-center py-2 mb-4">
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-brand-900/60 hover:bg-brand-900/80 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] text-white font-medium px-4 py-2 rounded flex items-center gap-2 transition-all duration-300 text-sm hover:scale-[1.05]"
          >
            <Flag className="w-4 h-4" /> Report
          </button>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (shareLinks) {
                  typeof window !== 'undefined' && window.open(shareLinks.facebook, 'share-popup', 'width=600,height=400');
                }
              }}
              aria-label="Share on Facebook" 
              className="w-10 h-10 rounded-full bg-[#0d1400] border border-[#1a2700] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/50 hover:shadow-[0_0_15px_rgba(24,119,242,0.3)] flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-[#1877F2] hover:scale-[1.1]"
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if (shareLinks) {
                  typeof window !== 'undefined' && window.open(shareLinks.whatsapp, 'share-popup', 'width=600,height=400');
                }
              }}
              aria-label="Share on WhatsApp" 
              className="w-10 h-10 rounded-full bg-[#0d1400] border border-[#1a2700] hover:bg-[#25D366]/10 hover:border-[#25D366]/50 hover:shadow-[0_0_15px_rgba(37,211,102,0.3)] flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-[#25D366] hover:scale-[1.1]"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if (shareLinks) {
                  typeof window !== 'undefined' && window.open(shareLinks.telegram, 'share-popup', 'width=600,height=400');
                }
              }}
              aria-label="Share on Telegram" 
              className="w-10 h-10 rounded-full bg-[#0d1400] border border-[#1a2700] hover:bg-[#0088cc]/10 hover:border-[#0088cc]/50 hover:shadow-[0_0_15px_rgba(0,136,204,0.3)] flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-[#0088cc] hover:scale-[1.1]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Download Buttons */}
        {((isSeries ? selectedEpisode?.downloadLink480p : item.downloadLink480p) || 
          (isSeries ? selectedEpisode?.downloadLink720p : item.downloadLink720p) || 
          (isSeries ? selectedEpisode?.downloadLink1080p : item.downloadLink1080p)) && (
          <div className="flex flex-col gap-3 mb-8">
            {(isSeries ? selectedEpisode?.downloadLink480p : item.downloadLink480p) && (
              <a href={(isSeries ? selectedEpisode?.downloadLink480p : item.downloadLink480p)} target="_blank" rel="noopener noreferrer" onClick={triggerMonetagOnClick} className="bg-[#111] hover:bg-[#181818] border border-[#222] hover:border-red-600/30 rounded-xl p-4 md:px-6 md:py-4 flex flex-row items-center gap-4 transition-all group">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                  <ArrowDown className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <h4 className="text-white font-bold md:text-lg text-base truncate">Direct & Telegram Download Links</h4>
                  <p className="text-gray-400 text-xs md:text-sm mt-0.5 truncate">WEB-DL 480p • 600 MB • {item.language || "English"}</p>
                </div>
              </a>
            )}
            {(isSeries ? selectedEpisode?.downloadLink720p : item.downloadLink720p) && (
              <a href={(isSeries ? selectedEpisode?.downloadLink720p : item.downloadLink720p)} target="_blank" rel="noopener noreferrer" onClick={triggerMonetagOnClick} className="bg-[#111] hover:bg-[#181818] border border-[#222] hover:border-red-600/30 rounded-xl p-4 md:px-6 md:py-4 flex flex-row items-center gap-4 transition-all group">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                  <ArrowDown className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <h4 className="text-white font-bold md:text-lg text-base truncate">Direct & Telegram Download Links</h4>
                  <p className="text-gray-400 text-xs md:text-sm mt-0.5 truncate">WEB-DL 720p • 1.2 GB • {item.language || "English"}</p>
                </div>
              </a>
            )}
            {(isSeries ? selectedEpisode?.downloadLink1080p : item.downloadLink1080p) && (
              <a href={(isSeries ? selectedEpisode?.downloadLink1080p : item.downloadLink1080p)} target="_blank" rel="noopener noreferrer" onClick={triggerMonetagOnClick} className="bg-[#111] hover:bg-[#181818] border border-[#222] hover:border-red-600/30 rounded-xl p-4 md:px-6 md:py-4 flex flex-row items-center gap-4 transition-all group">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                  <ArrowDown className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <h4 className="text-white font-bold md:text-lg text-base truncate">Direct & Telegram Download Links</h4>
                  <p className="text-gray-400 text-xs md:text-sm mt-0.5 truncate">WEB-DL 1080p • 2.4 GB • {item.language || "English"}</p>
                </div>
              </a>
            )}
          </div>
        )}

        {/* Unified Details Hero Card */}
        <div className="bg-[#161616] border border-[#1a2700] rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 mb-8 md:max-h-[28rem] overflow-hidden">
          <div className="w-40 sm:w-56 shrink-0 relative rounded-lg overflow-hidden shadow-lg shadow-black/50 mx-auto md:mx-0 bg-transparent flex items-start justify-center h-full">
            <img
              src={item.imageUrl}
              alt={item.imageAlt || `${item.title} ${item.year ? item.year : ''} Watch Free | watch online`.trim().replace(/  +/g, ' ')}
              width="300"
              height="450"
              className="w-full max-h-[24rem] object-contain object-top rounded-lg"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className="flex flex-col max-w-3xl w-full md:max-h-[24rem]">
            <div className="flex items-center gap-4 mb-2 flex-wrap shrink-0">
              <h1 className="text-3xl sm:text-4xl text-white font-bold md:leading-snug">
                {item.title} <span className="text-gray-400 text-2xl sm:text-3xl">{item.year ? `(${item.year})` : ''}</span> Watch Free | watch online
              </h1>
              {isPlaying && (
                <span className="flex items-center gap-2 bg-brand-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded outline outline-1 outline-brand-500/50 shadow-[0_0_15px_rgba(220,38,38,0.4)] uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Playing
                </span>
              )}
            </div>
            {item.network && (
              <p className="text-brand-500 font-semibold text-sm mb-4 shrink-0">
                {item.network}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs font-semibold text-gray-300 mb-6 flex-wrap shrink-0">
              <div className="flex gap-2">
                <span className="bg-yellow-500 text-black px-1.5 rounded-sm">
                  IMDb
                </span>
                <span>{item.rating || "N/A"}</span>
              </div>
              {((item.genres && item.genres.length > 0) || item.genre) && (
                <span>
                  <span className="text-gray-500">Genre:</span>{" "}
                  {item.genres && item.genres.length > 0 
                    ? item.genres.join(", ") 
                    : item.genre}
                </span>
              )}
              {item.duration && (
                <span>
                  <span className="text-gray-500">Duration:</span>{" "}
                  {item.duration}
                </span>
              )}
              <span>
                <span className="text-gray-500">Type:</span>{" "}
                {item.type === "MOVIE" ? "Movie" : "TV Series"}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 shrink-0">
              <button 
                onClick={() => {
                  if (item.trailerUrl) {
                    setPlayingMode("trailer");
                    setIsPlaying(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    alert("No trailer available for this item.");
                  }
                }}
                className="bg-[#0d1400] hover:bg-black border border-[#1a2700] hover:border-gray-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-white px-6 py-2 rounded flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:scale-[1.05]"
              >
                <Play className="w-4 h-4" /> Trailer
              </button>
              <button className="bg-[#0d1400] hover:bg-black border border-[#1a2700] hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)] text-white px-6 py-2 rounded flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:scale-[1.05]">
                <svg
                  className="w-4 h-4 fill-white flex-shrink-0 group-hover:fill-pink-500 transition-colors duration-300"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Like
              </button>
              <button
                onClick={handleAddToWatchlist}
                className={`bg-[#0d1400] hover:bg-black border hover:shadow-[0_0_15px_rgba(220,38,38,0.2)] text-white px-6 py-2 rounded flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:scale-[1.05] ${isAdded ? 'border-brand-600' : 'border-[#1a2700] hover:border-brand-600/50'}`}
              >
                {isAdded ? (
                  <Check className="w-4 h-4 text-brand-500" />
                ) : (
                  <Plus className="w-4 h-4 items-center" />
                )}
                {isAdded ? "Added" : "Add to Watchlist"}
              </button>
              <button
                onClick={handleShare}
                className="bg-[#0d1400] hover:bg-black border border-[#1a2700] hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] text-white px-6 py-2 rounded flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:scale-[1.05]"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            <div 
              id="movie-description-container" 
              className="text-sm leading-relaxed text-gray-300 overflow-y-auto custom-scrollbar md:flex-1 min-h-0 md:pr-4"
            >
              <div 
                className="article-html-content flex flex-col gap-3 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: item.description || "No description available." }}
              />
              <div className="mt-6 pt-4 border-t border-[#1a2700] text-[13px] text-gray-400">
                <p>
                  You can now enjoy this title with <strong>HD quality</strong>. MovieZen makes it easy to watch movies and TV Series. Enjoy our constantly updated collection of <strong>free movies</strong> right now.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cast section - common for both */}
        {item.castList && item.castList.length > 0 && (
          <div className="w-full mb-8 bg-[#161616] border border-[#1a2700] rounded-xl p-6 md:p-8">
            <h3 className="text-white font-bold text-xl mb-6">Cast</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {item.castList.map((actor, i) => (
                <CastMember key={i} name={actor} />
              ))}
            </div>
          </div>
        )}

        {/* Series Episodes block */}
        {isSeries && (
          <div className="flex flex-col gap-4 w-full mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                  <path d="M2 11h20v2H2zm0-4h20v2H2zm0 8h20v2H2z" />
                </svg>
                <h2 className="text-2xl font-bold text-white">
                  Episodes
                </h2>
              </div>

              {item.seasons && item.seasons.length > 0 && (
                <div className="flex gap-3 items-center mt-4 sm:mt-0 sm:ml-auto w-full sm:w-auto">
                  <button
                    onClick={() => setEpisodeSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    className="p-2 border border-[#1a2700] bg-[#0a0f00] text-white rounded-lg hover:border-[#334c00] transition-colors flex items-center justify-center group relative gap-1 px-3 ml-auto flex-shrink-0"
                  >
                    <ArrowUpDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="text-gray-300 group-hover:text-white transition-colors text-sm font-medium">{episodeSortOrder === "asc" ? "Ascending" : "Descending"}</span>
                  </button>
                </div>
              )}
            </div>

            {item.seasons && item.seasons.length > 0 ? (
              <div className="flex flex-col gap-6">
                <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {item.seasons.map((season) => {
                    // Default to first season if none selected
                    const isActive = (browsingSeasonNumber === season.seasonNumber) || (!browsingSeasonNumber && item.seasons && season.seasonNumber === item.seasons[0].seasonNumber);
                    return (
                      <button
                        key={season.seasonNumber}
                        onClick={() => setBrowsingSeasonNumber(season.seasonNumber)}
                        className={`group px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                          isActive 
                            ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                            : "bg-[#111111] border border-[#1a2700] text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                        }`}
                      >
                        Season {season.seasonNumber}
                        <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                          isActive 
                            ? "bg-black/20 text-black" 
                            : "bg-white/10 text-gray-500 group-hover:text-gray-300"
                        }`}>
                          {season.episodes.length}
                        </span>
                      </button>
                    )
                  })}
                </div>
                
                {(() => {
                  const activeSeason = item.seasons.find(s => s.seasonNumber === browsingSeasonNumber) || item.seasons[0];
                  if (!activeSeason) return null;
                  
                  return (
                    <div className="bg-[#0a0f00] border border-[#1a2700] rounded-xl p-4 md:p-6">
                      {activeSeason.episodes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {[...activeSeason.episodes].sort((a, b) => episodeSortOrder === "asc" ? a.episodeNumber - b.episodeNumber : b.episodeNumber - a.episodeNumber).map((ep) => (
                            <div
                              key={ep.episodeNumber}
                              onClick={() => {
                                setSelectedSeason(activeSeason);
                                setSelectedEpisode(ep);
                                setIsPlaying(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`group flex flex-col overflow-hidden rounded-lg border cursor-pointer transition-all ${
                                selectedEpisode?.episodeNumber === ep.episodeNumber && selectedSeason?.seasonNumber === activeSeason.seasonNumber 
                                  ? "bg-[#1f1616] border-brand-700 shadow-[0_0_15px_rgba(220,38,38,0.15)] ring-1 ring-brand-700" 
                                  : "bg-[#111111] border-[#222] hover:border-[#444] hover:bg-[#1a1a1a]"
                              }`}
                            >
                              <div className="w-full aspect-video relative bg-[#0a0a0a] overflow-hidden">
                                <img 
                                  src={ep.thumbnailUrl || item?.bannerUrl || item?.imageUrl} 
                                  alt={ep.title || `Episode ${ep.episodeNumber}`}
                                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent pointer-events-none"></div>
                                <div className="absolute top-2 right-2 z-10">
                                  {selectedEpisode?.episodeNumber === ep.episodeNumber && selectedSeason?.seasonNumber === activeSeason.seasonNumber && (
                                    <span className="flex h-3 w-3 relative">
                                      {isPlaying && (
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                      )}
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500 shadow-[0_0_8px_theme(colors.brand.500)]"></span>
                                    </span>
                                  )}
                                </div>
                                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                                  {ep.releaseDate || `EP ${ep.episodeNumber}`}
                                </div>
                              </div>
                              <div className="p-3.5 flex justify-between items-start gap-2 h-full bg-gradient-to-b from-[#111] to-[#0a0a0a]">
                                <h3 className={`font-bold text-sm leading-snug line-clamp-2 transition-colors ${
                                  selectedEpisode?.episodeNumber === ep.episodeNumber && selectedSeason?.seasonNumber === activeSeason.seasonNumber 
                                    ? "text-white" 
                                    : "text-gray-300 group-hover:text-white"
                                }`}>
                                  {ep.episodeNumber}. {ep.title || `Episode ${ep.episodeNumber}`}
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm text-center py-8">
                          No episodes available in this season.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-4">
                No seasons and episodes available.
              </div>
            )}
          </div>
        )}

        {/* Related Items Section */}
        {relatedItems.length > 0 && (
          <div className="w-full mt-12 bg-[#161616] border border-[#1a2700] rounded-xl p-6 md:p-8">
            <h3 className="text-white font-bold text-xl mb-6">You May Also Like</h3>
            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
              {relatedItems.map((relatedItem, index) => (
                <div key={relatedItem.id} className="w-[120px] sm:w-[160px] md:w-[200px] lg:w-[220px] shrink-0">
                  <MovieCard
                    item={relatedItem}
                    priority={index < 4}
                    onClick={() => {
                      if (onSelectMedia) {
                        onSelectMedia(relatedItem);
                      } else {
                        let relatedSlug = relatedItem.slug || relatedItem.id;
                        if (relatedSlug.endsWith('-watch-free')) {
                          relatedSlug = relatedSlug.replace(/-watch-free$/, '-watch-online');
                        }
                        navigate.push(`/${relatedItem.type === 'MOVIE' ? 'movies' : 'tv'}/${relatedSlug}`);
                      }
                      // Smooth scroll to top when changing videos
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#000000] border border-[#1a2700] rounded-xl w-full max-w-md p-6 flex flex-col gap-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Flag className="w-5 h-5 text-brand-500" />
              Report Content
            </h3>
            <p className="text-sm text-gray-400">
              Please let us know why you are reporting this content.
            </p>

            <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {[
                  "Player not working",
                  "Download link not working",
                  "Subtitle not working",
                  "Other",
                ].map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#1a2700] cursor-pointer hover:bg-[#0d1400] transition-colors"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="accent-brand-600"
                    />
                    <span className="text-white text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsReportModalOpen(false);
                    setReportReason("");
                  }}
                  className="px-4 py-2 rounded font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!reportReason || isSubmittingReport}
                  className="bg-brand-700 hover:bg-brand-600 disabled:opacity-50 text-white px-6 py-2 rounded font-medium transition-colors"
                >
                  {isSubmittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

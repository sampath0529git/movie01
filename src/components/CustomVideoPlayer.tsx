"use client";
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from "react";
import Hls from "hls.js";
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  HelpCircle, 
  AlertCircle, 
  RotateCcw,
  FastForward,
  Rewind,
  Loader2,
  Subtitles,
  Monitor,
  Upload,
  Type,
  ChevronLeft
} from "lucide-react";

interface Track {
  kind: "captions" | "subtitles";
  label: string;
  srcLang: string;
  src: string;
  default?: boolean;
}

export interface SubtitleCue {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export function parseSubtitles(text: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalizedText.split(/\n\s*\n/);
  
  // Regex supporting optionally hours index, formats: hh:mm:ss.ttt or mm:ss.ttt
  const timeRegex = /(?:(\d{1,}):)?(\d{1,2}):(\d{1,2})[.,](\d{1,3})\s*-->\s*(?:(\d{1,}):)?(\d{1,2}):(\d{1,2})[.,](\d{1,3})/;

  for (const block of blocks) {
    if (!block.trim()) continue;
    const lines = block.trim().split("\n");
    let timeLineIndex = -1;
    let match: RegExpMatchArray | null = null;

    for (let i = 0; i < lines.length; i++) {
      match = lines[i].match(timeRegex);
      if (match) {
        timeLineIndex = i;
        break;
      }
    }

    if (timeLineIndex === -1 || !match) continue;

    const startH = match[1] ? parseInt(match[1], 10) : 0;
    const startM = parseInt(match[2], 10);
    const startS = parseInt(match[3], 10);
    const startMsStr = match[4].padEnd(3, '0');
    const startMs = parseInt(startMsStr, 10);
    const startTimeResult = startH * 3600 + startM * 60 + startS + startMs / 1000;

    const endH = match[5] ? parseInt(match[5], 10) : 0;
    const endM = parseInt(match[6], 10);
    const endS = parseInt(match[7], 10);
    const endMsStr = match[8].padEnd(3, '0');
    const endMs = parseInt(endMsStr, 10);
    const endTimeResult = endH * 3600 + endM * 60 + endS + endMs / 1000;

    const textLines = lines.slice(timeLineIndex + 1);
    const textResult = textLines.join("\n").replace(/<[^>]+>/g, "").trim();

    if (textResult) {
      cues.push({
        id: lines[0] && !lines[0].includes("-->") ? lines[0].trim() : String(cues.length),
        startTime: startTimeResult,
        endTime: endTimeResult,
        text: textResult,
      });
    }
  }

  return cues;
}

interface CustomVideoPlayerProps {
  url: string;
  tracks?: Track[];
  options?: any;
  onEnded?: () => void;
  aspectRatio?: "auto" | "16:9" | "21:9" | "4:3" | "stretch";
  subtitleSize?: "small" | "normal" | "large";
  subtitleColor?: "white" | "yellow" | "cyan";
  mediaId?: string;
  title?: string;
  playerMode?: "auto" | "native" | "iframe";
  nextEpisodeTitle?: string;
  onNextEpisode?: () => void;
}

export interface CustomVideoPlayerRef {
  plyr: any; // Kept for backwards compatibility with TS types
}

export const CustomVideoPlayer = forwardRef<CustomVideoPlayerRef, CustomVideoPlayerProps>(
  (
    {
      url,
      tracks = [],
      options = {},
      onEnded,
      aspectRatio = "auto",
      subtitleSize = "normal",
      subtitleColor = "white",
      mediaId,
      title,
      playerMode = "auto",
      nextEpisodeTitle,
      onNextEpisode,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    // Dynamic player states
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(() => {
      if (typeof window !== "undefined") {
        const savedVolume = localStorage.getItem("player_volume");
        if (savedVolume !== null) {
          return parseFloat(savedVolume);
        }
      }
      return 0.85;
    });
    const [isMuted, setIsMuted] = useState(() => {
      if (typeof window !== "undefined") {
        const savedMuted = localStorage.getItem("player_muted");
        if (savedMuted !== null) {
          return savedMuted === "true";
        }
      }
      return false;
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [bufferedPercent, setBufferedPercent] = useState(0);
    const [playerError, setPlayerError] = useState<string | null>(null);

    const [controlsVisible, setControlsVisible] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [settingsMenu, setSettingsMenu] = useState<"main" | "speed" | "quality" | "aspect" | "subtitles">("main");
    const [playbackRate, setPlaybackRate] = useState(1);
    
    // Configurable settings states from props
    const [currentAspectRatio, setCurrentAspectRatio] = useState(aspectRatio);
    const [currentSubtitleSize, setCurrentSubtitleSize] = useState(subtitleSize);
    const [currentSubtitleColor, setCurrentSubtitleColor] = useState(subtitleColor);
    
    // Quality choices from HLS stream.js
    const [hlsQualities, setHlsQualities] = useState<{ height: number; index: number }[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(-1);
    const [autoLevelHeight, setAutoLevelHeight] = useState<number | null>(null);

    // Double click skip feedback
    const [showForwardFeedback, setShowForwardFeedback] = useState(false);
    const [showBackwardFeedback, setShowBackwardFeedback] = useState(false);
    const [showPlayPausePulse, setShowPlayPausePulse] = useState<"play" | "pause" | null>(null);

    // Bookmarked watches
    const [showResumeToast, setShowResumeToast] = useState(false);
    const [resumePosition, setResumePosition] = useState<number | null>(null);

    // Next Episode Auto-Play
    const [upNextCancelled, setUpNextCancelled] = useState(false);
    
    // Reset upNextCancelled when url changes
    useEffect(() => {
      setUpNextCancelled(false);
    }, [url]);

    const upNextTimeRemaining = duration > 0 ? Math.max(0, Math.ceil(duration - currentTime)) : 0;
    const showUpNextUI = !!onNextEpisode && !upNextCancelled && duration > 30 && upNextTimeRemaining <= 12 && upNextTimeRemaining > 0;

    useEffect(() => {
      if (showUpNextUI && upNextTimeRemaining <= 1) {
        if (onNextEpisode) onNextEpisode();
      }
    }, [showUpNextUI, upNextTimeRemaining, onNextEpisode]);

    // Hover tooltip states for progress seek bar
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverPosition, setHoverPosition] = useState<number>(0);

    // Separate clicks from double clicks
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    const resetIdleTimer = () => {
      setControlsVisible(true);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (videoRef.current && !videoRef.current.paused) {
          setControlsVisible(false);
          setShowSettings(false);
        }
      }, 3000);
    };

    useImperativeHandle(ref, () => ({
      get plyr() {
        // Return a helper mimicking plyr control to prevent crashes if something expects it
        return {
          play: () => videoRef.current?.play(),
          pause: () => videoRef.current?.pause(),
          togglePlay: () => {
            const video = videoRef.current;
            if (video) video.paused ? video.play() : video.pause();
          },
          destroy: () => {},
        };
      },
    }));

    // Auto-upgrade insecure HTTP URLs to HTTPS under secure origin
    const upgradedUrl = React.useMemo(() => {
      if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("http:")) {
        return url.replace(/^http:/i, "https:");
      }
      return url;
    }, [url]);

    const isIframe = (() => {
      if (playerMode === "iframe") return true;
      if (playerMode === "native") return false;

      const lowerUrl = upgradedUrl.toLowerCase();
      
      if (
        lowerUrl.includes("embed") ||
        lowerUrl.includes("vidsrc") ||
        lowerUrl.includes("gdriveplayer") ||
        lowerUrl.includes("superembed") ||
        lowerUrl.includes("2embed") ||
        lowerUrl.includes("autombed") ||
        lowerUrl.includes("vidplay") ||
        lowerUrl.includes("filemoon") ||
        lowerUrl.includes("rabbitstream") ||
        lowerUrl.includes("vizcloud") ||
        lowerUrl.includes("fembed") ||
        lowerUrl.includes("doodstream") ||
        lowerUrl.includes("dood") ||
        lowerUrl.includes("ds2play") ||
        lowerUrl.includes("playmogo") ||
        lowerUrl.includes("player.vimeo.com") ||
        lowerUrl.includes("youtube.com") ||
        lowerUrl.includes("youtu.be")
      ) {
        return true;
      }

      if (
        lowerUrl.includes("/stream/") ||
        lowerUrl.includes("moviezen") ||
        lowerUrl.includes("stream-bot") ||
        lowerUrl.includes("stream")
      ) {
        return false;
      }

      if (
        lowerUrl.match(/\.(mp4|m3u8|mkv|webm|mov|avi|flv|ogg|ts)(\?|$)/i) ||
        upgradedUrl.includes("firebasestorage.googleapis.com") ||
        upgradedUrl.includes("googleusercontent.com")
      ) {
        return false;
      }

      if (!lowerUrl.includes(".") || (lowerUrl.includes("?") && !lowerUrl.includes(".mp4") && !lowerUrl.includes(".m3u8") && !lowerUrl.includes(".mkv") && !lowerUrl.includes(".webm"))) {
        return true;
      }

      return false;
    })();

    // Custom subtitle parsing and rendering states
    const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
    const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);

    useEffect(() => {
      // Clear previous cues
      setSubtitleCues([]);
      
      if (isIframe || !tracks || tracks.length === 0) {
        return;
      }

      // Get first active default track, or fallback to the first track available
      const activeTrack = tracks.find(t => t.default) || tracks[0];
      if (!activeTrack || !activeTrack.src) {
        return;
      }

      let isSubscribed = true;

      const fetchAndParse = async () => {
        try {
          console.log("Fetching subtitle from:", activeTrack.src);
          const response = await fetch(activeTrack.src);
          if (!response.ok) throw new Error("Network response error of subtitle");
          const text = await response.text();
          if (isSubscribed) {
            const parsed = parseSubtitles(text);
            console.log("Parsed subtitle cues count:", parsed.length, "from text length:", text.length);
            setSubtitleCues(parsed);
          }
        } catch (e) {
          console.warn("Client side subtitle fetching error, falling back to native:", e);
        }
      };

      fetchAndParse();

      return () => {
        isSubscribed = false;
      };
    }, [tracks, isIframe]);

    // Fast evaluation for current subtitle text block based on requestAnimationFrame for perfect sync
    const [currentActiveSubtitleText, setCurrentActiveSubtitleText] = useState<string | null>(null);

    useEffect(() => {
      if (!subtitlesEnabled || subtitleCues.length === 0 || !videoRef.current) {
        setCurrentActiveSubtitleText(null);
        return;
      }

      let animationFrameId: number;
      const checkSubtitle = () => {
        const video = videoRef.current;
        if (!video) return;
        const time = video.currentTime;
        const currentCue = subtitleCues.find(c => time >= c.startTime && time <= c.endTime);
        const text = currentCue ? currentCue.text : null;
        
        setCurrentActiveSubtitleText(prev => prev !== text ? text : prev);
        
        animationFrameId = requestAnimationFrame(checkSubtitle);
      };

      animationFrameId = requestAnimationFrame(checkSubtitle);
      
      return () => cancelAnimationFrame(animationFrameId);
    }, [subtitleCues, subtitlesEnabled]);

    // Check for saved progress to offer resume
    useEffect(() => {
      if (isIframe || !mediaId) return;
      const savedTimeStr = localStorage.getItem(`movievibe_progress_${mediaId}`);
      if (savedTimeStr) {
        const savedTime = parseFloat(savedTimeStr);
        if (savedTime > 8) {
          setResumePosition(savedTime);
          setShowResumeToast(true);
          const timer = setTimeout(() => {
            setShowResumeToast(false);
          }, 8000);
          return () => clearTimeout(timer);
        }
      }
    }, [mediaId, upgradedUrl, isIframe]);

    // Save playback progress periodically
    useEffect(() => {
      if (isIframe || !mediaId) return;
      const interval = setInterval(() => {
        const video = videoRef.current;
        if (video && !video.paused) {
          const currentTimeVal = video.currentTime;
          const durationVal = video.duration;
          if (currentTimeVal > 5 && durationVal && durationVal - currentTimeVal > 10) {
            localStorage.setItem(`movievibe_progress_${mediaId}`, currentTimeVal.toString());
          } else if (durationVal && durationVal - currentTimeVal <= 10) {
            localStorage.removeItem(`movievibe_progress_${mediaId}`);
          }
        }
      }, 5000);

      return () => {
        clearInterval(interval);
      };
    }, [mediaId, isIframe]);

    // Stream playback initialization (HLS vs Direct MP4 stream)
    useEffect(() => {
      setPlayerError(null);
      setIsLoading(true);

      if (isIframe) return;

      const videoElement = videoRef.current;
      if (!videoElement) return;

      let hlsInstance: Hls | null = null;
      const isHLS = upgradedUrl.toLowerCase().includes(".m3u8");
      
      let networkRetryCount = 0;
      const MAX_RETRIES = 5;
      let networkRetryTimeout: NodeJS.Timeout | null = null;
      let nativeRetryTimeout: NodeJS.Timeout | null = null;

      function startPlaybackEngine(targetUrl: string) {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        
        if (networkRetryTimeout) clearTimeout(networkRetryTimeout);
        if (nativeRetryTimeout) clearTimeout(nativeRetryTimeout);

        if (isHLS && Hls.isSupported()) {
          hlsInstance = new Hls({
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1024 * 1024,
            maxBufferLength: 60,
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
            capLevelToPlayerSize: true,
            fragLoadingTimeOut: 30000,
            manifestLoadingTimeOut: 30000,
            levelLoadingTimeOut: 30000,
            abrEwmaDefaultEstimate: 500000,
          });
          hlsRef.current = hlsInstance;

          hlsInstance.loadSource(targetUrl);
          hlsInstance.attachMedia(videoElement!);

          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            const levels = hlsInstance!.levels.map((lvl, index) => ({
              height: lvl.height,
              index: index,
            })).sort((a, b) => b.height - a.height);
            
            setHlsQualities(levels);
            
            // Set initial auto level if applicable
            if (hlsInstance!.currentLevel !== -1 && hlsInstance!.levels[hlsInstance!.currentLevel]) {
              setAutoLevelHeight(hlsInstance!.levels[hlsInstance!.currentLevel].height);
            }
            setCurrentQuality(hlsInstance!.autoLevelCapping !== -1 && !hlsInstance!.autoLevelEnabled ? hlsInstance!.currentLevel : -1);
            
            // Auto play removed to prevent unexpected resume when stopped
          });

          hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            if (hlsInstance && hlsInstance.levels[data.level]) {
              setAutoLevelHeight(hlsInstance.levels[data.level].height);
            }
          });

          hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            // Hot fallback if HTTPS yields Mixed Content blocks on legacy URLs
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR && targetUrl.startsWith("https:") && url.startsWith("http:")) {
              console.log("HLS loaded insecure protocol blocking, dropping to original HTTP source...");
              startPlaybackEngine(url);
              return;
            }

            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (networkRetryCount < MAX_RETRIES) {
                    networkRetryCount++;
                    const backoff = Math.min(1000 * Math.pow(2, networkRetryCount), 30000);
                    console.log(`HLS network connection lost, retrying in ${backoff}ms (attempt ${networkRetryCount}/${MAX_RETRIES})...`);
                    networkRetryTimeout = setTimeout(() => {
                      hlsInstance?.startLoad();
                    }, backoff);
                  } else {
                    console.error("HLS network connection lost permanently after max retries.");
                    setPlayerError("The streaming video server could not be reached. Initial stream wake-up might be overloaded.");
                    setIsLoading(false);
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log("HLS decode failure, attempting buffer recovery...");
                  hlsInstance?.recoverMediaError();
                  break;
                default:
                  console.error("Fatal unrecoverable streaming failure:", data);
                  setPlayerError("The streaming video server could not be reached. Initial stream wake-up might be overloaded.");
                  setIsLoading(false);
                  break;
              }
            }
          });
        } else {
          // Standard Native MP4 Direct Stream source loader
          const handleNativeError = () => {
            if (networkRetryCount < MAX_RETRIES) {
              networkRetryCount++;
              const backoff = Math.min(1000 * Math.pow(2, networkRetryCount), 30000);
              console.log(`Native video error, retrying in ${backoff}ms (attempt ${networkRetryCount}/${MAX_RETRIES})...`);
              nativeRetryTimeout = setTimeout(() => {
                videoElement!.src = targetUrl;
                videoElement!.load();
                // Retrying without auto-playing
              }, backoff);
            } else {
              console.error("Native video failed to load after max retries.");
              setPlayerError("The streaming video server could not be reached. Initial stream wake-up might be overloaded.");
              setIsLoading(false);
            }
          };

          videoElement!.onerror = handleNativeError;
          videoElement!.src = targetUrl;
          try {
            videoElement!.load();
          } catch (e) {}

          // Autoplay removed to prevent unexpected resume
          setIsLoading(false);
        }
      }

      startPlaybackEngine(upgradedUrl);

      return () => {
        if (networkRetryTimeout) clearTimeout(networkRetryTimeout);
        if (nativeRetryTimeout) clearTimeout(nativeRetryTimeout);
        
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsRef.current = null;
        }
        if (videoElement) {
          videoElement!.onerror = null;
          videoElement!.removeAttribute("src");
          try {
            videoElement!.load();
          } catch (e) {}
        }
      };
    }, [upgradedUrl, isIframe]);

    // Handle idle mouse custom hide HUD Controls timer
    useEffect(() => {
      if (isIframe) return;

      const handleMouseMove = (e: MouseEvent) => {
        // Ignore simulated mouseover events on touch screens
        if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
          return;
        }
        resetIdleTimer();
      };

      // Security measure: prevent inspecting via keyboard
      const handleSecurityKeydown = (e: KeyboardEvent) => {
        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
          (e.ctrlKey && (e.key === "U" || e.key === "u"))
        ) {
          e.preventDefault();
        }
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener("mousemove", handleMouseMove);
      }
      
      window.addEventListener("keydown", handleSecurityKeydown);

      resetIdleTimer();

      return () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        window.removeEventListener("keydown", handleSecurityKeydown);
        if (container) {
          container.removeEventListener("mousemove", handleMouseMove);
        }
      };
    }, [isIframe, isPlaying]);

    // Keyboard Hotkeys
    useEffect(() => {
      const handleGlobalKeys = (e: KeyboardEvent) => {
        const video = videoRef.current;
        if (!video || isIframe) return;

        const activeTag = document.activeElement?.tagName;
        if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") {
          return;
        }

        switch (e.code) {
          case "Space":
            e.preventDefault();
            togglePlay();
            break;
          case "ArrowLeft":
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - 10);
            break;
          case "ArrowRight":
            e.preventDefault();
            video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
            break;
          case "ArrowUp":
            e.preventDefault();
            video.volume = Math.min(1, video.volume + 0.1);
            break;
          case "ArrowDown":
            e.preventDefault();
            video.volume = Math.max(0, video.volume - 0.1);
            break;
          case "KeyM":
            e.preventDefault();
            const nextMute = !video.muted;
            video.muted = nextMute;
            setIsMuted(nextMute);
            break;
          case "KeyC":
            e.preventDefault();
            setSubtitlesEnabled(prev => !prev);
            break;
          case "KeyF":
            e.preventDefault();
            toggleFullscreen();
            break;
          default:
            break;
        }
      };

      window.addEventListener("keydown", handleGlobalKeys);
      return () => {
        window.removeEventListener("keydown", handleGlobalKeys);
      };
    }, [isIframe]);

    // Sync fullscreen states with native exits
    useEffect(() => {
      const onFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener("fullscreenchange", onFullscreenChange);
      return () => {
        document.removeEventListener("fullscreenchange", onFullscreenChange);
      };
    }, []);

    // Persist volume to localStorage and apply on mount
    useEffect(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("player_volume", volume.toString());
        localStorage.setItem("player_muted", isMuted.toString());
      }
      if (videoRef.current) {
        // Only apply if it's different to avoid redundant updates
        if (videoRef.current.volume !== volume) videoRef.current.volume = volume;
        if (videoRef.current.muted !== isMuted) videoRef.current.muted = isMuted;
      }
    }, [volume, isMuted, videoRef.current]);

    // Time/Buffer trackers
    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      setCurrentTime(video.currentTime);
      
      if (video.duration && video.buffered.length > 0) {
        try {
          // Calculate the buffered range containing currentTime
          let activeIndex = 0;
          for (let i = 0; i < video.buffered.length; i++) {
            if (video.currentTime >= video.buffered.start(i) && video.currentTime <= video.buffered.end(i)) {
              activeIndex = i;
              break;
            }
          }
          const bufferedEnd = video.buffered.end(activeIndex);
          setBufferedPercent((bufferedEnd / video.duration) * 100);
        } catch (err) {}
      }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      const video = videoRef.current;
      if (video) {
        video.volume = value;
        setVolume(value);
        if (value > 0) {
          video.muted = false;
          setIsMuted(false);
        }
      }
    };

    const handleVolumeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const togglePlay = () => {
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        video.play().then(() => {
          setShowPlayPausePulse("play");
          setTimeout(() => setShowPlayPausePulse(null), 600);
        }).catch((e) => console.log("Play failed:", e));
      } else {
        video.pause();
        setShowPlayPausePulse("pause");
        setTimeout(() => setShowPlayPausePulse(null), 600);
      }
    };

    const toggleMute = () => {
      const video = videoRef.current;
      if (video) {
        const nextMute = !video.muted;
        video.muted = nextMute;
        setIsMuted(nextMute);
        if (!nextMute && volume === 0) {
          video.volume = 0.5;
          setVolume(0.5);
        }
      }
    };

    const toggleFullscreen = () => {
      const container = containerRef.current;
      if (!container) return;

      if (!document.fullscreenElement) {
        container.requestFullscreen().catch((err) => {
          console.error("Fullscreen failed:", err);
        });
      } else {
        document.exitFullscreen();
      }
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const targetTime = parseFloat(e.target.value);
      const video = videoRef.current;
      if (video) {
        video.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    };

    // Separate clicks from double clicks on the screen
    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest(".video-controls-prevent")) {
        return;
      }

      if (clickTimeoutRef.current) {
        // It's a double click!
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
        
        // Custom double-tap seeking logic
        const video = videoRef.current;
        const container = containerRef.current;
        if (!video || !container) return;

        const rect = container.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;

        if (clickX > width / 2) {
          // Double clicked right side -> Skip forward 10s
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          setShowForwardFeedback(true);
          setTimeout(() => setShowForwardFeedback(false), 650);
        } else {
          // Double clicked left side -> Skip backward 10s
          video.currentTime = Math.max(0, video.currentTime - 10);
          setShowBackwardFeedback(true);
          setTimeout(() => setShowBackwardFeedback(false), 650);
        }

      } else {
        clickTimeoutRef.current = setTimeout(() => {
          clickTimeoutRef.current = null;
          
          if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
            if (controlsVisible) {
              setControlsVisible(false);
              setShowSettings(false);
            } else {
              resetIdleTimer();
            }
          } else {
            togglePlay();
          }
        }, 240);
      }
    };

    const handleResume = () => {
      if (resumePosition !== null && videoRef.current) {
        videoRef.current.currentTime = resumePosition;
        videoRef.current.play().catch(() => {});
        setShowResumeToast(false);
      }
    };

    const handleHlsQualityChange = (index: number) => {
      if (hlsRef.current) {
        hlsRef.current.currentLevel = index;
        setCurrentQuality(index);
        setShowSettings(false);
      }
    };

    const handleSpeedChange = (rate: number) => {
      const video = videoRef.current;
      if (video) {
        video.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSettings(false);
      }
    };

    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      console.error("Native HTML5 video element fired an error:", video.error);
      
      const currentSrc = video.src || "";
      // Mixed Content or insecure protocol block -> Force fallback to standard raw HTTP source
      if (currentSrc.startsWith("https:") && url.startsWith("http:")) {
        console.log("Retrying video playback with secure origin sandboxed HTTP link instead...");
        video.src = url;
        try {
          video.load();
        } catch (err) {}
        return;
      }

      const mediaError = video.error;
      let errMsg = "Server is waking up or overloaded. Please refresh the page in a few seconds.";
      if (mediaError) {
        switch (mediaError.code) {
          case mediaError.MEDIA_ERR_DECODE:
            errMsg = "The browser failed to decode the video container. Try forcing standard player mode or opening in a New Tab.";
            break;
          case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errMsg = "The stream format is unsupported by your browser or was blocked due to secure/insecure connection protocols (Mixed Content restriction).";
            break;
          case mediaError.MEDIA_ERR_NETWORK:
            errMsg = "A stream connection timeout occurred. The Heroku wake-up limits might be overloaded.";
            break;
        }
      }
      setPlayerError(errMsg);
      setIsLoading(false);
    };

    // format duration in hh:mm:ss or mm:ss
    const formatTime = (secs: number) => {
      if (isNaN(secs) || secs === Infinity) return "00:00";
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.floor(secs % 60);

      const parts: string[] = [];
      if (h > 0) parts.push(h.toString().padStart(2, "0"));
      parts.push(m.toString().padStart(2, "0"));
      parts.push(s.toString().padStart(2, "0"));
      return parts.join(":");
    };

    const isRawHtmlIframe = upgradedUrl.trim().toLowerCase().startsWith("<iframe");

    // Render configuration
    if (isRawHtmlIframe) {
      // Create a wrapper string to inject styles, forcing iframe to take full width/height
      const styledIframeCode = upgradedUrl
        .replace(/<iframe/i, '<iframe class="absolute inset-0 w-full h-full border-0 z-10 bg-black" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen')
        .replace(/width=["'][^"']*["']/i, '')
        .replace(/height=["'][^"']*["']/i, '');
        
      return (
        <div 
          className="w-full h-full min-h-[420px] bg-black relative overflow-hidden flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full border-0 z-10" 
          dangerouslySetInnerHTML={{ __html: styledIframeCode }}
        />
      );
    }

    if (isIframe) {
      return (
        <div className="w-full h-full min-h-[420px] bg-black relative overflow-hidden">
          <iframe
            src={upgradedUrl}
            className="absolute inset-0 w-full h-full border-0 z-10 bg-black"
            allowFullScreen
            loading="eager"
            referrerPolicy="no-referrer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Premium Video Player Embed"
          />
        </div>
      );
    }

    // Dynamic styles
    let fontStyleClass = "text-lg";
    if (subtitleSize === "small") fontStyleClass = "text-sm";
    else if (subtitleSize === "large") fontStyleClass = "text-2xl";

    let fontColorClass = "text-white";
    if (subtitleColor === "yellow") fontColorClass = "text-yellow-400";
    else if (subtitleColor === "cyan") fontColorClass = "text-cyan-400";

    const playedPercentage = duration ? (currentTime / duration) * 100 : 0;

    let dynamicAspectClass = "aspect-video";
    if (currentAspectRatio === "16:9") dynamicAspectClass = "aspect-video";
    else if (currentAspectRatio === "21:9") dynamicAspectClass = "aspect-[21/9]";
    else if (currentAspectRatio === "4:3") dynamicAspectClass = "aspect-[4/3]";
    else if (currentAspectRatio === "stretch") dynamicAspectClass = "w-full h-full min-h-[420px] max-h-screen";

    return (
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className={`w-full bg-black relative overflow-hidden group select-none transition-shadow hover:shadow-[0_0_25px_rgba(229,9,20,0.15)] ${dynamicAspectClass} cursor-none touch-manipulation`}
        style={currentAspectRatio === "stretch" ? { minHeight: "420px", display: "flex", alignItems: "center", justifyContent: "center" } : {}}
      >
        {/* Native video tag */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black cursor-pointer pointer-events-none"
          playsInline
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onVolumeChange={handleVolumeUpdate}
          onEnded={() => {
            if (!upNextCancelled && onEnded) {
              onEnded();
            }
          }}
          onError={handleVideoError}
        >
          {tracks?.map((track, i) => (
            <track
              key={i}
              kind={track.kind}
              label={track.label}
              srcLang={track.srcLang}
              src={track.src}
              default={track.default}
            />
          ))}
        </video>

        {/* Premium Custom Cinematic Subtitle Overlay Layer */}
        {currentActiveSubtitleText && (
          <div 
            className={`absolute left-1/2 -translate-x-1/2 z-30 w-full max-w-[85%] md:max-w-[75%] px-4 flex justify-center text-center select-none transition-all duration-200 pointer-events-none ${
              controlsVisible ? "bottom-24 mb-3" : "bottom-10"
            }`}
          >
            <div 
              className={`
                px-2 py-1
                font-medium tracking-wide leading-relaxed text-center mx-auto
                ${currentSubtitleSize === "small" ? "text-base md:text-lg font-semibold" : currentSubtitleSize === "large" ? "text-2xl md:text-4xl font-black" : "text-xl md:text-2xl font-extrabold"}
                ${currentSubtitleColor === "yellow" ? "text-yellow-400" : currentSubtitleColor === "cyan" ? "text-cyan-400" : "text-white"}
              `}
              style={{ textShadow: "0px 2px 4px rgba(0,0,0,1), 0px 0px 8px rgba(0,0,0,1), 0px 0px 2px rgba(0,0,0,1)" }}
            >
              {currentActiveSubtitleText.split("\n").map((line, index) => (
                <span key={index} className="block">{line}</span>
              ))}
            </div>
          </div>
        )}

        {/* Double Click fast skips floating indicators */}
        {/* Mobile-friendly Double-Tap Feedback Splash */}
        {showForwardFeedback && (
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-none z-30 rounded-l-[100%] overflow-hidden">
            <div className="flex animate-pulse">
              <Play className="w-8 h-8 fill-white/80 text-transparent -mr-4" />
              <Play className="w-8 h-8 fill-white/80 text-transparent -mr-4" />
              <Play className="w-8 h-8 fill-white/80 text-transparent" />
            </div>
            <span className="text-sm font-extrabold mt-2 text-white/90 tracking-widest drop-shadow-md">10 seconds</span>
          </div>
        )}
        {showBackwardFeedback && (
          <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-white/10 to-transparent flex flex-col items-center justify-center animate-in fade-in slide-in-from-left-4 duration-300 pointer-events-none z-30 rounded-r-[100%] overflow-hidden">
            <div className="flex animate-pulse">
              <Play className="w-8 h-8 fill-white/80 text-transparent rotate-180 -ml-4" />
              <Play className="w-8 h-8 fill-white/80 text-transparent rotate-180 -ml-4" />
              <Play className="w-8 h-8 fill-white/80 text-transparent rotate-180" />
            </div>
            <span className="text-sm font-extrabold mt-2 text-white/90 tracking-widest drop-shadow-md">10 seconds</span>
          </div>
        )}

        {/* Up Next Auto-Play Overlay */}
        {showUpNextUI && (
          <div className="absolute bottom-24 md:bottom-32 right-3 md:right-6 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border border-[#2a2a2a] rounded-xl p-4 shadow-2xl w-[90vw] sm:w-80 animate-in slide-in-from-bottom-8 fade-in duration-300 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Up Next in {upNextTimeRemaining}s</p>
                <h4 className="text-white font-medium line-clamp-2 leading-snug">{nextEpisodeTitle || "Next Episode"}</h4>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNextEpisode?.();
                }}
                className="flex-1 bg-white hover:bg-zinc-200 text-black py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 pointer-events-auto"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Now
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUpNextCancelled(true);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors pointer-events-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Big centered transient Play/Pause Click-indicator bubble wrapper */}
        {showPlayPausePulse && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="bg-black/65 scale-[1.3] opacity-0 animate-ping rounded-full p-5 text-[#e50914] border border-[#e50914]/20">
              {showPlayPausePulse === "play" ? (
                <Play className="w-10 h-10 fill-[#e50914]" />
              ) : (
                <Pause className="w-10 h-10 fill-[#e50914]" />
              )}
            </div>
          </div>
        )}

        {/* Cinematic Netflix-style waking up/buffering spinner overlay */}
        {isLoading && !playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#000000bd]/80 z-30 pointer-events-none backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-4 text-center px-4 max-w-sm">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800/80"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-[#e50914] border-r-[#e50914]/30 border-b-transparent border-l-transparent animate-spin"></div>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-white text-sm font-black tracking-widest uppercase animate-pulse">
                  Waking up server dyno...
                </span>
                <p className="text-zinc-400 text-xs leading-normal">
                  Initial cold start streams might require 5-10 seconds to spin up. Please stand by.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Big centered touch/mobile friendly Play/Pause overlay */}
        {(!isPlaying || controlsVisible) && !isLoading && !playerError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-opacity duration-300 md:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="video-controls-prevent pointer-events-auto bg-black/50 hover:bg-[#e50914]/90 text-white p-3.5 rounded-full backdrop-blur-md border border-white/10 transition-transform active:scale-90"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              )}
            </button>
          </div>
        )}

        {/* Cinematic Custom Header HUD overlay */}
        <div className={`absolute top-0 inset-x-0 h-24 md:h-28 bg-gradient-to-b from-black/90 to-transparent pt-3 pb-6 px-3 md:pt-6 md:px-6 md:pb-6 z-40 pointer-events-none transition-all duration-300 flex items-start justify-between ${
          controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
        }`}>
          <div className="flex flex-col gap-1 select-none text-left max-w-[70%]">
            {title && <h2 className="text-sm md:text-base font-extrabold text-white text-shadow-md line-clamp-1 md:line-clamp-none">{title}</h2>}
            <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-semibold text-zinc-400">
              <span className="bg-[#e50914] text-white px-1.5 py-0.5 rounded font-black tracking-wider uppercase">ULTRA HD 4K</span>
              <span className="hidden sm:inline">DIRECT MP4 CDN</span>
            </div>
          </div>

          <div className="video-controls-prevent pointer-events-auto flex items-center gap-2 md:gap-3">
            {hlsQualities.length > 0 && (
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  if (!showSettings) setSettingsMenu("main");
                }}
                className="bg-black/50 hover:bg-[#e50914] text-white border border-zinc-800 hover:border-red-600 px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quality</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Quality Settings Popover Card */}
        {showSettings && (
          <div className="video-controls-prevent absolute bottom-24 md:bottom-28 right-3 md:right-6 bg-[#0A0A0A]/95 border border-zinc-800 rounded-2xl p-4 z-50 w-[90vw] sm:w-72 max-h-[60vh] overflow-y-auto shadow-2xl backdrop-blur-md anim-fade-in text-left">
            {settingsMenu === "main" && (
              <>
                <h3 className="text-[10px] sm:text-xs font-black text-zinc-400/80 uppercase tracking-widest pb-3 mb-2 px-1">Playback Tuning</h3>
                <div className="flex flex-col gap-1 text-sm font-medium">
                  {/* Subtitle Settings */}
                  <button 
                    onClick={() => setSettingsMenu("subtitles")}
                    className="flex items-center justify-between hover:bg-zinc-800/50 p-2.5 rounded-xl transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-zinc-100">
                      <Type className="h-4 w-4 text-zinc-400" />
                      <span>Subtitle Settings</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{currentSubtitleSize} / {currentSubtitleColor}</span>
                  </button>

                  <button 
                    onClick={() => setSettingsMenu("speed")}
                    className="flex items-center justify-between hover:bg-zinc-800/50 p-2.5 rounded-xl transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-zinc-100">
                      <Settings className="h-4 w-4 text-zinc-400" />
                      <span>Speed Rate</span>
                    </div>
                    <span className="bg-red-950/40 text-red-500 px-2 py-0.5 rounded text-[11px] font-black tracking-wide">{playbackRate}x</span>
                  </button>

                  <button 
                    onClick={() => setSettingsMenu("aspect")}
                    className="flex items-center justify-between hover:bg-zinc-800/50 p-2.5 rounded-xl transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-zinc-100">
                      <Monitor className="h-4 w-4 text-zinc-400" />
                      <span>Aspect Ratio</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{currentAspectRatio}</span>
                  </button>

                  {hlsQualities.length > 0 && (
                    <button 
                      onClick={() => setSettingsMenu("quality")}
                      className="flex items-center justify-between hover:bg-zinc-800/50 p-2.5 rounded-xl transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 text-zinc-100">
                        <Settings className="h-4 w-4 text-zinc-400" />
                        <span>HLS Resolution</span>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                        {currentQuality === -1 ? `AUTO${autoLevelHeight ? ` (${autoLevelHeight}p)` : ""}` : `${hlsQualities.find(q => q.index === currentQuality)?.height || 0}p`}
                      </span>
                    </button>
                  )}

                  <div className="h-px w-full bg-zinc-800/60 my-2"></div>

                  <label className="flex items-center gap-3 hover:bg-red-500/10 text-red-500 p-2.5 rounded-xl transition cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span className="font-bold text-sm tracking-wide">Upload Subtitle (.vtt)</span>
                    <input 
                      type="file" 
                      accept=".vtt" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            const text = re.target?.result as string;
                            if (text) {
                              setSubtitleCues(parseSubtitles(text));
                              setSubtitlesEnabled(true);
                              setShowSettings(false);
                            }
                          };
                          reader.readAsText(file);
                        }
                      }} 
                    />
                  </label>
                </div>
              </>
            )}

            {settingsMenu === "speed" && (
              <>
                <div className="flex items-center gap-2 pb-3 mb-2 px-1 border-b border-zinc-800/60">
                  <button onClick={() => setSettingsMenu("main")} className="text-zinc-400 p-1 hover:text-white transition rounded-md hover:bg-zinc-800">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-[10px] sm:text-xs font-black text-zinc-400/80 uppercase tracking-widest">Playback Speed</h3>
                </div>
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                        playbackRate === rate ? "text-[#e50914] bg-red-950/20 font-bold" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      {rate === 1 ? "Normal (1x)" : `${rate}x`}
                    </button>
                  ))}
                </div>
              </>
            )}

            {settingsMenu === "aspect" && (
              <>
                <div className="flex items-center gap-2 pb-3 mb-2 px-1 border-b border-zinc-800/60">
                  <button onClick={() => setSettingsMenu("main")} className="text-zinc-400 p-1 hover:text-white transition rounded-md hover:bg-zinc-800">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-[10px] sm:text-xs font-black text-zinc-400/80 uppercase tracking-widest">Aspect Ratio</h3>
                </div>
                <div className="flex flex-col gap-1">
                  {["auto", "16:9", "21:9", "4:3", "stretch"].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => {
                        setCurrentAspectRatio(ratio as any);
                        setShowSettings(false);
                        setTimeout(() => setSettingsMenu("main"), 300);
                      }}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer uppercase ${
                        currentAspectRatio === ratio ? "text-[#e50914] bg-red-950/20 font-bold" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </>
            )}

            {settingsMenu === "subtitles" && (
              <>
                <div className="flex items-center gap-2 pb-3 mb-2 px-1 border-b border-zinc-800/60">
                  <button onClick={() => setSettingsMenu("main")} className="text-zinc-400 p-1 hover:text-white transition rounded-md hover:bg-zinc-800">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-[10px] sm:text-xs font-black text-zinc-400/80 uppercase tracking-widest">Subtitle Tuning</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-xs text-zinc-500 font-bold mb-2 block uppercase tracking-wider">Color</span>
                    <div className="flex gap-2">
                      {["white", "yellow", "cyan"].map(col => (
                        <button
                           key={col}
                           title={col}
                           onClick={() => setCurrentSubtitleColor(col as any)}
                           className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-lg ${col === "white" ? "bg-white" : col === "yellow" ? "bg-yellow-400" : "bg-cyan-400"} ${currentSubtitleColor === col ? "border-[#e50914] scale-110 shadow-red-500/20" : "border-transparent"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 font-bold mb-2 block uppercase tracking-wider">Size</span>
                    <div className="flex bg-zinc-900 rounded-lg p-1">
                      {["small", "normal", "large"].map(sz => (
                        <button
                           key={sz}
                           onClick={() => setCurrentSubtitleSize(sz as any)}
                           className={`flex-1 py-1.5 text-xs font-bold rounded-md uppercase transition-colors ${currentSubtitleSize === sz ? "bg-[#e50914] text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
                        >
                           {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {settingsMenu === "quality" && (
              <>
                <div className="flex items-center gap-2 pb-3 mb-2 px-1 border-b border-zinc-800/60">
                  <button onClick={() => setSettingsMenu("main")} className="text-zinc-400 p-1 hover:text-white transition rounded-md hover:bg-zinc-800">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-[10px] sm:text-xs font-black text-zinc-400/80 uppercase tracking-widest">HLS Quality</h3>
                </div>
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                  <button
                    onClick={() => handleHlsQualityChange(-1)}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex justify-between items-center ${
                      currentQuality === -1 ? "text-[#e50914] bg-red-950/20 font-bold" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <span>Auto Level (Default)</span>
                    {currentQuality === -1 && autoLevelHeight && (
                        <span className="text-[10px] bg-red-900/40 px-1.5 py-0.5 rounded text-white">{autoLevelHeight}p detected</span>
                    )}
                  </button>
                  {hlsQualities.map((item) => (
                    <button
                      key={item.index}
                      onClick={() => handleHlsQualityChange(item.index)}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                        currentQuality === item.index ? "text-[#e50914] bg-red-950/20 font-bold" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      {item.height}p Resolution
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Custom Cinematic Interactive Control Bar Overlay HUD */}
        <div className={`absolute bottom-0 inset-x-0 h-24 md:h-28 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-8 pb-3 px-3 md:p-6 z-40 flex flex-col justify-end transition-all duration-300 video-controls-prevent ${
          controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}>
          {/* Progress Seek bar slider track */}
          <div 
            className="relative w-full h-8 group/seek flex items-center mb-1 -translate-y-2 cursor-pointer select-none"
            onMouseMove={(e) => {
              if (!duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetX = e.clientX - rect.left;
              const percent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
              setHoverPosition(percent);
              setHoverTime((percent / 100) * duration);
            }}
            onMouseLeave={() => setHoverTime(null)}
          >
            {/* Dark base background bar */}
            <div className="absolute inset-x-0 h-1.5 md:h-1.5 group-hover/seek:h-2 bg-zinc-800 rounded-full transition-all duration-200 overflow-hidden pointer-events-none">
              {/* Loaded Buffered ranges representation */}
              <div
                className="absolute top-0 bottom-0 bg-white/20 rounded-full transition-all duration-200"
                style={{ width: `${bufferedPercent}%` }}
              />
              {/* Watched Playback Progress */}
              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-[#e50914] to-red-500 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(229,9,20,0.4)]"
                style={{ width: `${playedPercentage}%` }}
              />
            </div>

            {/* Seamless range overlay track to capture hover coordinates & selections */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeekChange}
              className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer z-20 touch-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8"
            />

            {/* Glowing red micro seek thumb */}
            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-[#e50914] border-2 border-white shadow-[0_0_10px_rgba(229,9,20,0.8)] pointer-events-none scale-0 group-hover/seek:scale-100 transition-transform duration-100 ease-out z-30"
              style={{ left: `calc(${playedPercentage}% - 7px)` }}
            />

            {/* Premium hover time preview tooltip */}
            {hoverTime !== null && (
              <div 
                className="absolute bottom-6 bg-zinc-950/95 border border-zinc-800 text-white px-2.5 py-1 text-[11px] font-mono rounded-md shadow-2xl pointer-events-none -translate-x-1/2 z-50 transition-all duration-75 select-none"
                style={{ left: `${hoverPosition}%` }}
              >
                <div className="relative">
                  {formatTime(hoverTime)}
                  {/* Tooltip down-pointing accent arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-950 mt-[3.5px]" />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons list */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Play Pause Trigger */}
              <button
                onClick={togglePlay}
                className="flex group/btn text-zinc-100 hover:text-white bg-zinc-900/60 border border-zinc-800 hover:border-red-600/60 hover:bg-zinc-850 hover:scale-105 active:scale-95 transition-all p-2.5 md:p-2 rounded-full shadow-lg hover:shadow-red-650/10 cursor-pointer items-center justify-center"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white text-white group-hover/btn:scale-105 transition-transform" />
                ) : (
                  <Play className="w-5 h-5 fill-white text-white translate-x-0.5 group-hover/btn:scale-105 transition-transform" />
                )}
              </button>

              {/* Volume Slider overlay controls */}
              <div className="hidden sm:flex items-center gap-2 group/vol animate-in transition-all">
                <button
                  onClick={toggleMute}
                  className="text-zinc-100 hover:text-white bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition p-2.5 md:p-2 rounded-full shadow-lg cursor-pointer flex items-center justify-center"
                  title="Mute / Unmute (M)"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-red-500" />
                  ) : volume < 0.45 ? (
                    <Volume1 className="w-5 h-5 text-zinc-300" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-zinc-200" />
                  )}
                </button>
                <div className="w-0 sm:group-hover/vol:w-24 overflow-hidden transition-all duration-300 ease-out flex items-center h-5">
                  <div className="relative w-20 h-1 flex items-center cursor-pointer select-none">
                    <div className="absolute inset-x-0 h-1 bg-zinc-800 rounded-full" />
                    <div
                      className="absolute left-0 h-1 bg-[#e50914] rounded-full"
                      style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>
              </div>

              {/* Digital duration countdown counters */}
              <div className="font-mono text-[10px] md:text-xs select-none flex items-center gap-1 h-8 md:h-9 px-2 md:px-3.5 bg-zinc-900/40 border border-zinc-800/20 rounded-full select-none">
                <span className="text-zinc-150 font-semibold tabular-nums">{formatTime(currentTime)}</span>
                <span className="text-zinc-650 font-medium">/</span>
                <span className="text-zinc-450 tabular-nums">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2.5">
              {/* Premium Interactive Subtitles Toggle button */}
              {tracks && tracks.length > 0 && (
                <button
                  onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                  className={`text-zinc-100 bg-zinc-900/60 border hover:scale-105 active:scale-95 transition-all p-2 md:p-2 rounded-full shadow-lg cursor-pointer flex items-center justify-center ${
                    subtitlesEnabled ? "border-red-600/65 text-red-500 shadow-[0_0_10px_rgba(229,9,20,0.3)] bg-red-950/20" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                  title={subtitlesEnabled ? "Turn off Subtitles (C)" : "Turn on Subtitles (C)"}
                >
                  <Subtitles className={`w-4 h-4 md:w-5 md:h-5 ${subtitlesEnabled ? "text-red-500" : "text-zinc-100"}`} />
                </button>
              )}

              {/* Custom Quality Resolution Menu Toggle */}
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  if (!showSettings) setSettingsMenu("main");
                }}
                className={`text-zinc-100 bg-zinc-900/60 border hover:scale-105 active:scale-95 transition-all p-2 md:p-2 rounded-full shadow-lg cursor-pointer flex items-center justify-center ${
                  showSettings ? "border-red-600/65 text-red-500 shadow-[0_0_10px_rgba(229,9,20,0.3)] bg-red-950/20" : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800"
                }`}
                title="Playback Settings"
              >
                <Settings className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${showSettings ? "rotate-45 text-red-500" : "text-zinc-100"}`} />
              </button>

              {/* Toggle Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="text-zinc-100 hover:text-white bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all p-2 md:p-2 rounded-full shadow-lg cursor-pointer flex items-center justify-center"
                title="Fullscreen (F)"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                ) : (
                  <Maximize className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* User Friendly Failover Error Overlay backdrop */}
        {playerError && (
          <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-6 z-50">
            <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center text-[#e50914] mb-4 shadow-xl animate-bounce">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-white font-black text-lg mb-2">Could Not Connect to Stream</h3>
            <p className="text-zinc-400 text-sm max-w-sm leading-relaxed mb-6">
              {playerError}
              <br />
              <span className="text-xs text-[#e50914]/90 mt-2 block font-medium bg-[#e50914]/10 border border-[#e50914]/20 rounded-lg px-3 py-1.5">
                💡 Browser sandbox policy limits insecure raw HTTP content. Opening raw link bypasses mixed content blocks.
              </span>
            </p>
            <div className="flex items-center justify-center gap-3 video-controls-prevent pointer-events-auto">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="bg-[#e50914] hover:bg-red-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-red-600/20 shadow-neutral-950 transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                Play in New Tab (Direct)
              </a>
              <button
                onClick={() => {
                  setPlayerError(null);
                  setIsLoading(true);
                  const video = videoRef.current;
                  if (video) {
                    video.removeAttribute("src");
                    video.load();
                    setTimeout(() => {
                      setIsLoading(false);
                    }, 500);
                  }
                }}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Retry Stream Connect
              </button>
            </div>
          </div>
        )}

        {/* Progress resume toast popup */}
        {showResumeToast && resumePosition !== null && (
          <div className="video-controls-prevent absolute bottom-24 md:bottom-20 left-3 md:left-6 bg-[#000000f0]/95 border border-zinc-800 rounded-xl p-3 md:p-4 z-50 flex items-center gap-3 md:gap-4 w-[90vw] sm:max-w-sm shadow-2xl backdrop-blur-md anim-fade-in">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-950/40 flex items-center justify-center shrink-0 border border-red-500/20 text-[#e50914]">
              <RotateCcw className="w-5 h-5 animate-spin duration-3000" />
            </div>
            <div className="flex-grow flex flex-col gap-0.5 text-left">
              <h4 className="text-xs font-black text-white leading-tight">Resume watching?</h4>
              <p className="text-[10px] text-zinc-400">Continue watching from {Math.floor(resumePosition / 60)}:{(Math.floor(resumePosition % 60)).toString().padStart(2, "0")}</p>
            </div>
            <div className="flex items-center gap-2 ml-1">
              <button
                onClick={() => setShowResumeToast(false)}
                className="px-2.5 py-1.5 rounded text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition cursor-pointer"
              >
                No
              </button>
              <button
                onClick={handleResume}
                className="bg-[#e50914] hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CustomVideoPlayer.displayName = "CustomVideoPlayer";
export default CustomVideoPlayer;

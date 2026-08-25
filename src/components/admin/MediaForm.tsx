"use client";
import React, { useState, useEffect } from "react";
import { MediaItem } from "../../types";
import {
  saveMediaItem,
  updateMediaItem,
  uploadSubtitleFile,
  uploadImageFile,
} from "../../firebase";
import { supabase } from "../../supabase";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  ChevronDown,
  Loader2,
  Sparkles,
  Database,
  Loader,
  Bot,
  Globe,
  FileText,
  Tag,
  AlignLeft,
  Code,
  Search,
  Wand2,
  RefreshCw,
  Edit,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

function translateSchemaForOpenRouter(schema: any): any {
  if (!schema) return schema;
  const newSchema = { ...schema };
  
  if (typeof newSchema.type === "string") {
    newSchema.type = newSchema.type.toLowerCase();
  }
  
  if (newSchema.properties) {
    for (const key in newSchema.properties) {
      newSchema.properties[key] = translateSchemaForOpenRouter(newSchema.properties[key]);
    }
  }
  
  if (newSchema.items) {
    newSchema.items = translateSchemaForOpenRouter(newSchema.items);
  }
  
  return newSchema;
}

async function callGeminiApi(prompt: string, schema: any) {
  let keysStr = localStorage.getItem("AI_API_KEYS");
  if (!keysStr) {
    // Fallback migration check
    const oldOpenRouter = localStorage.getItem("OPENROUTER_API_KEY");
    const oldGemini = localStorage.getItem("GEMINI_API_KEY");
    if (oldGemini) keysStr = oldGemini;
    else if (oldOpenRouter) keysStr = oldOpenRouter;
    
    if (!keysStr) {
      throw new Error("AI API Key is missing. Please add it in the Settings panel.");
    }
  }

  const keys = keysStr.split(',').map(k => k.trim()).filter(k => k);
  if (keys.length === 0) {
    throw new Error("AI API Key is missing. Please add it in the Settings panel.");
  }

  let targetModel = localStorage.getItem("AI_MODEL") || "gemini-2.5-flash";
  let lastKeyIndexStr = localStorage.getItem("AI_KEY_INDEX") || "0";
  let lastKeyIndex = parseInt(lastKeyIndexStr, 10);
  if (isNaN(lastKeyIndex)) lastKeyIndex = 0;

  let currentAttempt = 0;
  let lastError = null;

  while (currentAttempt < keys.length) {
    const currentKeyIndex = (lastKeyIndex + currentAttempt) % keys.length;
    const currentKey = keys[currentKeyIndex];
    
    try {
      if (currentKey.startsWith("sk-or-")) {
        const openRouterSchema = translateSchemaForOpenRouter(schema);
        const fullPrompt = `${prompt}\n\nYou MUST return ONLY valid JSON matching this schema structure. Do not wrap in markdown tags like \`\`\`json. Return a pure JSON object:\n${JSON.stringify(openRouterSchema, null, 2)}`;
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentKey}`,
            "HTTP-Referer": (typeof window !== 'undefined' ? window.location.origin : ''),
            "X-Title": "MovieVibe"
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [{ role: "user", content: fullPrompt }],
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const text = await response.text();
          let errorMessage = text;
          try {
            const parsed = JSON.parse(text);
            if (parsed.error && parsed.error.metadata && parsed.error.metadata.raw) {
              errorMessage = typeof parsed.error.metadata.raw === 'string' ? parsed.error.metadata.raw : JSON.stringify(parsed.error.metadata.raw);
            } else if (parsed.error && parsed.error.message) {
              errorMessage = parsed.error.message;
            }
          } catch(e) {}
          throw new Error(`OpenRouter API Error: ${errorMessage}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          let content = data.choices[0].message.content;
          content = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
          return content;
        }
        throw new Error("No response returned from OpenRouter");
      } else {
        let nativeModelName = targetModel;
        if (nativeModelName.startsWith("google/")) {
          nativeModelName = nativeModelName.replace("google/", "");
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${nativeModelName}:generateContent?key=${currentKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: schema
            }
          })
        });

        if (!response.ok) {
          const text = await response.text();
          let errorMessage = text;
          try {
            const parsed = JSON.parse(text);
            if (parsed.error && parsed.error.message) {
              errorMessage = parsed.error.message;
            }
          } catch(e) {}
          throw new Error(`Gemini API Error: ${errorMessage}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          let content = data.candidates[0].content.parts[0].text;
          content = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
          return content;
        }
        throw new Error("No response returned from Gemini");
      }
    } catch (error: any) {
      lastError = error;
      const errorStr = error.message || String(error);
      const isQuotaError = errorStr.includes("429") || errorStr.includes("quota") || errorStr.toLowerCase().includes("exhausted") || errorStr.includes("credit");
      
      currentAttempt++;
      if (isQuotaError && currentAttempt < keys.length) {
        console.warn(`Key at index ${currentKeyIndex} failed due to quota/limits. Trying next key...`);
        localStorage.setItem("AI_KEY_INDEX", ((lastKeyIndex + currentAttempt) % keys.length).toString());
        continue;
      }
      
      // If it's not a quota error or we ran out of keys, throw immediately
      throw error;
    }
  }
  
  throw lastError;
}

interface MediaFormProps {
  initialData?: MediaItem | null;
  onClose: () => void;
  defaultType?: "MOVIE" | "TV";
}

export default function MediaForm({
  initialData,
  onClose,
  defaultType = "MOVIE",
}: MediaFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: defaultType,
    imageUrl: "",
    imageAlt: "",
    bannerUrl: "",
    videoUrl: "",
    player2Url: "",
    player3Url: "",
    player3Working: false,
    player4Url: "",
    trailerUrl: "",
    subtitleUrl: "",
    subtitleVtt: "",
    subtitleDownloadUrl: "",
    downloadLink480p: "",
    downloadLink720p: "",
    downloadLink1080p: "",
    downloadTelegram: "",
    downloadDirect: "",
    downloadTorrent: "",
    rating: "",
    year: new Date().getFullYear().toString(),
    quality: "HD",
    genres: ["", "", ""],
    language: "",
    network: "",
    description: "",
    duration: "",
    castString: "",
    featured: false,
    trending: false,
    isUpcoming: false,
    completedSeasonTag: "",
    status: "Published",
    seoTitle: "",
    metaDescription: "",
    keywordsString: "",
    schemaMarkup: "",
  });

  const [seasons, setSeasons] = useState<
    {
      seasonNumber: number;
      episodes: {
        title: string;
        episodeNumber: number;
        releaseDate: string;
        videoUrl: string;
        player2Url?: string;
        player3Url?: string;
        player3Working?: boolean;
        player4Url?: string;
        subtitleUrl?: string;
        subtitleVtt?: string;
        subtitleDownloadUrl?: string;
        downloadTelegram?: string;
        downloadDirect?: string;
        downloadTorrent?: string;
        downloadLink480p?: string;
        downloadLink720p?: string;
        downloadLink1080p?: string;
      }[];
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState<{ id: string; seasonIndex?: number; episodeIndex?: number; text: string } | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        type: initialData.type || "MOVIE",
        imageUrl: initialData.imageUrl || "",
        imageAlt: initialData.imageAlt || "",
        bannerUrl: initialData.bannerUrl || "",
        videoUrl: initialData.videoUrl || "",
        player2Url: initialData.player2Url || "",
        player3Url: initialData.player3Url || "",
        player3Working: initialData.player3Working || false,
        player4Url: initialData.player4Url || "",
        trailerUrl: initialData.trailerUrl || "",
        subtitleUrl: initialData.subtitleUrl || "",
        subtitleVtt: initialData.subtitleVtt || "",
        subtitleDownloadUrl: initialData.subtitleDownloadUrl || "",
        downloadLink480p: initialData.downloadLink480p || "",
        downloadLink720p: initialData.downloadLink720p || "",
        downloadLink1080p: initialData.downloadLink1080p || "",
        downloadTelegram: initialData.downloadTelegram || "",
        downloadDirect: initialData.downloadDirect || "",
        downloadTorrent: initialData.downloadTorrent || "",
        rating: initialData.rating || "",
        year: initialData.year || new Date().getFullYear().toString(),
        quality: initialData.quality || "HD",
        genres: initialData.genres && initialData.genres.length > 0 
          ? [initialData.genres[0] || "", initialData.genres[1] || "", initialData.genres[2] || ""] 
          : [initialData.genre || "", "", ""],
        language: initialData.language || "",
        network: initialData.network || "",
        description: initialData.description || "",
        duration: initialData.duration || "",
        castString: initialData.castList ? initialData.castList.join(", ") : "",
        featured: initialData.featured || false,
        trending: initialData.trending || false,
        isUpcoming: initialData.isUpcoming || false,
        completedSeasonTag: initialData.completedSeasonTag || "",
        status: initialData.status || "Published",
        seoTitle: initialData.seoTitle || "",
        metaDescription: initialData.metaDescription || "",
        keywordsString: initialData.keywords ? initialData.keywords.join(", ") : "",
        schemaMarkup: initialData.schemaMarkup || "",
      });
      if (initialData.type === "TV" && initialData.seasons) {
        setSeasons(
          initialData.seasons.map((s) => ({
            ...s,
            episodes: s.episodes.map((ep) => ({
              title: ep.title || "",
              episodeNumber: ep.episodeNumber || 1,
              releaseDate: ep.releaseDate || "",
              videoUrl: ep.videoUrl || "",
              player2Url: ep.player2Url || "",
              player3Url: ep.player3Url || "",
              player3Working: ep.player3Working || false,
              player4Url: ep.player4Url || "",
              subtitleUrl: ep.subtitleUrl || "",
              subtitleVtt: ep.subtitleVtt || "",
              subtitleDownloadUrl: ep.subtitleDownloadUrl || "",
              downloadTelegram: ep.downloadTelegram || "",
              downloadDirect: ep.downloadDirect || "",
              downloadTorrent: ep.downloadTorrent || "",
            })),
          })),
        );
      }
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGenreChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newGenres = [...prev.genres];
      newGenres[index] = value;
      return { ...prev, genres: newGenres };
    });
  };

  const handleAddSeason = () => {
    setSeasons((prev) => [
      ...prev,
      { seasonNumber: prev.length + 1, episodes: [] },
    ]);
  };

  const handleAddEpisode = (seasonIndex: number) => {
    setSeasons((prev) => {
      const newSeasons = prev.map((s, idx) => {
        if (idx !== seasonIndex) return s;
        return {
          ...s,
          episodes: [
            ...s.episodes,
            {
              title: `Episode ${s.episodes.length + 1}`,
              episodeNumber: s.episodes.length + 1,
              releaseDate: "",
              videoUrl: "",
              player2Url: "",
              player3Url: "",
              player4Url: "",
              subtitleUrl: "",
              subtitleVtt: "",
              subtitleDownloadUrl: "",
              downloadTelegram: "",
              downloadDirect: "",
              downloadTorrent: "",
            }
          ]
        };
      });
      return newSeasons;
    });
  };

  const handleRemoveSeason = (seasonIndex: number) => {
    setSeasons((prev) => prev.filter((_, i) => i !== seasonIndex));
  };

  const handleRemoveEpisode = (seasonIndex: number, episodeIndex: number) => {
    setSeasons((prev) => {
      return prev.map((s, sIdx) => {
        if (sIdx !== seasonIndex) return s;
        const newEpisodes = s.episodes
          .filter((_, i) => i !== episodeIndex)
          .map((ep, idx) => ({ ...ep, episodeNumber: idx + 1 }));
        return { ...s, episodes: newEpisodes };
      });
    });
  };

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isTMDBFetching, setIsTMDBFetching] = useState(false);
  const [rawDescription, setRawDescription] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [isOptimizingDesc, setIsOptimizingDesc] = useState(false);

  const handleTMDBFetch = async () => {
    if (!formData.title) {
      toast.error('Please enter a title first to fetch from TMDB');
      return;
    }

    let tmdbApiKey = localStorage.getItem("tmdbApiKey");
    if (!tmdbApiKey) {
      toast.error("TMDB API Key is missing. Please add it in the Settings panel.");
      return;
    }

    setIsTMDBFetching(true);
    const toastId = toast.loading('Fetching details from TMDB...');

    try {
      const type = formData.type === "MOVIE" ? "movie" : "tv";
      const searchRes = await fetch(`https://api.themoviedb.org/3/search/${type}?query=${encodeURIComponent(formData.title)}&api_key=${tmdbApiKey}`);
      const searchData = await searchRes.json();

      if (searchData.status_message) {
        throw new Error(searchData.status_message);
      }

      if (!searchData.results || searchData.results.length === 0) {
        throw new Error("No results found for this title");
      }

      const itemInfo = searchData.results[0];
      const detailsRes = await fetch(`https://api.themoviedb.org/3/${type}/${itemInfo.id}?append_to_response=credits&api_key=${tmdbApiKey}`);
      const detailsData = await detailsRes.json();

      setFormData(prev => {
        const newData = { ...prev };
        if (detailsData.title || detailsData.name) newData.title = detailsData.title || detailsData.name;
        if (detailsData.release_date || detailsData.first_air_date) {
          newData.year = (detailsData.release_date || detailsData.first_air_date).substring(0,4);
        }
        if (detailsData.vote_average) newData.rating = detailsData.vote_average.toFixed(1);
        if (detailsData.genres && detailsData.genres.length > 0) {
          const fetchedGenres = detailsData.genres.map((g: any) => g.name);
          newData.genres = [
            fetchedGenres[0] || "",
            fetchedGenres[1] || "",
            fetchedGenres[2] || ""
          ];
        }
        if (detailsData.runtime || (detailsData.episode_run_time && detailsData.episode_run_time.length > 0)) {
          const runTimeMins = detailsData.runtime || detailsData.episode_run_time[0];
          const hours = Math.floor(runTimeMins / 60);
          const mins = runTimeMins % 60;
          newData.duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        }
        if (detailsData.overview) newData.description = detailsData.overview;
        if (detailsData.poster_path) newData.imageUrl = `https://image.tmdb.org/t/p/w500${detailsData.poster_path}`;
        if (detailsData.backdrop_path) newData.bannerUrl = `https://image.tmdb.org/t/p/w1280${detailsData.backdrop_path}`;
        if (detailsData.credits && detailsData.credits.cast && detailsData.credits.cast.length > 0) {
          newData.castString = detailsData.credits.cast.slice(0, 4).map((c: any) => c.name).join(", ");
        }
        return newData;
      });

      toast.success('TMDB details and images fetched successfully!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to fetch from TMDB: ' + err.message, { id: toastId });
    } finally {
      setIsTMDBFetching(false);
    }
  };

  const handleAIEnhance = async () => {
    if (!formData.title) {
      toast.error('Please enter a title first to use AI Auto-complete');
      return;
    }
    
    setIsEnhancing(true);
    const toastId = toast.loading('Generating details with AI...');
    
    try {
      const prompt = `Provide the details for the ${formData.type === "MOVIE" ? "movie" : "TV show"} titled "${formData.title}". Return only a JSON object matching the requested schema. Do not return markdown formatted code block. Just return pure JSON string. Please provide the 'description' in the Sinhala language.`;
      
      const textResult = await callGeminiApi(prompt, {
        type: "OBJECT",
        properties: {
          year: { type: "STRING", description: "Release year as a string" },
          rating: { type: "STRING", description: "IMDb rating as a string. (e.g. '8.5')" },
          genres: { type: "ARRAY", items: { type: "STRING" }, description: "Up to 3 genres as array of strings." },
          language: { type: "STRING", description: "Language. (e.g. 'English', 'Hindi', 'Tamil')" },
          network: { type: "STRING", description: "Original Network (e.g. 'Netflix', 'HBO', 'AMC'). Optional." },
          duration: { type: "STRING", description: "Duration (e.g. '2h 15m' or '45m/ep')" },
          castString: { type: "STRING", description: "Comma-separated list of 3 to 4 main cast members" },
          description: { type: "STRING", description: "A compelling, highly engaging, and SEO-optimized summary of the plot in the Sinhala language." }
        }
      });
      
      let aiDataStr = textResult || "{}";
      const aiData = JSON.parse(aiDataStr);
      
      setFormData(prev => {
        const newData = { ...prev };
        if (aiData.year && aiData.year !== "") newData.year = aiData.year;
        if (aiData.rating && aiData.rating !== "") newData.rating = aiData.rating;
        if (aiData.genres && Array.isArray(aiData.genres)) {
          newData.genres = [
            aiData.genres[0] || "",
            aiData.genres[1] || "",
            aiData.genres[2] || ""
          ];
        }
        if (aiData.language && aiData.language !== "") newData.language = aiData.language;
        if (aiData.network && aiData.network !== "") newData.network = aiData.network;
        if (aiData.duration && aiData.duration !== "") newData.duration = aiData.duration;
        if (aiData.castString && aiData.castString !== "") newData.castString = aiData.castString;
        if (aiData.description && aiData.description !== "") newData.description = aiData.description;
        return newData;
      });
      
      toast.success('Fields populated with AI!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to generate AI data: ' + err.message, { id: toastId });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleOptimizeDescription = async () => {
    if (!rawDescription) {
      toast.error('Please enter a raw description first to optimize.');
      return;
    }

    setIsOptimizingDesc(true);
    const toastId = toast.loading('Optimizing description with AI...');

    try {
      const prompt = `You are a professional film/TV show SEO content writer. 
Improve and SEO-optimize the following description in Sinhala. Do not artificially shorten it; keep all important details while making it highly engaging, professionally written, and structured for better readability.
Important instructions:
1. Make the writing style compelling, fluent, and attractive to Sri Lankan audiences.
2. Must naturally and effectively incorporate the following target keyword(s) for SEO without keyword stuffing: "${targetKeywords || 'watch online free, sinhala subtitles'}". 
3. The response should be primarily in Sinhala, keeping English text mostly for names or technical keywords.
4. Output ONLY a raw JSON object containing a property 'optimizedDescription' with the resulting text string. No markdown code blocks, no extra text.

Raw Description:
${rawDescription}`;
      
      const textResult = await callGeminiApi(prompt, {
        type: "OBJECT",
        properties: {
          optimizedDescription: { type: "STRING", description: "The highly engaging, SEO-optimized description text in Sinhala" }
        }
      });
      
      const aiData = JSON.parse(textResult || "{}");
      if (aiData.optimizedDescription) {
        setFormData(prev => ({ ...prev, description: aiData.optimizedDescription }));
        setRawDescription("");
        setTargetKeywords("");
        toast.success('Description optimized and added!', { id: toastId });
      } else {
        toast.error('Failed to parse optimized description', { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to optimize description: ' + err.message, { id: toastId });
    } finally {
      setIsOptimizingDesc(false);
    }
  };

  const [uploadingImage, setUploadingImage] = useState<"imageUrl" | "bannerUrl" | null>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "imageUrl" | "bannerUrl"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(field);
      const toastId = toast.loading("Compressing and converting to WebP...");
      try {
        const url = await uploadImageFile(file);
        setFormData((prev) => ({ ...prev, [field]: url }));
        toast.success("Image auto-compressed and uploaded in WebP format!", { id: toastId });
      } catch (err: any) {
        toast.error("Failed to upload image.", { id: toastId });
      } finally {
        setUploadingImage(null);
        e.target.value = "";
      }
    }
  };

  const [uploadingSubtitleFor, setUploadingSubtitleFor] = useState<string | null>(null);

  const handleSubtitleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (text: string) => void,
    id: string = 'movie'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".srt") && !file.name.endsWith(".vtt")) {
      toast.error("Only .srt and .vtt files are supported for subtitles");
      return;
    }

    setUploadingSubtitleFor(id);

    try {
      let vttText = "";
      if (file.name.endsWith(".srt")) {
        const text = await file.text();
        vttText = "WEBVTT\n\n" + text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
      } else {
        const text = await file.text();
        if (!text.trim().startsWith("WEBVTT")) {
          vttText = "WEBVTT\n\n" + text;
        } else {
          vttText = text;
        }
      }

      callback(vttText);
      toast.success("Subtitle processed and loaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process subtitle.");
    } finally {
      setUploadingSubtitleFor(null);
      e.target.value = "";
    }
  };

  const handleEpisodeChange = (
    seasonIndex: number,
    episodeIndex: number,
    field: string,
    value: string | boolean,
  ) => {
    setSeasons((prev) => {
      return prev.map((s, sIdx) => {
        if (sIdx !== seasonIndex) return s;
        return {
          ...s,
          episodes: s.episodes.map((ep, eIdx) => {
            if (eIdx !== episodeIndex) return ep;
            return { ...ep, [field]: value };
          })
        };
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast.error("Title and Image URL are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!initialData?.id) {
        // Check for duplicate before adding
        const { data: duplicateSnap, error: dupError } = await supabase.from('media').select('id')
          .eq('type', formData.type)
          .eq('title', formData.title)
          .eq('year', formData.year)
          .limit(1);

        if (duplicateSnap && duplicateSnap.length > 0) {
          toast.error(`A ${formData.type === "MOVIE" ? "Movie" : "TV Show"} with this title and year already exists.`);
          setIsSubmitting(false);
          return;
        }
      }

      const baseName = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const isKorean = formData.genres?.includes('Korean');
      
      let slug = `${baseName}-${formData.year || ''}-sinhala-subtitles`.replace(/^-|-$/g, '').replace(/-+/g, '-');

      const itemToSave = Object.fromEntries(
        Object.entries(formData).filter(
          ([key, value]) => key !== "castString" && key !== "keywordsString" && key !== "genres",
        ),
      ) as any;
      
      itemToSave.slug = slug;
      
      const filteredGenres = formData.genres.map(g => g.trim()).filter(Boolean);
      itemToSave.genre = filteredGenres[0] || ""; // For backward combatibility queries
      itemToSave.genres = filteredGenres;

      if (formData.castString.trim()) {
        itemToSave.castList = formData.castString
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "");
      }

      if (formData.keywordsString.trim()) {
        itemToSave.keywords = formData.keywordsString
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "");
      }

      if (formData.type === "TV") {
        itemToSave.seasons = seasons;
        if (seasons.some(s => s.episodes.some(e => e.videoUrl?.trim()))) {
          itemToSave.isUpcoming = false;
        }
      } else {
        if (formData.videoUrl?.trim()) {
          itemToSave.isUpcoming = false;
        }
      }

      if (initialData?.id) {
        await updateMediaItem(initialData.id, itemToSave);
        toast.success("Media item updated successfully!");
      } else {
        await saveMediaItem(itemToSave);
        toast.success("Media item added successfully!");
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save media item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-lg text-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:bg-white/10 transition-colors";
  const labelClass =
    "text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block";

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-white">
            {initialData ? "Edit Media Item" : "Add New Media"}
          </h2>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-lg shadow-brand-900/20"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl">
        <form className="flex flex-col gap-8">
          {/* Quick Toggles */}
          <div className="flex flex-wrap gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 accent-brand-600 rounded bg-white/10 border-white/20"
              />
              <span className="text-sm font-bold text-white">Featured</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="trending"
                checked={formData.trending}
                onChange={handleChange}
                className="w-5 h-5 accent-brand-600 rounded bg-white/10 border-white/20"
              />
              <span className="text-sm font-bold text-white">Trending</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isUpcoming"
                checked={formData.isUpcoming}
                onChange={handleChange}
                className="w-5 h-5 accent-yellow-500 rounded bg-white/10 border-white/20"
              />
              <span className="text-sm font-bold text-white">Upcoming</span>
            </label>
            <div className="h-6 w-px bg-white/10"></div>
            <label className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">Status:</span>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="appearance-none bg-white/10 border border-white/20 rounded pl-3 pr-8 py-1 font-bold text-sm outline-none text-white focus:border-brand-500"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col md:col-span-2">
              <label className={labelClass}>Title *</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`${inputClass} flex-grow`}
                  placeholder="e.g. Inception"
                  required
                />
                <button
                  type="button"
                  onClick={handleAIEnhance}
                  disabled={isEnhancing || !formData.title}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 border border-purple-500/50"
                  title="Generate details automatically with AI based on the Title"
                >
                  {isEnhancing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {isEnhancing ? "Loading..." : "AI Auto-fill"}
                </button>
                <button
                  type="button"
                  onClick={handleTMDBFetch}
                  disabled={isTMDBFetching || !formData.title}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 border border-blue-500/50"
                  title="Fetch details and high-quality images from TMDB"
                >
                  {isTMDBFetching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Database className="w-5 h-5" />
                  )}
                  {isTMDBFetching ? "Loading..." : "TMDB Auto-fetch"}
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Type *</label>
              <div className="relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none pr-10`}
                  required
                  disabled={!!initialData}
                >
                  <option value="MOVIE">Movie</option>
                  <option value="TV">TV Series</option>
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>
                Thumbnail Image URL * (Portrait)
              </label>
              <div className="relative flex items-center mb-2">
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://..."
                  required
                />
                <label className={`absolute right-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded cursor-pointer text-xs font-bold transition-colors ${uploadingImage === "imageUrl" ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploadingImage === "imageUrl" ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "imageUrl")}
                    disabled={!!uploadingImage}
                  />
                </label>
              </div>
              <input
                type="text"
                name="imageAlt"
                value={formData.imageAlt || ""}
                onChange={handleChange}
                className={`${inputClass} mt-1`}
                placeholder="Thumbnail Image Alt Text (e.g. Inception Movie Poster)"
              />
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Banner Image URL (Landscape)</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="bannerUrl"
                  value={formData.bannerUrl}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://..."
                />
                <label className={`absolute right-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded cursor-pointer text-xs font-bold transition-colors ${uploadingImage === "bannerUrl" ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploadingImage === "bannerUrl" ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "bannerUrl")}
                    disabled={!!uploadingImage}
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className={labelClass}>Trailer Video URL (YouTube)</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="trailerUrl"
                  value={formData.trailerUrl}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Year</label>
              <div className="relative">
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">Select Year...</option>
                  {Array.from(
                    { length: 50 },
                    (_, i) => new Date().getFullYear() - i,
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Rating (IMDb)</label>
              <div className="relative">
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">Select Rating...</option>
                  {Array.from({ length: 91 }, (_, i) =>
                    (10 - i * 0.1).toFixed(1),
                  ).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className={labelClass}>Genres (Up to 3)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="relative">
                    <select
                      value={formData.genres[idx] || ""}
                      onChange={(e) => handleGenreChange(idx, e.target.value)}
                      className={`${inputClass} appearance-none pr-10`}
                    >
                      <option value="">{idx === 0 ? "Select Primary Genre..." : "Select Genre..."}</option>
                      {[
                        { id: "Action", name: "ක්‍රියාදාම (Action)" },
                        { id: "Adventure", name: "වීර චාරිකා (Adventure)" },
                        { id: "Animation", name: "ඇනිමේෂන් (Animation)" },
                        { id: "Comedy", name: "හාස්‍යජනක (Comedy)" },
                        { id: "Crime", name: "අපරාධ (Crime)" },
                        { id: "Documentary", name: "වාර්තාමය (Documentary)" },
                        { id: "Drama", name: "නාට්‍යමය (Drama)" },
                        { id: "Family", name: "පවුලේ (Family)" },
                        { id: "Fantasy", name: "මනස්කල්පිත (Fantasy)" },
                        { id: "Ghost", name: "හොල්මන් (Ghost)" },
                        { id: "History", name: "ඉතිහාස (History)" },
                        { id: "Horror", name: "භයානක (Horror)" },
                        { id: "Music", name: "සංගීත (Music)" },
                        { id: "Mystery", name: "අභිරහස් (Mystery)" },
                        { id: "Romance", name: "ආදර කතා (Romance)" },
                        { id: "Sci-Fi", name: "විද්‍යා ප්‍රබන්ධ (Sci-Fi)" },
                        { id: "Sports", name: "ක්‍රීඩා (Sports)" },
                        { id: "Thriller", name: "ත්‍රාසජනක (Thriller)" },
                        { id: "War", name: "යුධමය (War)" },
                        { id: "Western", name: "බටහිර (Western)" }
                      ].map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Quality</label>
              <div className="relative">
                <select
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="HD">HD</option>
                  <option value="CAM">CAM</option>
                  <option value="4K">4K</option>
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Language</label>
              <div className="relative">
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">Select Language...</option>
                  {[
                    "English",
                    "Hindi",
                    "Korean",
                    "Chinese",
                    "Japanese",
                    "Thai",
                    "Telugu",
                    "Tamil",
                    "Kannada",
                    "Malayalam",
                    "Spanish",
                    "French",
                    "German",
                    "Sinhala",
                    "Other",
                  ].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Network</label>
              <div className="relative">
                <select
                  name="network"
                  value={formData.network}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">Select Network...</option>
                  {[
                    "Netflix",
                    "HBO",
                    "Amazon Prime",
                    "Hulu",
                    "Disney+",
                    "Apple TV+",
                    "AMC",
                    "BBC",
                    "Paramount+",
                    "Peacock",
                    "Showtime",
                    "Starz",
                    "The CW",
                    "Other",
                  ].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className={labelClass}>
                Duration (e.g. 2h 30m / 120 min)
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 1h 45m"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className={labelClass}>
                Completed Season Tag (e.g. S01 COMPLETE)
              </label>
              <input
                type="text"
                name="completedSeasonTag"
                value={formData.completedSeasonTag}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. S01 COMPLETE"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className={labelClass}>Cast (Comma Separated)</label>
              <input
                type="text"
                name="castString"
                value={formData.castString}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Leonardo DiCaprio, Joseph Gordon-Levitt"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`${inputClass} min-h-[120px] resize-y`}
                placeholder="Movie or TV Show description..."
              />
            </div>

            <div className="flex flex-col md:col-span-2 border border-brand-900/40 bg-brand-900/10 rounded-xl p-6 space-y-4 shadow-[0_0_15px_rgba(220,38,38,0.05)]">
              <h3 className="text-lg font-bold text-white mb-2">Download Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Telegram Link</label>
                  <input
                    type="url"
                    name="downloadTelegram"
                    value={formData.downloadTelegram}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://t.me/..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Subtitle Download URL</label>
                  <input
                    type="url"
                    name="subtitleDownloadUrl"
                    value={formData.subtitleDownloadUrl}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://baiscope.lk/..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Direct Link</label>
                  <input
                    type="url"
                    name="downloadDirect"
                    value={formData.downloadDirect}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Torrent Link</label>
                  <input
                    type="url"
                    name="downloadTorrent"
                    value={formData.downloadTorrent}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="magnet:?xt=urn:btih:..."
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mt-4 mb-2">Quality Links (Legacy)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>480p Link</label>
                  <input
                    type="url"
                    name="downloadLink480p"
                    value={formData.downloadLink480p}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className={labelClass}>720p Link</label>
                  <input
                    type="url"
                    name="downloadLink720p"
                    value={formData.downloadLink720p}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className={labelClass}>1080p Link</label>
                  <input
                    type="url"
                    name="downloadLink1080p"
                    value={formData.downloadLink1080p}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:col-span-2 border border-gray-700/50 rounded-lg p-4 bg-[#111] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  AI Description Optimizer
                </label>
                <p className="text-xs text-gray-500">Paste description to enhance and SEO optimize</p>
              </div>
              
              <textarea
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                className={`${inputClass} min-h-[100px] text-sm`}
                placeholder="Paste the raw, lengthy description here..."
              />
              
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-grow w-full">
                  <label className="block text-xs text-gray-400 mb-1">Target Keywords</label>
                  <input
                    type="text"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                    className={`${inputClass} text-sm`}
                    placeholder="e.g. watch online free, sinhala subtitle"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleOptimizeDescription}
                  disabled={isOptimizingDesc || !rawDescription}
                  className="w-full sm:w-auto px-4 py-2 bg-[#222] hover:bg-[#333] border border-gray-700 text-white rounded font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isOptimizingDesc ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  )}
                  {isOptimizingDesc ? "Optimizing..." : "Enhance & Optimize"}
                </button>
              </div>
            </div>

            {formData.type === "MOVIE" && (
              <div className="flex flex-col md:col-span-2 p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Player 1 URL (Primary)</label>
                    <input
                      type="text"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Player 2 URL (Streamtape)</label>
                    <input
                      type="text"
                      name="player2Url"
                      value={formData.player2Url || ""}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Player 3 URL (Doodstream)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="player3Url"
                        value={formData.player3Url || ""}
                        onChange={handleChange}
                        className={`${inputClass} flex-1`}
                        placeholder="https://..."
                      />
                      <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 px-4 rounded-lg text-sm font-bold text-gray-300 hover:bg-white/10 transition-colors whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          name="player3Working"
                          checked={formData.player3Working || false} 
                          onChange={(e) => setFormData(prev => ({ ...prev, player3Working: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-600 outline-none"
                        />
                        Working
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Player 4 URL (Mixdrop)</label>
                    <input
                      type="text"
                      name="player4Url"
                      value={formData.player4Url || ""}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    Subtitle URL (.vtt / .srt)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="subtitleUrl"
                      value={formData.subtitleUrl}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://..."
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                       {formData.subtitleUrl === "LOCAL_SUBTITLE_UPLOADED" && formData.subtitleVtt && (
                          <button
                            type="button"
                            onClick={() => setEditingSubtitle({ id: 'movie', text: formData.subtitleVtt })}
                            className="bg-brand-600 hover:bg-brand-500 text-white p-1.5 rounded"
                            title="Edit Subtitle"
                          >
                             <Edit className="w-4 h-4" />
                          </button>
                       )}
                      <label
                        className={`bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded cursor-pointer text-xs font-bold transition-colors ${uploadingSubtitleFor === 'movie' ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        {uploadingSubtitleFor === 'movie' ? (
                          <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                        ) : null}
                        Upload
                        <input
                          type="file"
                          accept=".srt,.vtt"
                          className="hidden"
                          onChange={(e) =>
                            handleSubtitleUpload(e, (text) =>
                              setFormData((prev) => ({
                                ...prev,
                                subtitleVtt: text,
                                subtitleUrl: "LOCAL_SUBTITLE_UPLOADED",
                              })),
                              'movie'
                            )
                          }
                          disabled={uploadingSubtitleFor === 'movie'}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {formData.type === "TV" && (
            <div className="mt-8 border-t border-white/10 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    Seasons & Episodes
                  </h4>
                  <p className="text-sm text-gray-400">
                    Manage structure and video URLs for episodes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSeason}
                  className="flex items-center gap-2 font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition"
                >
                  <Plus className="w-4 h-4" />
                  ADD SEASON
                </button>
              </div>

              <div className="flex flex-col gap-8">
                {seasons.map((season, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-gray-900/50 border border-white/5 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                      <h5 className="text-lg font-bold text-white">
                        Season {season.seasonNumber}
                      </h5>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleAddEpisode(sIdx)}
                          className="flex items-center gap-2 text-xs font-bold bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 px-3 py-1.5 rounded-full transition"
                        >
                          <Plus className="w-3 h-3" />
                          ADD EPISODE
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSeason(sIdx)}
                          className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-500/10 rounded-full transition-colors"
                          title="Remove Season"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {season.episodes.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {season.episodes.map((ep, eIdx) => (
                          <div
                            key={eIdx}
                            className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white/5 p-4 rounded-lg border border-white/5"
                          >
                            <div className="w-12 shrink-0 text-sm font-bold text-gray-500">
                              E{ep.episodeNumber}
                            </div>
                            <div className="flex-grow flex flex-col gap-4 w-full">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                <input
                                  type="text"
                                  value={ep.title}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  className={inputClass}
                                  placeholder="Episode Title"
                                />
                                <input
                                  type="text"
                                  value={ep.releaseDate || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "releaseDate",
                                      e.target.value,
                                    )
                                  }
                                  className={inputClass}
                                  placeholder="Release Date"
                                />
                                <input
                                  type="text"
                                  value={ep.videoUrl || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "videoUrl",
                                      e.target.value,
                                    )
                                  }
                                  className={inputClass}
                                  placeholder="Player 1 URL (Primary)"
                                />
                                <div className="relative flex items-center justify-between col-span-full md:col-span-1 lg:col-span-1">
                                  <div className="relative flex-grow flex items-center">
                                    <input
                                      type="text"
                                      value={ep.subtitleUrl || ""}
                                      onChange={(e) =>
                                        handleEpisodeChange(
                                          sIdx,
                                          eIdx,
                                          "subtitleUrl",
                                          e.target.value,
                                        )
                                      }
                                      className={`${inputClass} pr-20`}
                                      placeholder="Subtitle URL"
                                    />
                                    <div className="absolute right-2 flex items-center gap-2">
                                       {ep.subtitleUrl === "LOCAL_SUBTITLE_UPLOADED" && ep.subtitleVtt && (
                                          <button
                                            type="button"
                                            onClick={() => setEditingSubtitle({ id: `${sIdx}-${eIdx}`, text: ep.subtitleVtt! })}
                                            className="bg-brand-600 hover:bg-brand-500 text-white p-1.5 rounded"
                                            title="Edit Subtitle"
                                          >
                                             <Edit className="w-3 h-3" />
                                          </button>
                                       )}
                                      <label
                                        className={`bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded cursor-pointer text-[10px] uppercase font-bold transition-colors ${uploadingSubtitleFor === `${sIdx}-${eIdx}` ? "opacity-50 pointer-events-none" : ""}`}
                                      >
                                        {uploadingSubtitleFor === `${sIdx}-${eIdx}` ? (
                                          <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                                        ) : null}
                                        Upload
                                        <input
                                          type="file"
                                          accept=".srt,.vtt"
                                          className="hidden"
                                          onChange={(e) =>
                                            handleSubtitleUpload(e, (text) => {
                                              handleEpisodeChange(
                                                sIdx,
                                                eIdx,
                                                "subtitleVtt",
                                                text,
                                              );
                                              handleEpisodeChange(
                                                sIdx,
                                                eIdx,
                                                "subtitleUrl",
                                                "LOCAL_SUBTITLE_UPLOADED",
                                              );
                                            }, `${sIdx}-${eIdx}`)
                                          }
                                          disabled={uploadingSubtitleFor === `${sIdx}-${eIdx}`}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEpisode(sIdx, eIdx)}
                                    className="ml-4 shrink-0 p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-500/10 rounded-md transition-colors"
                                    title="Remove Episode"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                <input
                                  type="text"
                                  value={ep.player2Url || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "player2Url",
                                      e.target.value,
                                    )
                                  }
                                  className={inputClass}
                                  placeholder="Player 2 (Streamtape)"
                                />
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={ep.player3Url || ""}
                                    onChange={(e) =>
                                      handleEpisodeChange(
                                        sIdx,
                                        eIdx,
                                        "player3Url",
                                        e.target.value,
                                      )
                                    }
                                    className={`${inputClass} flex-1`}
                                    placeholder="Player 3 (Doodstream)"
                                  />
                                  <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 px-3 rounded-lg text-sm font-bold text-gray-300 hover:bg-white/10 transition-colors whitespace-nowrap">
                                    <input 
                                      type="checkbox" 
                                      checked={ep.player3Working || false} 
                                      onChange={(e) =>
                                        handleEpisodeChange(
                                          sIdx,
                                          eIdx,
                                          "player3Working",
                                          e.target.checked,
                                        )
                                      }
                                      className="w-4 h-4 rounded border-gray-600 outline-none"
                                    />
                                    Working
                                  </label>
                                </div>
                                <input
                                  type="text"
                                  value={ep.player4Url || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "player4Url",
                                      e.target.value,
                                    )
                                  }
                                  className={inputClass}
                                  placeholder="Player 4 (Mixdrop)"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                <input
                                  type="text"
                                  value={ep.downloadTelegram || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "downloadTelegram",
                                      e.target.value,
                                    )
                                  }
                                  className={`${inputClass} !bg-brand-900/10 !border-brand-900/40`}
                                  placeholder="Telegram Download Link"
                                />
                                <input
                                  type="text"
                                  value={ep.downloadDirect || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "downloadDirect",
                                      e.target.value,
                                    )
                                  }
                                  className={`${inputClass} !bg-brand-900/10 !border-brand-900/40`}
                                  placeholder="Direct Download Link"
                                />
                                <input
                                  type="text"
                                  value={ep.downloadTorrent || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "downloadTorrent",
                                      e.target.value,
                                    )
                                  }
                                  className={`${inputClass} !bg-brand-900/10 !border-brand-900/40`}
                                  placeholder="Torrent Download Link"
                                />
                                <input
                                  type="text"
                                  value={ep.subtitleDownloadUrl || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "subtitleDownloadUrl",
                                      e.target.value,
                                    )
                                  }
                                  className={`${inputClass} !bg-brand-900/10 !border-brand-900/40`}
                                  placeholder="Subtitle Download URL (e.g. baiscope, zoom)"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                <input
                                  type="text"
                                  value={ep.downloadLink480p || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "downloadLink480p",
                                      e.target.value,
                                    )
                                  }
                                  className={`${inputClass} !bg-brand-900/10 !border-brand-900/40`}
                                  placeholder="480p Download Link"
                                />
                                <input
                                  type="text"
                                  value={ep.downloadLink720p || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "downloadLink720p",
                                      e.target.value,
                                    )
                                  }
                                  className={`${inputClass} !bg-brand-900/10 !border-brand-900/40`}
                                  placeholder="720p Download Link"
                                />
                                <input
                                  type="text"
                                  value={ep.downloadLink1080p || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      sIdx,
                                      eIdx,
                                      "downloadLink1080p",
                                      e.target.value,
                                    )
                                  }
                                  className={`${inputClass} !bg-brand-900/10 !border-brand-900/40`}
                                  placeholder="1080p Download Link"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic p-4 text-center border border-dashed border-white/10 rounded-lg">
                        No episodes added to this season yet.
                      </div>
                    )}
                  </div>
                ))}
                {seasons.length === 0 && (
                  <div className="text-center p-8 text-gray-500 font-medium">
                    No seasons created yet. Click "Add Season" to start.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-white/10 pt-8">
            <h4 className="text-xl font-bold text-white mb-6">SEO & Content Optimization</h4>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col">
                <label className={labelClass}>
                  Meta Title <span className="text-gray-500 font-normal lowercase">(Optional, overrides default title)</span>
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={`e.g. Watch ${formData.title} Online Free`}
                />
              </div>

              <div className="flex flex-col">
                <label className={labelClass}>
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription || ""}
                  onChange={handleChange}
                  className={`${inputClass} min-h-[100px] resize-y`}
                  placeholder="Enter a compelling meta description for search engines... Keep it under 160 characters for best results."
                />
                <div className="text-right text-xs mt-1 text-gray-500">
                  {formData.metaDescription?.length || 0} / 160
                </div>
              </div>

              <div className="flex flex-col">
                <label className={labelClass}>
                  Keywords <span className="text-gray-500 font-normal lowercase">(Comma Separated)</span>
                </label>
                <input
                  type="text"
                  name="keywordsString"
                  value={formData.keywordsString || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. sinhala sub, movie format, free watch..."
                />
              </div>

              <div className="flex flex-col">
                <label className={labelClass}>
                  Formatted Article Content <span className="text-gray-500 font-normal lowercase">(H1, H2, H3, Links allowed. Use HTML or Markdown format in the main description above for advanced formatting)</span>
                </label>
                <div className="text-sm text-brand-400 bg-brand-900/20 border border-brand-900 md:col-span-2 rounded p-4">
                  <strong>Tip:</strong> The main <strong>Description</strong> field above supports full Markdown and HTML! You can use {'<h1>'}, {'<h2>'}, or `# Heading 1`, `## Heading 2` to structure your page for search engines. This is fully SEO optimized.
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {editingSubtitle && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111] border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a] rounded-t-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-brand-400" />
                Edit Subtitle (VTT Format)
              </h3>
              <button onClick={() => setEditingSubtitle(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 flex-grow overflow-hidden flex flex-col h-[60vh]">
                <textarea
                  className="w-full h-full bg-[#0a0a0a] text-gray-300 font-mono text-xs sm:text-sm p-4 border border-gray-800 rounded-lg resize-none focus:outline-none focus:border-brand-500/50 flex-grow"
                  value={editingSubtitle.text}
                  onChange={(e) => setEditingSubtitle({ ...editingSubtitle, text: e.target.value })}
                  placeholder="WEBVTT..."
                  spellCheck="false"
                />
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-[#1a1a1a] rounded-b-xl">
              <button 
                onClick={() => setEditingSubtitle(null)} 
                className="px-4 py-2 hover:bg-gray-800 rounded text-gray-300 font-medium transition-colors"
               >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (editingSubtitle.id === 'movie') {
                      setFormData(prev => ({ ...prev, subtitleVtt: editingSubtitle.text }));
                  } else {
                      const [sIdx, eIdx] = editingSubtitle.id.split('-').map(Number);
                      handleEpisodeChange(sIdx, eIdx, 'subtitleVtt', editingSubtitle.text);
                  }
                  setEditingSubtitle(null);
                  toast.success("Subtitle updated!");
                }} 
                className="px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded text-white font-bold flex items-center gap-2 transition-colors shadow-lg shadow-brand-500/20"
               >
                 <Save className="w-4 h-4" /> Save Subtitle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface Episode {
  title: string;
  episodeNumber: number;
  releaseDate?: string;
  videoUrl?: string;
  player2Url?: string;
  player3Url?: string;
  player3Working?: boolean;
  player4Url?: string;
  subtitleUrl?: string;
  subtitleVtt?: string;
  subtitleDownloadUrl?: string;
  thumbnailUrl?: string;
  downloadTelegram?: string;
  downloadDirect?: string;
  downloadTorrent?: string;
  downloadLink480p?: string;
  downloadLink720p?: string;
  downloadLink1080p?: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface MediaItem {
  id: string;
  title: string;
  year: string;
  duration?: string;
  rating: string;
  quality: string;
  type: "MOVIE" | "TV";
  imageUrl: string;
  imageAlt?: string;
  bannerUrl?: string;
  genre?: string;
  genres?: string[];
  country?: string;
  language?: string;
  network?: string;
  description?: string;
  castList?: string[];
  seasons?: Season[];
  completedSeasonTag?: string;
  videoUrl?: string;
  player2Url?: string;
  player3Url?: string;
  player3Working?: boolean;
  player4Url?: string;
  subtitleUrl?: string;
  subtitleVtt?: string;
  subtitleDownloadUrl?: string;
  downloadLink480p?: string;
  downloadLink720p?: string;
  downloadLink1080p?: string;
  featured?: boolean;
  trending?: boolean;
  isUpcoming?: boolean;
  status?: "Published" | "Draft";
  slug?: string;
  createdAt?: any;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  schemaMarkup?: string;
  trailerUrl?: string;
  downloadTelegram?: string;
  downloadDirect?: string;
  downloadTorrent?: string;
}

export interface MediaCollection {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  mediaIds: string[];
  type?: "REGULAR" | "CAST";
  createdAt?: any;
}

export type ViewState =
  | "home"
  | "discover"
  | "movies"
  | "tv-series"
  | "genres"
  | "watch"
  | "admin"
  | "watchlist"
  | "collections"
  | "collection-details"
  | "cast-collections"
  | "cast-details";

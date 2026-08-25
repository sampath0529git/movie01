import { MediaItem } from "./types";

export const generateMockMedia = (
  count: number,
  type: "MOVIE" | "TV" = "MOVIE",
  seedPrefix = "a",
): MediaItem[] => {
  const titlesMovies = [
    "I Am Frankelda",
    "Last Train to Fortune",
    "Beast",
    "Remarkably Bright Creatures",
    "No Place to Be Single",
    "The Shrinking Man",
    "My Dearest Assassin",
    "You Can't Win",
    "From Within",
    "Mortal Kombat 2",
    "The Drama",
    "TenSura Movie",
    "Love in Curaçao",
    "Panda Plan",
    "Normal",
    "Hokum",
    "Amrum",
    "Deep Water",
    "Busboys",
  ];

  const titlesTv = [
    "Legends",
    "Man on Fire",
    "Should I Marry A Murderer?",
    "The House of the Spirits",
    "If Wishes Could Kill",
    "Absolute Value of Romance",
    "Half Man",
    "Stranger Things",
    "Flunked",
    "Unchosen",
    "Ronaldinho",
    "Someone Has to Die",
    "Euphoria",
    "The Miniature Wife",
    "Trust Me",
    "Big Mistakes",
  ];

  const titles = type === "MOVIE" ? titlesMovies : titlesTv;

  const genres = [
    "Action",
    "Comedy",
    "Drama",
    "Romance",
    "Sci-Fi",
    "Horror",
    "Thriller",
  ];
  const networks = [
    "Netflix",
    "Amazon",
    "Disney",
    "HBO Max",
    "Apple TV",
    "Hulu",
  ];

  return Array.from({ length: count }).map((_, i) => ({
    id: `${type}-${i}`,
    title: titles[i % titles.length],
    year: ["2026", "2025", "2024", "2019", "2005"][i % 5],
    duration: type === "MOVIE" ? `${80 + (i % 60)} min` : undefined,
    rating: (4 + (i % 6) + (i % 10) * 0.1).toFixed(1),
    quality: i % 7 === 0 ? "CAM" : "HD",
    type,
    // Add slightly different formatting parameters for picsum to get different image sets
    imageUrl: `https://picsum.photos/seed/${seedPrefix}${i}/300/450`,
    genre: genres[i % genres.length],
    network: networks[i % networks.length],
    description: `A thrilling adventure following the deeply compelling story of ${titles[i % titles.length]}. It brings unexpected twists and powerful drama.`,
  }));
};

export const discoverMovies = generateMockMedia(12, "MOVIE", "discoverM");
export const latestMovies = generateMockMedia(24, "MOVIE", "latestM");
export const latestTv = generateMockMedia(24, "TV", "latestT");

export const latestEpisodes = Array.from({ length: 8 }).map((_, i) => ({
  id: `ep-${i}`,
  showTitle: [
    "High Tides",
    "Legends",
    "The Chestnut Man",
    "Hacks",
    "Citadel",
    "Worst Ex Ever",
    "The House of the Spirits",
    "The Testaments",
    "The Boys",
    "Half Man",
    "Daredevil: Born Again",
    "Star Wars: Maul",
  ][i],
  episodeText: `Episode ${1 + (i % 10)}, Season ${1 + (i % 3)}`,
  date: `0${1 + (i % 9)} MAY 2026`,
  imageUrl: `https://picsum.photos/seed/ep${i}/400/225`,
}));

export const channelsData = [
  {
    name: "Netflix",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
  },
  {
    name: "Amazon Prime",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg",
    invert: true,
  },
  {
    name: "Disney+",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
  },
  {
    name: "HBO Max",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
  },
  {
    name: "Apple TV+",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg",
    invert: true,
  },
  {
    name: "Hulu",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/03/Hulu_logo_%282014%29.svg",
  },
  {
    name: "Peacock",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d3/NBCUniversal_Peacock_Logo.svg",
  },
  {
    name: "Paramount+",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg",
  },
  {
    name: "iQIYI",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/eb/IQiyi_logo.svg",
  },
  {
    name: "Tencent Video",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/en/2/2e/Tencent_Video.svg",
    invert: true,
  },
];

import Link from 'next/link';
import React from 'react';
import { MediaItem } from '../types';
import { ChevronRight } from 'lucide-react';


interface BreadcrumbsProps {
  item: MediaItem;
}

export default function Breadcrumbs({ item }: BreadcrumbsProps) {
  const isMovie = item.type === 'MOVIE';
  
  const language = item.language || "All";
  const primaryGenre = item.genres && item.genres.length > 0 ? item.genres[0] : (item.genre || "All");
  
  const basePath = isMovie ? '/movies' : '/tv-series';
  const languagePath = language !== "All" 
    ? `/category/${language.toLowerCase()}-${isMovie ? 'movies' : 'tv-shows'}` 
    : basePath;
  const itemTitle = `${item.title} ${item.year ? `(${item.year})` : ''}`;

  const langMatch = language !== "All" ? language : undefined;
  
  // Breadcrumb Schema Generation
  const itemListElement = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": typeof window !== 'undefined' ? window.location.origin : ""
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": isMovie ? "Movies" : "TV Series",
      "item": typeof window !== 'undefined' ? `${window.location.origin}${basePath}` : ""
    }
  ];

  let position = 3;

  if (langMatch) {
    itemListElement.push({
      "@type": "ListItem",
      "position": position,
      "name": `${langMatch} ${isMovie ? 'Movies' : 'TV Series'}`,
      "item": typeof window !== 'undefined' ? `${window.location.origin}${languagePath}` : ""
    });
    position++;
  }

  if (primaryGenre !== "All") {
    itemListElement.push({
      "@type": "ListItem",
      "position": position,
      "name": primaryGenre,
      "item": typeof window !== 'undefined' ? `${window.location.origin}/genre/${primaryGenre.toLowerCase()}` : ""
    });
    position++;
  }

  itemListElement.push({
    "@type": "ListItem",
    "position": position,
    "name": itemTitle,
    "item": typeof window !== 'undefined' ? window.location.href : ""
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement
  };

  return (
    <>
      
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      
      <nav aria-label="Breadcrumb" className="w-full max-w-6xl mb-4 text-sm text-gray-400">
        <ol className="flex items-center space-x-2 flex-wrap">
          <li>
            <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 mx-1" />
          </li>
          <li>
            <Link href={basePath} className="hover:text-brand-500 transition-colors">
              {isMovie ? 'Movies' : 'TV Series'}
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 mx-1" />
          </li>
          
          {langMatch && (
            <>
              <li>
                <Link href={languagePath} className="hover:text-brand-500 transition-colors">
                  {langMatch} {isMovie ? 'Movies' : 'TV Series'}
                </Link>
              </li>
              <li>
                <ChevronRight className="w-4 h-4 mx-1" />
              </li>
            </>
          )}

          {primaryGenre !== "All" && (
            <>
              <li>
                <Link href={`/genre/${primaryGenre.toLowerCase()}`} className="hover:text-brand-500 transition-colors">
                  {primaryGenre}
                </Link>
              </li>
              <li>
                <ChevronRight className="w-4 h-4 mx-1" />
              </li>
            </>
          )}

          <li className="text-gray-300 font-medium line-clamp-1" aria-current="page">
            {itemTitle}
          </li>
        </ol>
      </nav>
    </>
  );
}

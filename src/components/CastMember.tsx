"use client";
import React, { useState, useEffect } from 'react';

interface CastMemberProps {
  name: string;
}

export default function CastMember({ name }: CastMemberProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    const fetchImage = async () => {
      try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(name)}&format=json&pithumbsize=200&origin=*`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.query && data.query.pages) {
          const pages = data.query.pages;
          const firstPageId = Object.keys(pages)[0];
          if (firstPageId !== "-1" && pages[firstPageId].thumbnail) {
            if (mounted) {
              setImageUrl(pages[firstPageId].thumbnail.source);
            }
            return;
          }
        }
        
        // Sometimes people have "(actor)" in their wikipedia title if the name is common.
        // As a fallback, try to search with "(actor)"
        const urlActor = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(name + ' (actor)')}&format=json&pithumbsize=200&origin=*`;
        const responseActor = await fetch(urlActor);
        const dataActor = await responseActor.json();
        
        if (dataActor && dataActor.query && dataActor.query.pages) {
          const pages = dataActor.query.pages;
          const firstPageId = Object.keys(pages)[0];
          if (firstPageId !== "-1" && pages[firstPageId].thumbnail) {
            if (mounted) {
              setImageUrl(pages[firstPageId].thumbnail.source);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch cast image from Wikipedia", error);
      }
    };
    
    fetchImage();
    
    return () => {
      mounted = false;
    };
  }, [name]);

  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <div className="w-20 h-20 rounded-full bg-gray-800 overflow-hidden shadow-lg border border-[#385600]">
        <img
          src={imageUrl || fallbackUrl}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <span className="text-xs font-bold text-white text-center max-w-[80px]">
        {name}
      </span>
    </div>
  );
}

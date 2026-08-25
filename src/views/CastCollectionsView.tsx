"use client";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { MediaItem } from '../types';
import { useCollectionsData } from '../firebase';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface CastCollectionsViewProps {
  onSelectMedia: (item: MediaItem) => void;
}

export default function CastCollectionsView({ onSelectMedia }: CastCollectionsViewProps) {
  const { data: collections, loading } = useCollectionsData();
  const navigate = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const allCollections = collections || [];
  const castCollections = allCollections.filter(c => c.type === 'CAST');

  if (loading) {
    return (
      <div className="flex-grow max-w-[2000px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="h-10 bg-gray-900 rounded mx-auto w-64 mb-10 animate-pulse"></div>
        <div className="flex flex-col gap-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="h-8 bg-gray-900 rounded w-48 animate-pulse"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="rounded-xl overflow-hidden aspect-video bg-gray-900/50 block animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredCollections = castCollections.filter(c => {
    let matches = true;
    if (searchTerm) {
      matches = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (matches && activeLetter) {
      matches = c.title.toUpperCase().startsWith(activeLetter);
    }
    return matches;
  });

  if (castCollections.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="text-center flex flex-col items-center">
          <Users className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-2xl font-black text-gray-400">No Cast Profiles Found</h2>
          <p className="text-gray-500 mt-2">Check back later for actor profiles and their movies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16">
      <div className="space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Cast & Actors
          </h1>
          <p className="text-gray-400 text-lg">
            Browse all cast members by name or search for your favorites
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="relative flex items-center bg-[#1a1a1a] rounded-full overflow-hidden border border-brand-600/50 focus-within:border-brand-500 transition-colors">
            <input 
              type="text" 
              placeholder="Search cast members..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white px-6 py-4 outline-none placeholder-gray-500 font-medium"
            />
            <button className="bg-brand-600 hover:bg-brand-500 text-white p-4 px-8 h-full flex items-center justify-center transition-colors shrink-0">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 xl:p-8 shadow-inner shadow-black/50">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
               {ALPHABET.map(letter => (
                 <button
                   key={letter}
                   onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
                   className={`w-10 h-10 sm:w-12 sm:h-12 rounded text-sm sm:text-base font-bold flex items-center justify-center transition-all duration-200 ${
                     activeLetter === letter 
                       ? "bg-brand-600 text-white border border-brand-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] scale-105" 
                       : "bg-[#1f1f1f] border border-white/5 text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                   }`}
                 >
                   {letter}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 xl:gap-8 mt-8 md:mt-12">
        {filteredCollections.length > 0 ? (
          filteredCollections.map(collection => {
            const itemCount = collection.mediaIds?.length || 0;
            return (
              <div 
                key={collection.id} 
                onClick={() => navigate.push(`/cast/${collection.id}`)}
                className="flex flex-col items-center gap-3 sm:gap-4 cursor-pointer group"
              >
                <div className="w-full aspect-[4/5] sm:aspect-square rounded-xl sm:rounded-full overflow-hidden bg-[#111] border border-white/5 group-hover:border-brand-500/50 transition-all duration-500 relative shadow-2xl group-hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] group-hover:-translate-y-1 sm:group-hover:-translate-y-2">
                  {collection.imageUrl ? (
                    <img src={collection.imageUrl} alt={collection.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <Users className="w-12 h-12 text-gray-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity flex flex-col justify-end p-4">
                     <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100 flex justify-center">
                       <span className="text-white font-bold bg-brand-600/90 backdrop-blur-sm border border-brand-500 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest shadow-lg shadow-brand-900/50">View Profile</span>
                     </div>
                  </div>
                </div>
                <div className="text-center w-full px-2">
                  <h2 className="text-lg md:text-xl font-black text-white tracking-tight group-hover:text-brand-400 transition-colors truncate">{collection.title}</h2>
                  <p className="text-gray-500 text-sm font-medium tracking-wide mt-0.5">{itemCount} {itemCount === 1 ? 'Movie' : 'Movies'}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No cast members found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}


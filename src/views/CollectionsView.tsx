"use client";
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';
import { MediaCollection, MediaItem } from '../types';
import { useCollectionsData } from '../firebase';

interface CollectionsViewProps {
  onSelectMedia: (item: MediaItem) => void;
}

export default function CollectionsView({ onSelectMedia }: CollectionsViewProps) {
  const { data: collections, loading: collectionsLoading } = useCollectionsData();
  const navigate = useRouter();

  const allCollections = collections || [];
  const regularCollections = allCollections.filter(c => (c.type || 'REGULAR') === 'REGULAR');
  const loading = collectionsLoading;

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

  if (regularCollections.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="text-center flex flex-col items-center">
          <Layers className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-2xl font-black text-gray-400">No Collections Found</h2>
          <p className="text-gray-500 mt-2">Check back later for curated movies and TV shows.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-brand-600/10 rounded-2xl mb-4">
          <Layers className="w-8 h-8 text-brand-500" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter">
          Curated <span className="text-brand-500">Collections</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl">
          Discover hand-picked movies and TV shows grouped by your favorite themes and franchises.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 mt-12">
        {regularCollections.map(collection => {
          const itemCount = collection.mediaIds?.length || 0;

          return (
            <div 
              key={collection.id} 
              onClick={() => navigate.push(`/collections/${collection.id}`)}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-[#111] border border-white/5 relative aspect-[16/10] sm:aspect-[4/3] shadow-2xl transition-all duration-500 hover:scale-[1.04] hover:-translate-y-2 hover:border-brand-500/50 hover:shadow-[0_20px_40px_rgba(220,38,38,0.2)]"
            >
              <div className="absolute inset-0">
                {collection.imageUrl ? (
                  <img src={collection.imageUrl} alt={collection.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-90" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <Layers className="w-16 h-16 text-gray-800" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              </div>
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="transform transition-all duration-500 ease-out translate-y-4 sm:translate-y-8 group-hover:translate-y-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-600 border border-brand-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-brand-900/30 mb-3">
                    <Layers className="w-3 h-3" /> {itemCount} Items
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter drop-shadow-lg group-hover:text-brand-400 transition-colors">
                    {collection.title}
                  </h2>
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <div className="overflow-hidden">
                      {collection.description && (
                        <p className="text-gray-300 text-sm font-medium line-clamp-3 max-w-sm drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pt-3">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

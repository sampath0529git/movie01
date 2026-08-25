"use client";
import { useRouter, useParams } from 'next/navigation';
import React, { useMemo } from 'react';
import { Layers, ArrowLeft, Users } from 'lucide-react';
import { MediaItem } from '../types';
import MovieCard from '../components/MovieCard';
import { useCollectionsData, useMediaData } from '../firebase';

interface CollectionDetailsViewProps {
  onSelectMedia: (item: MediaItem) => void;
}

export default function CollectionDetailsView({ onSelectMedia }: CollectionDetailsViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const { data: collections, loading: collectionsLoading } = useCollectionsData();
  const { data: mediaItems, loading: mediaLoading } = useMediaData();

  const loading = collectionsLoading || mediaLoading;
  
  const collection = useMemo(() => {
    return collections.find(c => c.id === id);
  }, [collections, id]);

  const collectionItems = useMemo(() => {
    if (!collection) return [];
    return collection.mediaIds
      .map(mediaId => mediaItems.find(item => item.id === mediaId))
      .filter(Boolean) as MediaItem[];
  }, [collection, mediaItems]);

  if (loading) {
    return (
      <div className="flex-grow max-w-[2000px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="h-64 bg-gray-900 rounded-3xl mx-auto w-full mb-10 animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, j) => (
            <div key={j} className="rounded-xl overflow-hidden aspect-video bg-gray-900/50 block animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 text-center flex-col">
        <Layers className="w-16 h-16 text-brand-600 mb-4" />
        <h2 className="text-3xl font-black text-white">Collection Not Found</h2>
        <button onClick={() => navigate.push('/collections')} className="mt-8 text-brand-500 font-bold hover:underline">
          Go back to Collections
        </button>
      </div>
    );
  }

  const isCast = collection.type === 'CAST';
  const Icon = isCast ? Users : Layers;
  const label = isCast ? "Cast Profile" : "Collection";
  const backLabel = isCast ? "Go back to Cast Profiles" : "Go back to Collections";
  const backRoute = isCast ? "/cast-collections" : "/collections";

  return (
    <div className="flex-grow w-full max-w-[2000px] mx-auto pb-12">
      {/* Banner */}
      <div className={`relative w-full h-[40vh] md:h-[50vh] bg-[#0a0a0a] overflow-hidden ${isCast ? 'flex flex-col items-center justify-center' : ''}`}>
        {collection.imageUrl ? (
          <img src={collection.imageUrl} alt={collection.title} className={`w-full h-full object-cover opacity-50 ${isCast ? 'blur-sm' : ''}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#111]">
            <Icon className="w-24 h-24 text-gray-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent"></div>
        
        <div className={`absolute inset-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-end ${isCast ? 'items-center text-center pb-12' : ''}`}>
          <button 
            onClick={() => navigate.push(backRoute)}
            className="absolute top-6 left-6 flex items-center gap-2 text-white bg-black/40 hover:bg-black/80 px-4 py-2 rounded-full backdrop-blur-md transition-colors z-20 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          {isCast && collection.imageUrl && (
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-brand-500 shadow-[0_0_40px_rgba(220,38,38,0.4)] z-10 mb-6 relative group">
               <img src={collection.imageUrl} alt={collection.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 rounded-full ring-inset ring-2 ring-white/10 pointer-events-none"></div>
            </div>
          )}

          <div className={`w-full max-w-5xl z-10 ${isCast ? 'flex flex-col items-center' : ''}`}>
            {!isCast && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-md uppercase tracking-widest shadow-lg shadow-brand-900/30 mb-4 border border-brand-500/50">
                <Icon className="w-4 h-4" /> {label}
              </span>
            )}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
              {collection.title}
            </h1>
            {collection.description && (
              <div className={`mt-2 ${isCast ? 'text-center' : ''}`}>
               <p className="text-base md:text-lg text-gray-300 max-w-3xl drop-shadow-lg leading-relaxed whitespace-pre-line bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                 {collection.description}
               </p>
              </div>
            )}
            <div className={`mt-6 inline-flex items-center gap-2 bg-[#111] border border-[#222] px-4 py-2 rounded-lg shadow-xl ${isCast ? 'mx-auto' : ''}`}>
              <span className="text-xl font-black text-brand-500">{collectionItems.length}</span>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Movies/Shows</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-12 max-w-[2000px] mx-auto w-full">
        {collectionItems.length > 0 ? (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Icon className="w-6 h-6 text-brand-500" />
              {isCast ? 'Filmography' : 'Included Media'}
              <span className="text-sm font-bold text-gray-500 bg-gray-900 px-3 py-1 rounded-full">{collectionItems.length}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6 gap-y-8 sm:gap-y-10">
              {collectionItems.map((item, index) => (
                <MovieCard key={item.id} item={item} onClick={() => onSelectMedia(item)} priority={index < 12} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#0a0a0a] rounded-3xl border border-[#222] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[#111] bg-opacity-50"></div>
            <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
               <Layers className="w-16 h-16 text-gray-600 mb-2 drop-shadow-xl" />
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">No Media Found</h3>
               <p className="text-gray-400 font-medium tracking-tight max-w-md">This collection doesn't have any movies or TV shows associated with it yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

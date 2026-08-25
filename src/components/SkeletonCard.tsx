import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="group relative rounded-xl overflow-hidden aspect-[2/3] bg-gray-900 border border-gray-800 animate-pulse">
      {/* Play button generic position skeleton */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gray-800/50"></div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 flex flex-col gap-2">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        
        {/* Info row skeleton */}
        <div className="flex gap-2 items-center">
          <div className="h-3 bg-gray-700 rounded w-8"></div>
          <div className="h-3 bg-gray-700 rounded w-12"></div>
        </div>
      </div>
    </div>
  );
}

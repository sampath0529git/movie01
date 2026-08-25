import React from 'react';
import SkeletonCard from './SkeletonCard';

export default function SkeletonGrid() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

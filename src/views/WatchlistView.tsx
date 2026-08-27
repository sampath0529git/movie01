"use client";
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useWatchlist } from '../hooks/useWatchlist';
import MovieCard from '../components/MovieCard';

export default function WatchlistView() {
  const { t } = useTranslation();
  const { watchlist } = useWatchlist();
  const navigate = useRouter();

  return (
    <div className="flex-grow bg-[#000000] min-h-screen">
      <SEO 
        title="My Watchlist - MovieZen"
        description="Your personal watchlist on MovieZen."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-l-4 border-brand-500 pl-4">
          My Watchlist
        </h1>

        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-2xl text-gray-300 mb-4">Your watchlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Save shows and movies to keep track of what you want to watch.
            </p>
            <button
              onClick={() => navigate.push('/discover')}
              className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              Discover Content
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {watchlist.map((item, index) => (
              <MovieCard
                key={item.id}
                item={item}
                onClick={() => navigate.push(`/watch/${item.id}`)}
                priority={index < 12}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

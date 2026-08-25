"use client";
import { useState, useEffect } from 'react';
import { MediaItem } from '../types';

export type WatchlistItem = MediaItem;

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const stored = localStorage.getItem('movievibe_watchlist');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error parsing watchlist from local storage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('movievibe_watchlist', JSON.stringify(watchlist));
    } catch (error) {
      console.error('Error saving watchlist to local storage:', error);
    }
  }, [watchlist]);

  const addToWatchlist = (item: WatchlistItem) => {
    setWatchlist((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWatchlist = (id: string) => {
    return watchlist.some((item) => item.id === id);
  };

  const toggleWatchlist = (item: WatchlistItem) => {
    if (isInWatchlist(item.id)) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleWatchlist };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserWatchlistItem } from '@/types';

const STORAGE_KEY = 'nuvell_watchlist';
const LEGACY_STORAGE_KEY = 'nuvelll_watchlist';
const SYNC_EVENT = 'nuvell_watchlist_sync';

export function useWatchlist() {
  const [items, setItems] = useState<UserWatchlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(Array.isArray(parsed) ? parsed : []);
      } else {
        // Clean slate: start with empty watchlist
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFromStorage();
    const handleSync = () => loadFromStorage();
    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadFromStorage]);

  const toggleWatchlist = (
    type: UserWatchlistItem['type'],
    targetId: string,
    targetName: string,
    targetSlug: string
  ) => {
    const existingIndex = items.findIndex((i) => i.type === type && i.targetId === targetId);
    let updated: UserWatchlistItem[];

    if (existingIndex >= 0) {
      updated = items.filter((_, idx) => idx !== existingIndex);
    } else {
      updated = [
        ...items,
        {
          id: `wl_${Date.now()}`,
          type,
          targetId,
          targetName,
          targetSlug,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    setItems(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch {
      // ignore storage errors
    }
  };

  const isWatchlisted = (type: UserWatchlistItem['type'], targetId: string) => {
    return items.some((i) => i.type === type && i.targetId === targetId);
  };

  const clearWatchlist = () => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch {
      // ignore
    }
  };

  return {
    items,
    isLoaded,
    toggleWatchlist,
    isWatchlisted,
    clearWatchlist,
  };
}

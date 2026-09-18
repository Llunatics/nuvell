'use client';

import { useState, useEffect, useCallback } from 'react';

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  title: string;
  coverImage?: string | null;
  type: 'BOOK' | 'SERIES';
  publisherName?: string;
  viewedAt: string;
}

const STORAGE_KEY = 'nuvell_recently_viewed';
const LEGACY_STORAGE_KEY = 'nuvelll_recently_viewed';
const SYNC_EVENT = 'nuvell_recently_viewed_sync';

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(Array.isArray(parsed) ? parsed : []);
      } else {
        // Clean slate: start with empty recently viewed
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

  const addRecentItem = useCallback((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const currentList: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];
      const filtered = currentList.filter((i) => i.id !== item.id);
      const updated: RecentlyViewedItem[] = [
        { ...item, viewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, 12); // keep max 12 items

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setItems(updated);
      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch {}
  }, []);

  const clearRecentItems = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch {}
  }, []);

  return {
    items,
    isLoaded,
    addRecentItem,
    clearRecentItems,
  };
}

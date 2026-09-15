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
        setItems(JSON.parse(stored));
      } else {
        // Sample recent items for rich initial demonstration
        const defaults: RecentlyViewedItem[] = [
          {
            id: 'pub_one_piece_108',
            slug: 'one-piece-vol-108',
            title: 'One Piece Vol. 108',
            coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
            type: 'BOOK',
            publisherName: 'Elex Media Komputindo',
            viewedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: 'ser_frieren',
            slug: 'frieren-at-funerals-end',
            title: "Frieren: Beyond Journey's End",
            coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=400',
            type: 'SERIES',
            publisherName: 'm&c! Publishing',
            viewedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        setItems(defaults);
      }
    } catch {
      // ignore
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

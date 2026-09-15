'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserCollectionItem } from '@/types';

const STORAGE_KEY = 'nuvell_user_collection';
const LEGACY_STORAGE_KEY = 'nuvelll_user_collection';
const SYNC_EVENT = 'nuvell_collection_sync';

export function useCollection() {
  const [collection, setCollection] = useState<Map<string, UserCollectionItem>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed: UserCollectionItem[] = JSON.parse(stored);
        const map = new Map<string, UserCollectionItem>();
        parsed.forEach((item) => map.set(item.publicationId, item));
        setCollection(map);
      } else {
        // Initial sample items for collection showcase
        const defaults: UserCollectionItem[] = [
          {
            publicationId: 'pub_one_piece_108',
            seriesId: 'ser_one_piece',
            volume: 108,
            status: 'PREORDERED',
            updatedAt: new Date().toISOString(),
          },
          {
            publicationId: 'pub_kagurabachi_01',
            seriesId: 'ser_kagurabachi',
            volume: 1,
            status: 'OWNED',
            updatedAt: new Date().toISOString(),
          },
          {
            publicationId: 'pub_cantik_itu_luka_ce',
            status: 'WISHLIST',
            updatedAt: new Date().toISOString(),
          },
          {
            publicationId: 'pub_frieren_11',
            seriesId: 'ser_frieren',
            volume: 11,
            status: 'OWNED',
            updatedAt: new Date().toISOString(),
          },
        ];
        const map = new Map<string, UserCollectionItem>();
        defaults.forEach((item) => map.set(item.publicationId, item));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        setCollection(map);
      }
    } catch {
      // LocalStorage fallback
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

  const setItemStatus = (
    publicationId: string,
    status: UserCollectionItem['status'] | null,
    meta?: { seriesId?: string; volume?: number; notes?: string }
  ) => {
    const updated = new Map(collection);

    if (status === null) {
      updated.delete(publicationId);
    } else {
      updated.set(publicationId, {
        publicationId,
        seriesId: meta?.seriesId,
        volume: meta?.volume,
        status,
        updatedAt: new Date().toISOString(),
        notes: meta?.notes,
      });
    }

    setCollection(updated);
    try {
      const arrayData = Array.from(updated.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arrayData));
      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch {
      // ignore
    }
  };

  const getItemStatus = (publicationId: string): UserCollectionItem['status'] | null => {
    return collection.get(publicationId)?.status ?? null;
  };

  const getSeriesProgress = (seriesId: string, totalVolumes?: number | null) => {
    const seriesItems = Array.from(collection.values()).filter((i) => i.seriesId === seriesId);
    const owned = seriesItems.filter((i) => i.status === 'OWNED').length;
    const wishlist = seriesItems.filter((i) => i.status === 'WISHLIST').length;
    const preordered = seriesItems.filter((i) => i.status === 'PREORDERED').length;
    const total = totalVolumes || Math.max(seriesItems.length, 1);
    const percentage = Math.min(100, Math.round((owned / total) * 100));

    return { owned, wishlist, preordered, total, percentage };
  };

  const exportCollectionJson = () => {
    const data = JSON.stringify(Array.from(collection.values()), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nuvell_collection_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCollectionJson = (jsonString: string): boolean => {
    try {
      const parsed: UserCollectionItem[] = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) return false;
      const map = new Map<string, UserCollectionItem>();
      parsed.forEach((item) => {
        if (item.publicationId && item.status) {
          map.set(item.publicationId, item);
        }
      });
      setCollection(map);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(map.values())));
      window.dispatchEvent(new Event(SYNC_EVENT));
      return true;
    } catch {
      return false;
    }
  };

  return {
    collection,
    isLoaded,
    setItemStatus,
    getItemStatus,
    getSeriesProgress,
    exportCollectionJson,
    importCollectionJson,
    totalItems: collection.size,
  };
}

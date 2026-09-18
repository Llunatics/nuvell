'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserSeries, UserSeriesVolume, VolumeStatus } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { getFirebaseFirestore } from '@/lib/firebase/config';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

const STORAGE_KEY = 'nuvell_user_series_v1';
const SERIES_EVENT = 'nuvell_user_series_sync';

export function useUserSeries() {
  const { user } = useAuth();
  const [seriesList, setSeriesList] = useState<UserSeries[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage or Firestore
  useEffect(() => {
    if (!user) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSeriesList(Array.isArray(parsed) ? parsed : []);
        } else {
          setSeriesList([]);
        }
      } catch {
        setSeriesList([]);
      } finally {
        setIsLoaded(true);
      }
      return;
    }

    const db = getFirebaseFirestore();
    if (!db) {
      setIsLoaded(true);
      return;
    }

    try {
      const seriesColRef = collection(db, 'users', user.uid, 'series');
      const unsubscribe = onSnapshot(
        seriesColRef,
        (snapshot) => {
          const list: UserSeries[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserSeries;
            list.push({ ...data, id: docSnap.id });
          });
          // Sort by updatedAt desc
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setSeriesList(list);
          setIsLoaded(true);
        },
        (err) => {
          console.warn('[useUserSeries] Firestore listener error, using local:', err.message);
          setIsLoaded(true);
        }
      );

      return () => unsubscribe();
    } catch {
      setIsLoaded(true);
    }
  }, [user]);

  // Guest cross-tab sync
  useEffect(() => {
    if (user) return;
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setSeriesList(stored ? JSON.parse(stored) : []);
      } catch {
        // ignore
      }
    };
    window.addEventListener(SERIES_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(SERIES_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  const persistLocal = (updated: UserSeries[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(SERIES_EVENT));
    } catch {
      // ignore
    }
  };

  const createSeries = useCallback(
    async (params: {
      title: string;
      author?: string;
      publisher?: string;
      status: 'ONGOING' | 'COMPLETED';
      totalVolumes?: number | null;
      notes?: string;
      initialVolumesCount?: number;
    }) => {
      const now = new Date().toISOString();
      const seriesId = `series_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      // Generate initial volumes if requested
      const initialVolumes: UserSeriesVolume[] = [];
      if (params.initialVolumesCount && params.initialVolumesCount > 0) {
        for (let v = 1; v <= params.initialVolumesCount; v++) {
          initialVolumes.push({
            id: `vol_${seriesId}_${v}`,
            seriesId,
            volumeNumber: v,
            status: 'MISSING',
          });
        }
      }

      const newSeries: UserSeries = {
        id: seriesId,
        userId: user ? user.uid : 'guest',
        title: params.title.trim(),
        author: params.author?.trim(),
        publisher: params.publisher?.trim(),
        status: params.status,
        totalVolumes: params.totalVolumes || null,
        volumes: initialVolumes,
        notes: params.notes?.trim(),
        createdAt: now,
        updatedAt: now,
      };

      if (user) {
        const db = getFirebaseFirestore();
        if (db) {
          try {
            const docRef = doc(db, 'users', user.uid, 'series', seriesId);
            await setDoc(docRef, newSeries);
            return newSeries;
          } catch {
            // fallback to local
          }
        }
      }

      setSeriesList((prev) => {
        const next = [newSeries, ...prev];
        persistLocal(next);
        return next;
      });

      return newSeries;
    },
    [user]
  );

  const updateSeries = useCallback(
    async (seriesId: string, updates: Partial<Omit<UserSeries, 'id' | 'userId' | 'createdAt'>>) => {
      const now = new Date().toISOString();
      const mergedUpdates = { ...updates, updatedAt: now };

      if (user) {
        const db = getFirebaseFirestore();
        if (db) {
          try {
            const docRef = doc(db, 'users', user.uid, 'series', seriesId);
            await updateDoc(docRef, mergedUpdates);
            return;
          } catch {
            // fallback
          }
        }
      }

      setSeriesList((prev) => {
        const next = prev.map((s) => (s.id === seriesId ? { ...s, ...mergedUpdates } : s));
        persistLocal(next);
        return next;
      });
    },
    [user]
  );

  const deleteSeries = useCallback(
    async (seriesId: string) => {
      if (user) {
        const db = getFirebaseFirestore();
        if (db) {
          try {
            const docRef = doc(db, 'users', user.uid, 'series', seriesId);
            await deleteDoc(docRef);
            return;
          } catch {
            // fallback
          }
        }
      }

      setSeriesList((prev) => {
        const next = prev.filter((s) => s.id !== seriesId);
        persistLocal(next);
        return next;
      });
    },
    [user]
  );

  const addVolume = useCallback(
    async (
      seriesId: string,
      volData: {
        volumeNumber: number;
        status: VolumeStatus;
        bookId?: string;
        notes?: string;
      }
    ) => {
      const volId = `vol_${seriesId}_${volData.volumeNumber}_${Date.now()}`;
      const newVol: UserSeriesVolume = {
        id: volId,
        seriesId,
        volumeNumber: volData.volumeNumber,
        status: volData.status,
        bookId: volData.bookId,
        notes: volData.notes,
      };

      const target = seriesList.find((s) => s.id === seriesId);
      if (!target) return;

      const updatedVolumes = [...target.volumes, newVol].sort(
        (a, b) => a.volumeNumber - b.volumeNumber
      );

      await updateSeries(seriesId, { volumes: updatedVolumes });
    },
    [seriesList, updateSeries]
  );

  const updateVolume = useCallback(
    async (seriesId: string, volumeId: string, updates: Partial<UserSeriesVolume>) => {
      const target = seriesList.find((s) => s.id === seriesId);
      if (!target) return;

      const updatedVolumes = target.volumes.map((v) =>
        v.id === volumeId ? { ...v, ...updates } : v
      );

      await updateSeries(seriesId, { volumes: updatedVolumes });
    },
    [seriesList, updateSeries]
  );

  const deleteVolume = useCallback(
    async (seriesId: string, volumeId: string) => {
      const target = seriesList.find((s) => s.id === seriesId);
      if (!target) return;

      const updatedVolumes = target.volumes.filter((v) => v.id !== volumeId);
      await updateSeries(seriesId, { volumes: updatedVolumes });
    },
    [seriesList, updateSeries]
  );

  const markVolumeStatus = useCallback(
    async (seriesId: string, volumeId: string, status: VolumeStatus) => {
      await updateVolume(seriesId, volumeId, { status });
    },
    [updateVolume]
  );

  return {
    seriesList,
    isLoaded,
    createSeries,
    updateSeries,
    deleteSeries,
    addVolume,
    updateVolume,
    deleteVolume,
    markVolumeStatus,
  };
}

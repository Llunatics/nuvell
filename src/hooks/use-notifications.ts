'use client';

import { useState, useEffect, useCallback } from 'react';
import { NotificationItem, NotificationType } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  writeBatch,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase/config';

const STORAGE_KEY = 'nuvell_notifications_v2';
const NOTIF_EVENT = 'nuvell_notifications_sync';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Authenticated User: Realtime Firestore Listener
  useEffect(() => {
    if (!user) {
      // Handle guest mode from localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: NotificationItem[] = JSON.parse(stored);
          setNotifications(parsed);
        } else {
          setNotifications([]);
        }
      } catch {
        setNotifications([]);
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
      const notifsRef = collection(db, 'users', user.uid, 'notifications');
      const q = query(notifsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: NotificationItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              userId: user.uid,
              type: data.type as NotificationType,
              bookId: data.bookId,
              seriesId: data.seriesId,
              title: data.title || '',
              message: data.message || '',
              createdAt: data.createdAt || new Date().toISOString(),
              readAt: data.readAt || null,
              isRead: Boolean(data.isRead),
              metadata: data.metadata || {},
            });
          });
          setNotifications(items);
          setIsLoaded(true);
        },
        (error) => {
          console.warn('[useNotifications] Firestore listener fallback:', error.message);
          setIsLoaded(true);
        }
      );

      return () => unsubscribe();
    } catch {
      setIsLoaded(true);
    }
  }, [user]);

  // Guest sync listener across tabs
  useEffect(() => {
    if (user) return;
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setNotifications(stored ? JSON.parse(stored) : []);
      } catch {
        // ignore
      }
    };
    window.addEventListener(NOTIF_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(NOTIF_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  const persistGuest = (updated: NotificationItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(NOTIF_EVENT));
    } catch {
      // ignore
    }
  };

  // Mark single as read
  const markAsRead = useCallback(
    async (id: string) => {
      if (user) {
        const db = getFirebaseFirestore();
        if (db) {
          try {
            const ref = doc(db, 'users', user.uid, 'notifications', id);
            await updateDoc(ref, {
              isRead: true,
              readAt: new Date().toISOString(),
            });
            return;
          } catch {
            // fallback
          }
        }
      }

      // Guest / local update
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        );
        persistGuest(updated);
        return updated;
      });
    },
    [user]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (user) {
      const db = getFirebaseFirestore();
      if (db) {
        try {
          const batch = writeBatch(db);
          const unread = notifications.filter((n) => !n.isRead);
          unread.forEach((n) => {
            const ref = doc(db, 'users', user.uid, 'notifications', n.id);
            batch.update(ref, {
              isRead: true,
              readAt: new Date().toISOString(),
            });
          });
          await batch.commit();
          return;
        } catch {
          // fallback
        }
      }
    }

    setNotifications((prev) => {
      const updated = prev.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt || new Date().toISOString(),
      }));
      persistGuest(updated);
      return updated;
    });
  }, [user, notifications]);

  // Add notification (used by price alert or test events)
  const addNotification = useCallback(
    async (notif: Omit<NotificationItem, 'id' | 'userId' | 'createdAt' | 'isRead'>) => {
      const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const now = new Date().toISOString();
      const newNotif: NotificationItem = {
        ...notif,
        id,
        userId: user ? user.uid : 'guest',
        createdAt: now,
        isRead: false,
        readAt: null,
      };

      if (user) {
        const db = getFirebaseFirestore();
        if (db) {
          try {
            const ref = doc(db, 'users', user.uid, 'notifications', id);
            await setDoc(ref, newNotif);
            return;
          } catch {
            // fallback
          }
        }
      }

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        persistGuest(updated);
        return updated;
      });
    },
    [user]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const badgeText = unreadCount === 0 ? null : unreadCount > 99 ? '99+' : `${unreadCount}`;

  return {
    notifications,
    unreadCount,
    badgeText,
    isLoaded,
    markAsRead,
    markAllAsRead,
    addNotification,
  };
}

'use client';

import React, { useState } from 'react';
import { Bell, Check, Sparkles, ArrowUpRight, X } from 'lucide-react';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  href: string;
  read: boolean;
  type: 'RELEASE' | 'PREORDER' | 'PRICE_DROP';
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Kagurabachi Vol. 01 Resmi Rilis!',
    message: 'Elex Media Komputindo telah merilis volume perdana Kagurabachi di gerai Gramedia seluruh Indonesia.',
    timestamp: '2 jam lalu',
    href: '/books/kagurabachi-vol-01',
    read: false,
    type: 'RELEASE',
  },
  {
    id: 'notif_2',
    title: 'Pre-order Dibuka: One Piece Vol. 108',
    message: 'Pre-order One Piece Vol. 108 edisi Pulau Egghead kini dibuka dengan harga Rp 45.000.',
    timestamp: '5 jam lalu',
    href: '/books/one-piece-vol-108',
    read: false,
    type: 'PREORDER',
  },
  {
    id: 'notif_3',
    title: 'Penurunan Harga Terdeteksi: Cantik Itu Luka',
    message: 'Edisi 20 Tahun Kolektor turun dari Rp 180.000 menjadi Rp 162.000 (diskon 10% di Gramedia.com).',
    timestamp: '1 hari lalu',
    href: '/books/cantik-itu-luka-collector-edition',
    read: true,
    type: 'PRICE_DROP',
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-surface border border-border-subtle hover:border-gold/40 text-editorial-muted hover:text-editorial-title transition-all"
        aria-label="Notifikasi Rilis"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-background text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-overlay border border-border-medium rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-raised/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-editorial-title">Radar Notifikasi</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-medium bg-gold/10 text-gold rounded-full border border-gold/20">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-editorial-muted hover:text-gold transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Tandai semua
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-surface text-editorial-faint"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-editorial-faint">
                Tidak ada notifikasi baru saat ini.
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.href}
                  onClick={() => {
                    markAsRead(notif.id);
                    setIsOpen(false);
                  }}
                  className={`block px-4 py-3 hover:bg-surface transition-colors ${
                    !notif.read ? 'bg-surface/60 border-l-2 border-gold' : 'opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-editorial-title">{notif.title}</p>
                    <span className="text-[10px] text-editorial-faint shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-editorial-muted mt-1 line-clamp-2">{notif.message}</p>
                </Link>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-surface border-t border-border-subtle text-center">
            <Link
              href="/radar"
              onClick={() => setIsOpen(false)}
              className="text-xs text-gold hover:underline flex items-center justify-center gap-1"
            >
              Buka My Release Radar <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

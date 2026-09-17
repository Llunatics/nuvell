'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Sparkles, ArrowUpRight, X, Clock, TrendingDown, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useModalOverlay } from '@/hooks/use-modal-overlay';

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

  const mounted = useModalOverlay(isOpen);
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
        className="relative w-10 h-10 rounded-xl bg-surface border border-border-subtle hover:border-gold/40 text-editorial-muted hover:text-editorial-title flex items-center justify-center transition-all active:scale-95"
        aria-label="Notifikasi Rilis"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-background text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Bottom Sheet (sm:hidden) */}
      {isOpen && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="modal-overlay-scrim sm:hidden flex flex-col justify-end transition-all animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-h-[85vh] bg-surface-raised border-t border-border-medium rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-border-medium" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-editorial text-editorial-title">Radar Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-gold/15 text-gold rounded-full border border-gold/30">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="min-h-[44px] px-2.5 text-xs text-editorial-muted hover:text-gold active:text-gold transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Tandai semua
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-xl hover:bg-surface flex items-center justify-center text-editorial-faint active:text-editorial-title"
                  aria-label="Tutup notifikasi"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border-subtle p-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-editorial-faint">
                  Tidak ada notifikasi baru saat ini.
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon =
                    notif.type === 'RELEASE'
                      ? Sparkles
                      : notif.type === 'PREORDER'
                      ? Clock
                      : TrendingDown;
                  const iconColor =
                    notif.type === 'RELEASE'
                      ? 'text-gold bg-gold/10'
                      : notif.type === 'PREORDER'
                      ? 'text-burgundy-400 bg-burgundy-400/10'
                      : 'text-emerald-400 bg-emerald-400/10';
                  return (
                    <Link
                      key={notif.id}
                      href={notif.href}
                      onClick={() => {
                        markAsRead(notif.id);
                        setIsOpen(false);
                      }}
                      className={`flex items-start gap-3 p-4 hover:bg-surface transition-colors active:bg-surface-raised ${
                        !notif.read ? 'bg-surface/60 border-l-4 border-gold' : 'opacity-80'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-editorial-title">{notif.title}</p>
                          <span className="text-[10px] font-mono text-editorial-faint shrink-0">{notif.timestamp}</span>
                        </div>
                        <p className="text-xs text-editorial-muted mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Bottom Radar Link */}
            <div className="p-4 bg-surface border-t border-border-subtle text-center pb-safe">
              <Link
                href="/radar"
                onClick={() => setIsOpen(false)}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-surface-raised hover:bg-surface border border-border-subtle text-xs font-semibold text-gold transition-colors"
              >
                <span>Buka My Release Radar Lengkap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Desktop Dropdown Popover (hidden sm:block) */}
      {isOpen && (
        <div
          className="hidden sm:block absolute right-0 mt-2 w-80 sm:w-96 bg-surface-overlay border border-border-medium rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
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

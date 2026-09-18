'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  Check,
  Sparkles,
  ArrowUpRight,
  X,
  Clock,
  TrendingDown,
  BookOpen,
  CheckCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useModalOverlay } from '@/hooks/use-modal-overlay';
import { useNotifications } from '@/hooks/use-notifications';
import { formatRelativeTime } from '@/lib/formatters';
import { NotificationType } from '@/types';

interface NotificationCenterProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function NotificationCenter({
  isOpen: controlledIsOpen,
  onOpenChange,
  hideTrigger = false,
}: NotificationCenterProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setInternalIsOpen(val);
  };
  const {
    notifications,
    unreadCount,
    badgeText,
    isLoaded,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const mounted = useModalOverlay(isOpen);

  const getNotifMeta = (type: NotificationType) => {
    switch (type) {
      case 'RELEASE_SOON':
      case 'NEW_RELEASE':
        return {
          icon: Sparkles,
          color: 'text-gold bg-gold/10 border-gold/25',
          tag: 'RILIS',
        };
      case 'PRICE_DROP':
      case 'PRICE_ALERT':
        return {
          icon: TrendingDown,
          color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
          tag: 'HARGA',
        };
      case 'PREORDER_OPEN':
        return {
          icon: Clock,
          color: 'text-burgundy-400 bg-burgundy-400/10 border-burgundy-400/25',
          tag: 'PRE-ORDER',
        };
      case 'SERIES_GAP':
      case 'COLLECTION_EVENT':
        return {
          icon: BookOpen,
          color: 'text-sky-400 bg-sky-400/10 border-sky-400/25',
          tag: 'SERI',
        };
      case 'AVAILABILITY_CHANGE':
      default:
        return {
          icon: Bell,
          color: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
          tag: 'STATUS',
        };
    }
  };

  const getNotifHref = (item: { bookId?: string; seriesId?: string }) => {
    if (item.bookId) return `/books/${item.bookId}`;
    if (item.seriesId) return `/library?tab=series`;
    return '/radar';
  };

  return (
    <div className="relative">
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-10 h-10 rounded-xl bg-surface border border-border-subtle hover:border-gold/40 text-editorial-muted hover:text-editorial-title flex items-center justify-center transition-all active:scale-95"
          aria-label={`Radar Notifikasi (${unreadCount} belum dibaca)`}
        >
          <Bell className="w-4 h-4" />
          {badgeText && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gold text-background text-[10px] font-bold flex items-center justify-center font-mono">
              {badgeText}
            </span>
          )}
        </button>
      )}

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
                    className="min-h-[44px] px-2.5 text-xs text-editorial-muted hover:text-gold active:text-gold transition-colors flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Tandai semua
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
              {!isLoaded ? (
                <div className="py-12 text-center text-xs text-editorial-faint">
                  Memeriksa radar rilis...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-14 px-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center mx-auto text-editorial-muted">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-editorial-title">Belum ada notifikasi baru</p>
                  <p className="text-xs text-editorial-muted max-w-xs mx-auto">
                    Radar akan mendeteksi jadwal rilis resmi, penurunan harga buku favorit, dan missing volume koleksimu.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const meta = getNotifMeta(notif.type);
                  const Icon = meta.icon;
                  const href = getNotifHref(notif);

                  return (
                    <Link
                      key={notif.id}
                      href={href}
                      onClick={() => {
                        markAsRead(notif.id);
                        setIsOpen(false);
                      }}
                      className={`flex items-start gap-3 p-4 hover:bg-surface transition-colors active:bg-surface-raised ${
                        !notif.isRead ? 'bg-surface/80 border-l-2 border-gold' : 'opacity-75'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-editorial-faint">
                            {meta.tag}
                          </span>
                          <span className="text-[10px] font-mono text-editorial-faint shrink-0">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-editorial-title mt-0.5">{notif.title}</p>
                        <p className="text-xs text-editorial-muted mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
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
                <span>Buka Radar Lengkap</span>
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
                  {badgeText} baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-editorial-muted hover:text-gold transition-colors flex items-center gap-1 font-medium"
                >
                  <Check className="w-3 h-3" /> Tandai semua
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-surface text-editorial-faint"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
            {!isLoaded ? (
              <div className="py-8 text-center text-xs text-editorial-faint">
                Memeriksa radar rilis...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-surface border border-border-subtle flex items-center justify-center mx-auto text-editorial-muted">
                  <Bell className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-editorial-title">Belum ada notifikasi</p>
                <p className="text-[11px] text-editorial-muted">
                  Notifikasi rilis jadwal dan alert harga buku favorit akan muncul di sini.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const meta = getNotifMeta(notif.type);
                const href = getNotifHref(notif);

                return (
                  <Link
                    key={notif.id}
                    href={href}
                    onClick={() => {
                      markAsRead(notif.id);
                      setIsOpen(false);
                    }}
                    className={`block px-4 py-3 hover:bg-surface transition-colors ${
                      !notif.isRead ? 'bg-surface/70 border-l-2 border-gold' : 'opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-gold font-semibold">
                        {meta.tag}
                      </span>
                      <span className="text-[10px] text-editorial-faint shrink-0 font-mono">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-editorial-title mt-0.5">{notif.title}</p>
                    <p className="text-xs text-editorial-muted mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                  </Link>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 bg-surface border-t border-border-subtle text-center">
            <Link
              href="/radar"
              onClick={() => setIsOpen(false)}
              className="text-xs text-gold hover:underline flex items-center justify-center gap-1 font-medium"
            >
              Buka Radar Lengkap <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useNotifications } from '@/hooks/use-notifications';
import {
  User,
  BookMarked,
  Bookmark,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
  Terminal,
  Layers,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface UserMenuProps {
  onOpenNotifications?: () => void;
}

export function UserMenu({ onOpenNotifications }: UserMenuProps) {
  const { user, isLoading, logout } = useAuth();
  const { items: watchlistItems } = useWatchlist();
  const { unreadCount, badgeText } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Check admin status securely from server
  useEffect(() => {
    let mounted = true;
    if (!user?.email) {
      setIsAdmin(false);
      return;
    }

    const publicAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (publicAdmins.includes(user.email.toLowerCase())) {
      setIsAdmin(true);
      return;
    }

    if (typeof user.getIdToken === 'function') {
      user
        .getIdToken()
        .then((idToken) =>
          fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, email: user.email }),
          })
        )
        .then((res) => res.json())
        .then((data) => {
          if (mounted && data?.success) {
            setIsAdmin(true);
          }
        })
        .catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (isLoading) {
    return (
      <div className="w-9 h-9 sm:w-auto sm:h-9 sm:px-3 rounded-xl bg-surface animate-pulse border border-border-subtle" />
    );
  }

  // Generate initials for logged-in user
  const initials = user
    ? (user.displayName || user.email || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button: Icon only on mobile, Icon + Text on Desktop */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center gap-2 w-9 h-9 sm:w-auto sm:h-9 sm:px-3 sm:py-1.5 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle hover:border-gold/40 text-editorial-body hover:text-editorial-title transition-all active:scale-95 group"
        aria-label="Menu Akun & Profil"
        aria-expanded={isOpen}
      >
        {user ? (
          user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={user.displayName || 'Avatar'}
              className="w-6 h-6 rounded-lg object-cover border border-border-subtle"
            />
          ) : (
            <div className="w-6 h-6 rounded-lg bg-gold/15 text-gold text-[10px] font-mono font-bold flex items-center justify-center border border-gold/30">
              {initials}
            </div>
          )
        ) : (
          <User className="w-4 h-4 text-editorial-muted group-hover:text-gold transition-colors" />
        )}

        {/* Text on Desktop Only */}
        <span className="text-xs font-semibold text-editorial-title group-hover:text-gold transition-colors hidden sm:inline-block max-w-[100px] truncate">
          {user ? (user.displayName || user.email?.split('@')[0]) : 'Masuk'}
        </span>

        {/* Unread indicator dot on mobile */}
        {unreadCount > 0 && (
          <span className="sm:hidden absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold ring-2 ring-surface animate-pulse" />
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-editorial-muted transition-transform duration-200 hidden sm:inline-block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-surface-overlay border border-border-medium rounded-2xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150 space-y-1.5">
          {/* Section 1: Account Header */}
          {user ? (
            <div className="p-3 border-b border-border-subtle bg-surface-raised/40 rounded-xl">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-9 h-9 rounded-xl object-cover border border-border-subtle"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold text-xs font-mono font-bold flex items-center justify-center border border-gold/30">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-editorial-title truncate">
                    {user.displayName || 'Pembaca Nuvell'}
                  </p>
                  <p className="text-[11px] font-mono text-editorial-faint truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              {isAdmin ? (
                <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-gold/15 text-gold border border-gold/30 font-bold">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Admin Nuvell</span>
                </div>
              ) : (
                <div className="mt-2.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-surface-raised text-editorial-faint border border-border-subtle">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Akun Nuvell</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 border-b border-border-subtle bg-surface-raised/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-editorial-title font-editorial">
                    Akun Pembaca
                  </h4>
                  <p className="text-[10px] text-editorial-muted">
                    Sinkronkan watchlist & koleksi Anda
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <Link
                  href={`/login${pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : ''}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gold text-background text-xs font-semibold hover:bg-gold-400 transition-all shadow-xs text-center"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </Link>
                <Link
                  href={`/register${pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : ''}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border-subtle text-editorial-body hover:text-editorial-title text-xs font-medium hover:bg-surface-raised transition-all text-center"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </Link>
              </div>
            </div>
          )}

          {/* Section 2: Mobile Quick Actions (Watchlist & Notif) */}
          <div className="space-y-0.5 pt-0.5">
            <Link
              href="/library?tab=watchlist"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-editorial-body hover:text-editorial-title hover:bg-surface transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
                <span className="font-medium">Watchlist & Bookmark</span>
              </div>
              {watchlistItems.length > 0 && (
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                  {watchlistItems.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenNotifications) {
                  onOpenNotifications();
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-editorial-body hover:text-editorial-title hover:bg-surface transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Radar Notifikasi</span>
              </div>
              {unreadCount > 0 && (
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                  {badgeText}
                </span>
              )}
            </button>

            <Link
              href="/library?tab=collection"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-editorial-body hover:text-editorial-title hover:bg-surface transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <BookMarked className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Koleksi Buku Saya</span>
              </div>
            </Link>

            <Link
              href="/library?tab=series"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-editorial-body hover:text-editorial-title hover:bg-surface transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Pelacak Seri Komik & Novel</span>
              </div>
            </Link>
          </div>

          {/* Section 3: Admin Link (if authorized) */}
          {isAdmin && (
            <div className="pt-1 border-t border-border-subtle">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gold hover:text-gold-300 hover:bg-gold/10 transition-colors font-medium border border-gold/25"
              >
                <Terminal className="w-4 h-4 text-gold" />
                <span>Crawler Dashboard</span>
              </Link>
            </div>
          )}

          {/* Section 4: Sign Out (if logged in) */}
          {user && (
            <div className="mt-1 pt-1 border-t border-border-subtle">
              <button
                type="button"
                onClick={async () => {
                  setIsOpen(false);
                  await logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-burgundy-400 hover:text-burgundy-300 hover:bg-burgundy-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Sign Out)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  User,
  BookMarked,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
  Terminal,
  ExternalLink,
} from 'lucide-react';

export function UserMenu() {
  const { user, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
      <div className="w-8 h-8 rounded-xl bg-surface animate-pulse border border-border-subtle" />
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login${pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : ''}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle hover:border-gold/40 text-xs font-semibold text-editorial-title hover:text-gold transition-all active:scale-95"
      >
        <User className="w-3.5 h-3.5 text-editorial-muted" />
        <span>Masuk</span>
      </Link>
    );
  }

  // Generate initials
  const initials = (user.displayName || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-surface border border-border-subtle hover:border-gold/40 text-editorial-body hover:text-editorial-title transition-all active:scale-95"
        aria-label="Menu Akun Pengguna"
        aria-expanded={isOpen}
      >
        {user.photoURL ? (
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
        )}
        <span className="text-xs font-medium max-w-[90px] truncate hidden md:inline-block">
          {user.displayName || user.email?.split('@')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-editorial-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface-overlay border border-border-medium rounded-2xl shadow-2xl z-50 p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="p-3 border-b border-border-subtle bg-surface-raised/40 rounded-xl mb-1">
            <p className="text-xs font-semibold text-editorial-title truncate">
              {user.displayName || 'Pembaca Nuvell'}
            </p>
            <p className="text-[11px] font-mono text-editorial-faint truncate mt-0.5">
              {user.email}
            </p>
            {isAdmin ? (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-gold/15 text-gold border border-gold/30 font-bold">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Admin Nuvell</span>
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-surface-raised text-editorial-faint border border-border-subtle">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Nuvell Account</span>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <div className="space-y-0.5">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gold hover:text-gold-300 hover:bg-gold/10 transition-colors font-medium border border-gold/25 mb-1"
              >
                <Terminal className="w-4 h-4 text-gold" />
                <span>Crawler Dashboard</span>
              </Link>
            )}

            <Link
              href="/library"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-editorial-body hover:text-editorial-title hover:bg-surface transition-colors"
            >
              <BookMarked className="w-4 h-4 text-editorial-muted" />
              <span>Koleksi & Library</span>
            </Link>

            <Link
              href="/radar"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-editorial-body hover:text-editorial-title hover:bg-surface transition-colors"
            >
              <Bell className="w-4 h-4 text-editorial-muted" />
              <span>Radar Notifikasi</span>
            </Link>
          </div>

          {/* Sign Out Action */}
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
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchDialog } from '../search/search-dialog';
import { NotificationCenter } from '../notifications/notification-center';
import { SettingsPopover } from '../settings/settings-popover';
import { Bookmark, Sparkles, Moon, Sun, Laptop, Check } from 'lucide-react';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useDisplaySettings } from '@/hooks/use-display-settings';
import { Tooltip } from '@/components/ui/tooltip';

export function Header() {
  const { items } = useWatchlist();
  const { theme, setTheme, resolvedDark } = useDisplaySettings();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const pathname = usePathname();

  // Determine editorial context / breadcrumb from current path
  const getContextTitle = () => {
    if (pathname === '/') return 'Home';
    if (pathname.startsWith('/discover')) return 'Discover';
    if (pathname.startsWith('/calendar')) return 'Calendar';
    if (pathname.startsWith('/library')) return 'Library';
    if (pathname.startsWith('/insights')) return 'Insights';
    if (pathname.startsWith('/books')) return 'Detail Buku';
    if (pathname.startsWith('/series')) return 'Seri';
    if (pathname.startsWith('/publishers')) return 'Penerbit';
    if (pathname.startsWith('/admin')) return 'Admin Observability';
    return 'Nuvell';
  };

  const toggleThemeQuick = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-background/90 backdrop-blur-xl border-b border-border-subtle pt-safe transition-all">
      {/* MOBILE HEADER (sm:hidden): Two-row intentional layout */}
      <div className="sm:hidden px-4 pt-2.5 pb-2.5 space-y-2.5">
        {/* Row 1: Brand Logo + Icon Controls */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 focus:outline-none group">
            <span className="font-editorial text-lg font-bold tracking-tight text-editorial-title group-hover:text-gold transition-colors">
              nuvell
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </Link>

          {/* Right Icon Actions: Watchlist, Notification, Theme */}
          <div className="flex items-center gap-1.5">
            {/* Watchlist */}
            <Link
              href="/library?tab=watchlist"
              className="relative p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-gold/40 text-editorial-muted active:scale-95 transition-all"
              aria-label={`Buka Watchlist (${items.length} item tersimpan)`}
            >
              <Bookmark className="w-4 h-4 text-editorial-muted" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-background text-[10px] font-bold flex items-center justify-center font-mono">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Notification Center */}
            <NotificationCenter />

            {/* Mobile Theme Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="w-10 h-10 rounded-xl bg-surface border border-border-subtle hover:border-gold/40 text-editorial-muted flex items-center justify-center active:scale-95 transition-all"
                aria-label="Pilih Tema Tampilan (Dark, Light, System)"
                aria-expanded={isThemeOpen}
              >
                {resolvedDark ? (
                  <Sun className="w-4 h-4 text-amber-300" />
                ) : (
                  <Moon className="w-4 h-4 text-editorial-body" />
                )}
              </button>

              {isThemeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsThemeOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-surface-overlay border border-border-medium rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                    <div className="px-2.5 py-1 text-[10px] font-mono text-editorial-faint uppercase tracking-wider">
                      Pilihan Tema
                    </div>
                    {[
                      { id: 'dark', label: 'Gelap (Dark)', icon: Moon },
                      { id: 'light', label: 'Terang (Light)', icon: Sun },
                      { id: 'system', label: 'Sistem (Auto)', icon: Laptop },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = theme === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setTheme(opt.id as 'dark' | 'light' | 'system');
                            setIsThemeOpen(false);
                          }}
                          className={`w-full min-h-[40px] flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                            isSelected
                              ? 'bg-gold/15 text-gold font-semibold'
                              : 'text-editorial-body hover:bg-surface active:bg-surface'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-gold" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Full-width Search Trigger */}
        <div className="w-full">
          <SearchDialog />
        </div>
      </div>

      {/* DESKTOP HEADER (hidden sm:flex): Elegant Single-Row Layout */}
      <div className="hidden sm:flex items-center justify-between gap-4 px-6 lg:px-8 py-3">
        {/* Left: Solid Brand & Desktop Breadcrumb Context */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 focus:outline-none group">
            <span className="font-editorial text-xl font-bold tracking-tight text-editorial-title group-hover:text-gold transition-colors">
              nuvell
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </Link>

          {/* Desktop Breadcrumb Context */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-editorial-faint">/</span>
            <span className="text-editorial-title font-medium">{getContextTitle()}</span>
          </div>
        </div>

        {/* Center: Sleek Global Command Search Dialog Bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <SearchDialog />
        </div>

        {/* Right: Functional Minimal Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Watchlist Quick Shortcut */}
          <Tooltip content={`Watchlist (${items.length} tersimpan)`} side="bottom">
            <Link
              href="/library?tab=watchlist"
              className="relative p-2 rounded-lg bg-surface border border-border-subtle hover:border-gold/40 text-editorial-muted hover:text-editorial-title transition-all group"
              aria-label={`Buka Watchlist (${items.length} item tersimpan)`}
            >
              <Bookmark className="w-4 h-4 text-editorial-muted group-hover:text-gold transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-background text-[10px] font-bold flex items-center justify-center font-mono">
                  {items.length}
                </span>
              )}
            </Link>
          </Tooltip>

          {/* Notification Center Popover */}
          <NotificationCenter />

          {/* Quick Theme Toggle with Tooltip */}
          <Tooltip content={resolvedDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'} side="bottom">
            <button
              type="button"
              onClick={toggleThemeQuick}
              className="p-2 rounded-lg bg-surface border border-border-subtle hover:border-gold/40 text-editorial-muted hover:text-editorial-title transition-all"
              aria-label="Toggle tema cepat"
            >
              {resolvedDark ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-editorial-body" />
              )}
            </button>
          </Tooltip>

          {/* Display Settings Popover (Theme, Density, Grid/List, Motion, Admin) */}
          <SettingsPopover />
        </div>
      </div>
    </header>
  );
}

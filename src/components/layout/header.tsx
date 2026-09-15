'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchDialog } from '../search/search-dialog';
import { NotificationCenter } from '../notifications/notification-center';
import { SettingsPopover } from '../settings/settings-popover';
import { Bookmark, Sparkles, Moon, Sun } from 'lucide-react';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useDisplaySettings } from '@/hooks/use-display-settings';
import { Tooltip } from '@/components/ui/tooltip';

export function Header() {
  const { items } = useWatchlist();
  const { theme, setTheme, resolvedDark } = useDisplaySettings();
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
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border-subtle px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
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
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
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
    </header>
  );
}

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
import { UserMenu } from '@/components/auth/user-menu';
import { LiveBadge } from './live-badge';

export function Header() {
  const { items } = useWatchlist();
  const { theme, setTheme, resolvedDark } = useDisplaySettings();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
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
        {/* Row 1: Brand Logo + Streamlined Controls (Theme Toggle & Profile) */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 focus:outline-none group">
            <span className="font-editorial text-lg font-bold tracking-tight text-editorial-title group-hover:text-gold transition-colors">
              nuvell
            </span>
            <LiveBadge />
          </Link>

          {/* Right Icon Actions: Theme toggle (left) & Profile icon (right) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleThemeQuick}
              className="w-9 h-9 rounded-xl bg-surface border border-border-subtle hover:border-gold/40 text-editorial-muted flex items-center justify-center active:scale-95 transition-all"
              aria-label={resolvedDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {resolvedDark ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-editorial-body" />
              )}
            </button>

            {/* Profile Menu: Watchlist & Notifications are accessed inside */}
            <UserMenu onOpenNotifications={() => setIsNotifOpen(true)} />
          </div>
        </div>

        {/* Row 2: Full-width Search Trigger */}
        <div className="w-full">
          <SearchDialog />
        </div>
      </div>

      {/* Hidden Mobile Notification Sheet Triggered from UserMenu */}
      <NotificationCenter isOpen={isNotifOpen} onOpenChange={setIsNotifOpen} hideTrigger />

      {/* DESKTOP HEADER (hidden sm:flex): Elegant Single-Row Layout */}
      <div className="hidden sm:flex items-center justify-between gap-4 px-6 lg:px-8 py-3">
        {/* Left: Solid Brand & Desktop Breadcrumb Context */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-1.5 focus:outline-none group">
            <span className="font-editorial text-xl font-bold tracking-tight text-editorial-title group-hover:text-gold transition-colors">
              nuvell
            </span>
            <LiveBadge />
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

          {/* User Profile / Auth Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

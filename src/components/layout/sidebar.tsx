'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Sparkles,
  Calendar,
  BookmarkCheck,
  LineChart,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
} from 'lucide-react';
import { useDisplaySettings } from '@/hooks/use-display-settings';
import { Tooltip } from '@/components/ui/tooltip';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: Compass, exact: true },
  { href: '/discover', label: 'Discover', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/library', label: 'Library', icon: BookmarkCheck },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: '/insights', label: 'Insights', icon: LineChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useDisplaySettings();

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-surface border-r border-border-subtle z-40 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-20 p-3 items-center' : 'w-64 p-5'
      }`}
      aria-label="Navigasi Utama Desktop"
    >
      {/* Brand Header */}
      <div className={`mb-6 flex items-center justify-between ${sidebarCollapsed ? 'w-full flex-col gap-3' : ''}`}>
        <Link href="/" className="inline-block group focus:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-md">
          {sidebarCollapsed ? (
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold font-editorial text-xl font-black group-hover:bg-gold/25 transition-all shadow-sm">
              N
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-editorial text-2xl font-black tracking-tight text-editorial-title group-hover:text-gold transition-colors">
                  nuvell
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-editorial-faint font-serif italic">
                book discovery & release tracker
              </p>
            </div>
          )}
        </Link>

        {/* Sidebar Collapse Toggle Button */}
        <Tooltip content={sidebarCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'} side={sidebarCollapsed ? 'right' : 'bottom'}>
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-editorial-faint hover:text-editorial-title hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            aria-label={sidebarCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </Tooltip>
      </div>

      {/* Primary Navigation Section */}
      <nav className={`space-y-1 flex-1 w-full ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!sidebarCollapsed && (
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-editorial-faint">
            Menu Utama
          </div>
        )}

        {PRIMARY_NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl transition-all group focus:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                sidebarCollapsed
                  ? 'w-11 h-11 justify-center'
                  : 'px-3.5 py-2.5 text-sm font-medium'
              } ${
                isActive
                  ? 'bg-surface-raised text-gold font-semibold shadow-sm'
                  : 'text-editorial-muted hover:text-editorial-title hover:bg-surface-raised/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-gold' : 'text-editorial-faint group-hover:text-gold'
                }`}
              />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );

          if (sidebarCollapsed) {
            return (
              <Tooltip key={item.href} content={item.label} side="right">
                {linkContent}
              </Tooltip>
            );
          }

          return linkContent;
        })}

        {/* Subtle Divider */}
        <div className={`my-3 border-t border-border-subtle ${sidebarCollapsed ? 'w-8' : 'w-full'}`} />

        {!sidebarCollapsed && (
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-editorial-faint">
            Wawasan
          </div>
        )}

        {SECONDARY_NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl transition-all group focus:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                sidebarCollapsed
                  ? 'w-11 h-11 justify-center'
                  : 'px-3.5 py-2.5 text-sm font-medium'
              } ${
                isActive
                  ? 'bg-surface-raised text-gold font-semibold shadow-sm'
                  : 'text-editorial-muted hover:text-editorial-title hover:bg-surface-raised/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-gold' : 'text-editorial-faint group-hover:text-gold'
                }`}
              />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );

          if (sidebarCollapsed) {
            return (
              <Tooltip key={item.href} content={item.label} side="right">
                {linkContent}
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Minimal Footer Status - Discreet & Quiet */}
      <div className={`pt-4 border-t border-border-subtle w-full ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        {sidebarCollapsed ? (
          <Tooltip content="Jadwal resmi terbitan Indonesia (WIB)" side="right">
            <div className="p-2 text-editorial-faint hover:text-gold transition-colors">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </Tooltip>
        ) : (
          <div className="px-3 py-2 rounded-xl bg-surface-raised/40 border border-border-subtle text-[11px] text-editorial-faint space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-editorial-muted font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Jadwal Resmi
              </span>
              <span className="font-mono text-[10px]">WIB</span>
            </div>
            <p className="text-[10px] text-editorial-faint line-clamp-1">
              Penerbit buku & manga Indonesia
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

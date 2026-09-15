'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Sparkles, Calendar, BookmarkCheck } from 'lucide-react';

const MOBILE_TABS = [
  { href: '/', label: 'Home', icon: Compass, exact: true },
  { href: '/discover', label: 'Discover', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/library', label: 'Library', icon: BookmarkCheck },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-border-subtle px-2 py-1.5 flex items-center justify-around safe-bottom"
      aria-label="Navigasi Bawah Mobile"
    >
      {MOBILE_TABS.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
              isActive
                ? 'text-gold font-semibold'
                : 'text-editorial-muted hover:text-editorial-title'
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-1 transition-colors ${
                isActive ? 'text-gold scale-105' : 'text-editorial-faint'
              }`}
            />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

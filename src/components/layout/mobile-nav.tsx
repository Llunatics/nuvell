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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border-subtle px-3 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom,16px))] flex items-center justify-around shadow-lg"
      aria-label="Navigasi Bawah Mobile"
    >
      {MOBILE_TABS.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[46px] py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all ${
              isActive
                ? 'text-gold font-semibold bg-gold/10'
                : 'text-editorial-muted hover:text-editorial-title active:scale-95'
            }`}
          >
            <Icon
              className={`w-4 h-4 mb-1 transition-transform ${
                isActive ? 'text-gold scale-110 stroke-[2.2]' : 'text-editorial-faint stroke-[1.8]'
              }`}
            />
            <span className="leading-tight tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

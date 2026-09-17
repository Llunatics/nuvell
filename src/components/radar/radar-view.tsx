'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Radar,
  Bookmark,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  Building2,
  Calendar,
  Clock,
  Trash2,
  Plus,
} from 'lucide-react';
import { useWatchlist } from '@/hooks/use-watchlist';
import { Publication } from '@/types';
import { ReleaseCard } from '@/components/books/release-card';
import { getTodayDateWIB, getRollingPastDateWIB } from '@/lib/formatters';

interface RadarViewProps {
  publications: Publication[];
}

const QUICK_TARGETS = [
  { type: 'PUBLISHER' as const, id: 'pub_elex', name: 'Elex Media Komputindo', slug: 'elex-media-komputindo' },
  { type: 'PUBLISHER' as const, id: 'pub_pgi', name: 'Phoenix Gramedia Indonesia', slug: 'phoenix-gramedia-indonesia' },
  { type: 'PUBLISHER' as const, id: 'pub_mnc', name: 'm&c! Publishing', slug: 'mc-publishing' },
  { type: 'SERIES' as const, id: 'ser_one_piece', name: 'One Piece', slug: 'one-piece' },
  { type: 'SERIES' as const, id: 'ser_kagurabachi', name: 'Kagurabachi', slug: 'kagurabachi' },
  { type: 'SERIES' as const, id: 'ser_spy_x_family', name: 'Spy x Family', slug: 'spy-x-family' },
  { type: 'SERIES' as const, id: 'ser_blue_lock', name: 'Blue Lock', slug: 'blue-lock' },
];

export function RadarView({ publications }: RadarViewProps) {
  const { items, toggleWatchlist } = useWatchlist();
  const todayStr = useMemo(() => getTodayDateWIB(), []);
  const rollingPastStr = useMemo(() => getRollingPastDateWIB(14), []);

  // Filter publications based on followed entities
  const radarMatches = useMemo(() => {
    if (items.length === 0) return [];
    return publications.filter((pub) => {
      if (items.some((it) => it.type === 'BOOK' && it.targetId === pub.id)) return true;
      if (pub.seriesId && items.some((it) => it.type === 'SERIES' && it.targetId === pub.seriesId)) return true;
      if (items.some((it) => it.type === 'PUBLISHER' && it.targetId === pub.publisherId)) return true;
      if (pub.authors?.some((a) => items.some((it) => it.type === 'AUTHOR' && it.targetId === a.authorId))) return true;
      return false;
    });
  }, [items, publications]);

  const newThisMonth = useMemo(() => {
    return radarMatches
      .filter((p) => p.releaseDate && p.releaseDate >= rollingPastStr && p.releaseDate <= todayStr)
      .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''));
  }, [radarMatches, rollingPastStr, todayStr]);

  const upcoming = useMemo(() => {
    return radarMatches
      .filter((p) => (p.releaseDate && p.releaseDate > todayStr) || p.status === 'PREORDER' || p.status === 'ANNOUNCED')
      .sort((a, b) => (a.releaseDate || '2099-12-31').localeCompare(b.releaseDate || '2099-12-31'));
  }, [radarMatches, todayStr]);

  const priceChanges = useMemo(() => {
    return radarMatches.filter((p) => p.recentChangeBadge === 'PRICE DROP');
  }, [radarMatches]);

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-gold">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-gold mb-1">
            <Radar className="w-3.5 h-3.5 animate-spin" />
            LIVE RADAR PELACAK RILISAN RESMI
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-editorial-title">
            My Release Radar
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted mt-1 max-w-xl">
            Laporan rilisan khusus terfilter berdasarkan buku, seri komik, pengarang, dan penerbit yang Anda ikuti di Watchlist. Terhubung langsung ke katalog 5.500+ buku Gramedia.
          </p>
        </div>

        <div className="glass-card p-4 rounded-xl shrink-0 min-w-[200px] text-right space-y-1">
          <span className="text-[10px] font-mono text-editorial-faint uppercase block">
            Entitas Diikuti
          </span>
          <p className="text-2xl font-bold font-editorial text-gold">{items.length}</p>
          <span className="text-[11px] font-mono text-editorial-muted block">
            {radarMatches.length} terbitan terdeteksi di radar
          </span>
        </div>
      </div>

      {/* Followed Targets Management Strip */}
      <section className="space-y-3">
        <h2 className="font-editorial text-base font-bold text-editorial-title flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-gold" />
          Daftar Entitas yang Anda Ikuti ({items.length})
        </h2>

        {items.length === 0 ? (
          <div className="glass-card p-6 sm:p-8 rounded-xl space-y-4">
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-editorial-title">Radar Anda masih belum memantau entitas apapun</p>
              <p className="text-xs text-editorial-muted max-w-md mx-auto">
                Pilih penerbit atau seri favorit di bawah ini untuk langsung memantau rilisan baru dan tanggal rilis mendatang:
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {QUICK_TARGETS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleWatchlist(t.type, t.id, t.name, t.slug)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-raised border border-border-subtle hover:border-gold/40 text-xs text-editorial-body transition-all"
                >
                  <Plus className="w-3 h-3 text-gold" />
                  <span className="text-[10px] font-mono text-editorial-faint uppercase">{t.type}</span>
                  <span className="font-medium text-editorial-title">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border-subtle text-xs"
              >
                <span className="text-[10px] font-mono text-gold uppercase">{it.type}</span>
                <span className="font-medium text-editorial-title">{it.targetName}</span>
                <button
                  type="button"
                  onClick={() => toggleWatchlist(it.type, it.targetId, it.targetName, it.targetSlug)}
                  className="text-editorial-faint hover:text-rose-400 ml-1 transition-colors"
                  title="Berhenti ikuti"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Radar Category: Fresh September 2026 Releases */}
      {newThisMonth.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
                Rilisan Baru September 2026 dari Watchlist ({newThisMonth.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newThisMonth.slice(0, 16).map((pub) => (
              <ReleaseCard key={pub.id} publication={pub} layout="grid" />
            ))}
          </div>
        </section>
      )}

      {/* Radar Category: Upcoming Preorders */}
      {upcoming.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-burgundy-400" />
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
                Segera Datang & Pre-order Terdekat ({upcoming.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {upcoming.map((pub) => (
              <ReleaseCard key={pub.id} publication={pub} layout="grid" />
            ))}
          </div>
        </section>
      )}

      {/* Radar Category: Price Changes */}
      {priceChanges.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
              Penurunan Harga Terdeteksi di Watchlist ({priceChanges.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {priceChanges.map((pub) => (
              <ReleaseCard key={pub.id} publication={pub} layout="list" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

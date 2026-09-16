'use client';

import React from 'react';
import Link from 'next/link';
import { Series, Publication } from '@/types';
import { useCollection } from '@/hooks/use-collection';
import { useWatchlist } from '@/hooks/use-watchlist';
import { Bookmark, Check, Plus, ExternalLink } from 'lucide-react';

interface SeriesVolumeMatrixProps {
  series: Series;
  publications: Publication[];
}

export function SeriesVolumeMatrix({ series, publications }: SeriesVolumeMatrixProps) {
  const { isWatchlisted, toggleWatchlist } = useWatchlist();
  const { getItemStatus, setItemStatus, getSeriesProgress } = useCollection();

  const isFollowed = isWatchlisted('SERIES', series.id);
  const progress = getSeriesProgress(series.id, series.totalVolumes);

  // Map known volumes
  const volumeMap = new Map<number, Publication>();
  publications.forEach((p) => {
    if (p.volume) volumeMap.set(p.volume, p);
  });

  const knownMax = volumeMap.size > 0 ? Math.max(...Array.from(volumeMap.keys())) : 0;
  const maxVolume = Math.max(series.totalVolumes || 0, knownMax, 1);

  return (
    <div className="space-y-8">
      {/* Series Header & Progress Box */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-gold">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-border-subtle text-gold uppercase">
              {series.status}
            </span>
            <span className="text-xs font-mono text-editorial-faint">
              {series.publisherName}
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-editorial-title">
            {series.name}
          </h1>
          {series.originalTitle && (
            <p className="text-xs font-editorial italic text-editorial-muted">
              {series.originalTitle}
            </p>
          )}
          {series.description && (
            <p className="text-xs sm:text-sm text-editorial-muted max-w-2xl leading-relaxed pt-1">
              {series.description}
            </p>
          )}
        </div>

        {/* Watchlist & Progress Widget */}
        <div className="glass-card p-4 rounded-xl shrink-0 min-w-[240px] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-editorial-faint font-mono">Progress Koleksi:</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {progress.percentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-editorial-faint">
            <span>{progress.owned} dimiliki</span>
            <span>{series.totalVolumes ? `Total ${series.totalVolumes}` : 'Ongoing'}</span>
          </div>

          <button
            type="button"
            onClick={() => toggleWatchlist('SERIES', series.id, series.name, series.slug)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
              isFollowed
                ? 'bg-gold text-background border-gold font-bold shadow-md'
                : 'bg-surface hover:bg-surface-raised border-border-subtle text-editorial-title'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isFollowed ? 'currentColor' : 'none'} />
            {isFollowed ? 'Seri Diikuti di Radar' : '+ Ikuti Seri Ini'}
          </button>
        </div>
      </div>

      {/* Volume Matrix Grid (Section 22) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
              Matriks Jilid / Volume Tracker
            </h2>
            <p className="text-xs text-editorial-muted">
              Klik kotak volume untuk menandai koleksi (Dimiliki / Wishlist) atau melihat detail rilis.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
              <span className="text-editorial-faint">Dimiliki</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-gold/20 border border-gold/40" />
              <span className="text-editorial-faint">Tersedia</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-surface border border-border-subtle opacity-50" />
              <span className="text-editorial-faint">Belum Terbit</span>
            </div>
          </div>
        </div>

        {/* Matrix Boxes [01][02][03]... */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2.5">
          {Array.from({ length: Math.min(maxVolume, 108) }).map((_, idx) => {
            const volNum = idx + 1;
            const pub = volumeMap.get(volNum);
            const status = pub ? getItemStatus(pub.id) : null;
            const isOwned = status === 'OWNED';
            const isWishlist = status === 'WISHLIST';

            return (
              <div
                key={`vol-${volNum}`}
                className={`p-2 rounded-xl border flex flex-col justify-between transition-all group relative ${
                  isOwned
                    ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                    : isWishlist
                    ? 'bg-amber-950/40 border-amber-500/50'
                    : pub
                    ? 'bg-surface hover:bg-surface-raised border-border-subtle hover:border-gold/40'
                    : 'bg-surface/20 border-transparent opacity-40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isOwned ? 'text-emerald-400' : isWishlist ? 'text-amber-400' : 'text-editorial-title'
                    }`}
                  >
                    {String(volNum).padStart(2, '0')}
                  </span>
                  {pub && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = isOwned ? null : 'OWNED';
                        setItemStatus(pub.id, next, {
                          seriesId: series.id,
                          volume: volNum,
                        });
                      }}
                      className="p-1 rounded hover:bg-surface text-editorial-faint hover:text-emerald-400 transition-colors"
                      title={isOwned ? 'Tandai belum punya' : 'Tandai sudah dimiliki'}
                      aria-label={`Tandai volume ${volNum}`}
                    >
                      <Check className={`w-3 h-3 ${isOwned ? 'text-emerald-400' : 'opacity-40'}`} />
                    </button>
                  )}
                </div>

                <div className="mt-2 text-[10px] font-mono truncate text-editorial-faint">
                  {pub ? (
                    <Link
                      href={`/books/${pub.slug}`}
                      className="hover:text-gold transition-colors flex items-center gap-1"
                    >
                      <span className="truncate">Rilis</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </Link>
                  ) : (
                    <span>TBA</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

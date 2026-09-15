'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, BookOpen, Search } from 'lucide-react';

export interface SeriesSummary {
  id: string;
  slug: string;
  name: string;
  originalTitle?: string;
  publisherName?: string;
  totalVolumes?: number;
  coverUrl?: string;
}

interface SeriesTrackerClientProps {
  allSeries: SeriesSummary[];
}

export function SeriesTrackerClient({ allSeries }: SeriesTrackerClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(36);

  const filteredSeries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allSeries;
    return allSeries.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        (s.originalTitle && s.originalTitle.toLowerCase().includes(q)) ||
        (s.publisherName && s.publisherName.toLowerCase().includes(q))
      );
    });
  }, [allSeries, searchQuery]);

  const visibleSeries = filteredSeries.slice(0, displayLimit);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-border-subtle">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-editorial-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayLimit(36);
            }}
            placeholder="Cari nama seri, waralaba, atau penerbit..."
            className="w-full bg-surface border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-editorial-body placeholder:text-editorial-muted focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <span className="text-xs font-mono text-editorial-muted">
          Menampilkan {visibleSeries.length} dari {filteredSeries.length} Seri
        </span>
      </div>

      {/* Series Grid */}
      {visibleSeries.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-editorial-faint mx-auto" />
          <h3 className="font-editorial text-lg font-bold text-editorial-title">
            Tidak ditemukan seri
          </h3>
          <p className="text-xs text-editorial-muted">
            Coba gunakan kata kunci pencarian yang lebih umum.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleSeries.map((series) => (
              <Link
                key={series.id}
                href={`/series/${series.slug}`}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between group space-y-4 hover:border-gold/40 transition-all shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-28 bg-surface-overlay rounded-xl overflow-hidden shrink-0 border border-border-subtle shadow-md">
                    {series.coverUrl && (
                      <img
                        src={series.coverUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-gold block truncate">
                      {series.publisherName}
                    </span>
                    <h2 className="font-editorial text-base font-bold text-editorial-title group-hover:text-gold transition-colors line-clamp-2">
                      {series.name}
                    </h2>
                    {series.originalTitle && (
                      <p className="text-xs font-editorial italic text-editorial-muted line-clamp-1">
                        {series.originalTitle}
                      </p>
                    )}
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border-subtle text-editorial-body">
                        {series.totalVolumes ? `${series.totalVolumes} Volume` : 'Ongoing'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-gold font-medium">
                  <span>Buka Matrix Volume</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {filteredSeries.length > displayLimit && (
            <div className="text-center pt-6">
              <button
                type="button"
                onClick={() => setDisplayLimit((prev) => prev + 36)}
                className="px-6 py-3 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle hover:border-gold/40 text-xs sm:text-sm font-medium text-editorial-body hover:text-gold transition-all shadow-sm group inline-flex items-center gap-2"
              >
                <span>Tampilkan Lebih Banyak Seri ({displayLimit} dari {filteredSeries.length} Seri)</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

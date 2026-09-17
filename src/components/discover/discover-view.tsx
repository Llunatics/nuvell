'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Flame,
  Clock,
  Layers,
  Building2,
  Tag,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Publication, Publisher, Series } from '@/types';
import { ReleaseFeed } from '@/components/feed/release-feed';
import { ReleaseCard } from '@/components/books/release-card';
import { getTodayDateWIB } from '@/lib/formatters';

interface DiscoverViewProps {
  publications: Publication[];
  publishers: Publisher[];
  series: Series[];
}

type DiscoverTab = 'latest' | 'upcoming' | 'series' | 'publishers' | 'genres';

export function DiscoverView({ publications, publishers, series }: DiscoverViewProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as DiscoverTab) || 'latest';
  const todayStr = useMemo(() => getTodayDateWIB(), []);
  const [activeTab, setActiveTab] = useState<DiscoverTab>(
    ['latest', 'upcoming', 'series', 'publishers', 'genres'].includes(initialTab) ? initialTab : 'latest'
  );

  // Series search & filter
  const [seriesSearch, setSeriesSearch] = useState('');
  const filteredSeries = useMemo(() => {
    if (!seriesSearch.trim()) return series;
    const q = seriesSearch.toLowerCase();
    return series.filter(
      (s) => s.name.toLowerCase().includes(q) || s.publisherName?.toLowerCase().includes(q)
    );
  }, [series, seriesSearch]);

  // Publisher search & filter
  const [publisherSearch, setPublisherSearch] = useState('');
  const filteredPublishers = useMemo(() => {
    if (!publisherSearch.trim()) return publishers;
    const q = publisherSearch.toLowerCase();
    return publishers.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [publishers, publisherSearch]);

  // Unique genres
  const genresList = useMemo(() => {
    const genreCounts = new Map<string, number>();
    publications.forEach((p) => {
      p.genres?.forEach((g) => {
        genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
      });
    });
    return Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1]);
  }, [publications]);

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const genrePublications = useMemo(() => {
    if (!selectedGenre) return [];
    return publications.filter((p) => p.genres?.includes(selectedGenre));
  }, [publications, selectedGenre]);

  return (
    <div className="space-y-8">
      {/* Editorial Page Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-gold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Eksplorasi Katalog</span>
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-editorial-title tracking-tight">
          DISCOVER
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted max-w-xl leading-relaxed">
          Eksplorasi rilisan baru, seri komik, profil penerbit, dan jadwal rilis mendatang.
        </p>
      </div>

      {/* Tabs Navigation: Horizontal Scrollable Strip */}
      <div className="flex items-center gap-1.5 p-1 bg-surface-raised rounded-2xl border border-border-subtle overflow-x-auto no-scrollbar shadow-xs -mx-1 px-1">
        {[
          { id: 'latest', label: 'Terbaru', fullLabel: 'Rilisan Terbaru', icon: Flame },
          { id: 'upcoming', label: 'Akan Datang', fullLabel: 'Akan Datang', icon: Clock },
          { id: 'series', label: 'Seri', fullLabel: `Seri (${series.length})`, icon: Layers },
          { id: 'publishers', label: 'Penerbit', fullLabel: `Penerbit (${publishers.length})`, icon: Building2 },
          { id: 'genres', label: 'Genre', fullLabel: 'Genre & Kategori', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DiscoverTab)}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-surface text-editorial-title font-semibold shadow-xs border border-border-subtle'
                  : 'text-editorial-muted hover:text-editorial-title hover:bg-surface/50 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-editorial-faint'}`} />
              <span className="sm:hidden">{tab.label}</span>
              <span className="hidden sm:inline">{tab.fullLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Latest Releases */}
      {activeTab === 'latest' && (
        <ReleaseFeed
          initialPublications={publications}
          publishers={publishers}
          title="Katalog Rilis Terbaru"
          description="Daftar buku dan manga yang baru terbit dan beredar resmi di Indonesia"
        />
      )}

      {/* Tab 2: Upcoming Releases */}
      {activeTab === 'upcoming' && (
        <ReleaseFeed
          initialPublications={publications.filter(
            (p) => (p.releaseDate && p.releaseDate > todayStr) || p.status === 'PREORDER' || p.status === 'ANNOUNCED'
          )}
          publishers={publishers}
          title="Jadwal Rilis Mendatang & Pre-order"
          description="Buku dan komik dengan jadwal rilis mendatang dan pre-order resmi"
        />
      )}

      {/* Tab 3: Series Exploration */}
      {activeTab === 'series' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-editorial text-xl font-bold text-editorial-title">
                Katalog Seri & Waralaba
              </h2>
              <p className="text-xs text-editorial-muted mt-0.5">
                Lacak nomor volume komik, light novel, dan seri berkelanjutan
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-editorial-faint" />
              <input
                type="text"
                value={seriesSearch}
                onChange={(e) => setSeriesSearch(e.target.value)}
                placeholder="Cari nama seri atau penerbit..."
                className="w-full bg-surface pl-9 pr-3 py-1.5 rounded-xl border border-border-subtle text-xs text-editorial-title placeholder:text-editorial-faint focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSeries.map((s) => (
              <Link
                key={s.id}
                href={`/series/${s.slug}`}
                className="glass-card rounded-2xl p-4 flex items-center gap-4 group hover:border-gold/40 transition-all"
              >
                <div className="w-16 h-22 bg-surface rounded-xl overflow-hidden shrink-0 border border-border-subtle">
                  {s.coverUrl ? (
                    <img src={s.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-editorial-faint text-xs">
                      Seri
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10px] font-mono text-editorial-faint block uppercase truncate">
                    {s.publisherName}
                  </span>
                  <h3 className="font-editorial text-sm sm:text-base font-bold text-editorial-title group-hover:text-gold transition-colors truncate">
                    {s.name}
                  </h3>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-surface border border-border-subtle text-editorial-muted">
                      {s.totalVolumes ? `${s.totalVolumes} Volume` : 'Ongoing'}
                    </span>
                    <span className="text-xs text-gold flex items-center gap-0.5 font-medium group-hover:translate-x-1 transition-transform">
                      Detail →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Publishers Directory */}
      {activeTab === 'publishers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-editorial text-xl font-bold text-editorial-title">
                Direktori Penerbit Resmi
              </h2>
              <p className="text-xs text-editorial-muted mt-0.5">
                Daftar penerbit buku dan komik resmi di Indonesia yang dipantau nuvell
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-editorial-faint" />
              <input
                type="text"
                value={publisherSearch}
                onChange={(e) => setPublisherSearch(e.target.value)}
                placeholder="Cari penerbit..."
                className="w-full bg-surface pl-9 pr-3 py-1.5 rounded-xl border border-border-subtle text-xs text-editorial-title placeholder:text-editorial-faint focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPublishers.map((p) => {
              const pubBooks = publications.filter((b) => b.publisherId === p.id);
              return (
                <Link
                  key={p.id}
                  href={`/publishers/${p.slug}`}
                  className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 group hover:border-gold/40 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-gold font-bold font-editorial text-lg group-hover:border-gold/50 transition-colors">
                        {p.name[0]}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Resmi
                      </span>
                    </div>
                    <div>
                      <h3 className="font-editorial text-base font-bold text-editorial-title group-hover:text-gold transition-colors">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-editorial-muted mt-1 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                    <span className="font-mono text-editorial-faint">
                      {pubBooks.length} judul terindeks
                    </span>
                    <span className="text-gold font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Katalog →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Genres Exploration */}
      {activeTab === 'genres' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-editorial text-xl font-bold text-editorial-title">
              Jelajahi Berdasarkan Genre
            </h2>
            <p className="text-xs text-editorial-muted mt-0.5">
              Pilih genre untuk melihat daftar buku terkait
            </p>
          </div>

          {/* Genre Pills */}
          <div className="flex flex-wrap gap-2">
            {genresList.map(([genre, count]) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(isSelected ? null : genre)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gold text-background font-semibold shadow-sm'
                      : 'bg-surface hover:bg-surface-raised border border-border-subtle text-editorial-body hover:text-editorial-title'
                  }`}
                >
                  <span>{genre}</span>
                  <span className={`ml-1.5 font-mono text-[10px] ${isSelected ? 'opacity-80' : 'text-editorial-faint'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Genre Results */}
          {selectedGenre && (
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <h3 className="text-sm font-semibold text-editorial-title font-editorial">
                  Publikasi Genre: <span className="text-gold">{selectedGenre}</span> ({genrePublications.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedGenre(null)}
                  className="text-xs text-editorial-faint hover:text-gold"
                >
                  Tutup
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {genrePublications.slice(0, 16).map((pub) => (
                  <ReleaseCard key={pub.id} publication={pub} layout="grid" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

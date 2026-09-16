'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookmarkCheck,
  Bookmark,
  History,
  Layers,
  Sparkles,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ExternalLink,
  Plus,
  BookOpen,
} from 'lucide-react';
import { Publication, Series } from '@/types';
import { ReleaseCard } from '@/components/books/release-card';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useCollection } from '@/hooks/use-collection';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { formatIDR, formatShortDate } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';

interface LibraryViewProps {
  publications: Publication[];
  featuredSeries: Series[];
}

type LibraryTab = 'watchlist' | 'collection' | 'history';

const QUICK_TARGETS = [
  { type: 'PUBLISHER' as const, id: 'pub_elex', name: 'Elex Media Komputindo', slug: 'elex-media-komputindo' },
  { type: 'PUBLISHER' as const, id: 'pub_pgi', name: 'Phoenix Gramedia Indonesia', slug: 'phoenix-gramedia-indonesia' },
  { type: 'PUBLISHER' as const, id: 'pub_mnc', name: 'm&c! Publishing', slug: 'mc-publishing' },
  { type: 'SERIES' as const, id: 'ser_one_piece', name: 'One Piece', slug: 'one-piece' },
  { type: 'SERIES' as const, id: 'ser_kagurabachi', name: 'Kagurabachi', slug: 'kagurabachi' },
  { type: 'SERIES' as const, id: 'ser_spy_x_family', name: 'Spy x Family', slug: 'spy-x-family' },
  { type: 'SERIES' as const, id: 'ser_blue_lock', name: 'Blue Lock', slug: 'blue-lock' },
];

export function LibraryView({ publications, featuredSeries }: LibraryViewProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as LibraryTab) || 'watchlist';
  const [activeTab, setActiveTab] = useState<LibraryTab>(
    ['watchlist', 'collection', 'history'].includes(initialTab) ? initialTab : 'watchlist'
  );

  const { items: watchlistItems, toggleWatchlist } = useWatchlist();
  const {
    collection,
    totalItems: collectionTotal,
    exportCollectionJson,
    importCollectionJson,
    getSeriesProgress,
    setItemStatus,
  } = useCollection();
  const { items: recentItems, clearRecentItems } = useRecentlyViewed();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Match publications for Watchlist Radar
  const watchlistMatches = useMemo(() => {
    if (watchlistItems.length === 0) return [];
    return publications.filter((pub) => {
      if (watchlistItems.some((it) => it.type === 'BOOK' && it.targetId === pub.id)) return true;
      if (pub.seriesId && watchlistItems.some((it) => it.type === 'SERIES' && it.targetId === pub.seriesId)) return true;
      if (watchlistItems.some((it) => it.type === 'PUBLISHER' && it.targetId === pub.publisherId)) return true;
      return false;
    });
  }, [watchlistItems, publications]);

  // Collection breakdown
  const collectionItems = Array.from(collection.values());
  const ownedCount = collectionItems.filter((i) => i.status === 'OWNED').length;
  const wishlistCount = collectionItems.filter((i) => i.status === 'WISHLIST').length;
  const preorderedCount = collectionItems.filter((i) => i.status === 'PREORDERED').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importCollectionJson(content);
        if (success) {
          toast({ title: 'Koleksi berhasil diimpor!', variant: 'success' });
        } else {
          toast({ title: 'Gagal mengimpor file', description: 'Format JSON tidak valid', variant: 'error' });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-wider">
          <BookmarkCheck className="w-3.5 h-3.5" />
          RUANG PERSONAL PEMBACA
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-editorial-title">
          Library
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted max-w-2xl leading-relaxed">
          Pusat pemantauan personal: pantau jadwal rilis judul yang Anda ikuti, catat progres kelengkapan volume koleksi fisik, dan tinjau riwayat eksplorasi.
        </p>
      </div>

      {/* Primary Tabs Segmented Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-surface-raised rounded-2xl border border-border-subtle overflow-x-auto no-scrollbar shadow-sm">
        {[
          { id: 'watchlist', label: `Watchlist (${watchlistItems.length})`, icon: Bookmark },
          { id: 'collection', label: `Koleksi Volume (${collectionTotal})`, icon: BookmarkCheck },
          { id: 'history', label: `Terakhir Dilihat (${recentItems.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as LibraryTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-surface text-editorial-title font-semibold shadow-sm border border-border-subtle'
                  : 'text-editorial-muted hover:text-editorial-title hover:bg-surface/50 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-editorial-faint'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WATCHLIST */}
      {activeTab === 'watchlist' && (
        <div className="space-y-8">
          {/* Followed Targets Strip */}
          <div className="p-5 rounded-2xl bg-surface/70 border border-border-subtle backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-sm font-semibold text-editorial-title flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gold" />
                <span>Entitas yang Anda Ikuti ({watchlistItems.length})</span>
              </h3>
              <span className="text-[11px] font-mono text-editorial-faint">
                {watchlistMatches.length} terbitan terdeteksi di radar
              </span>
            </div>

            {watchlistItems.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-editorial-muted">
                  Belum ada entitas di Watchlist Anda. Klik ikon bookmark pada buku, seri, atau penerbit untuk mulai mengikuti.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {watchlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border-subtle text-xs text-editorial-title"
                  >
                    <span className="text-[10px] font-mono text-gold px-1.5 py-0.2 rounded bg-gold/10">
                      {item.type}
                    </span>
                    <span className="font-medium">{item.targetName}</span>
                    <button
                      type="button"
                      onClick={() => toggleWatchlist(item.type, item.targetId, item.targetName, item.targetSlug)}
                      className="text-editorial-faint hover:text-rose-400 transition-colors p-0.5"
                      title="Hapus dari watchlist"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Follow Suggestions */}
            <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center gap-2 text-xs">
              <span className="text-editorial-faint font-mono text-[11px]">Saran Cepat:</span>
              {QUICK_TARGETS.map((t) => {
                const isFollowed = watchlistItems.some((it) => it.type === t.type && it.targetId === t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleWatchlist(t.type, t.id, t.name, t.slug)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isFollowed
                        ? 'bg-gold/15 text-gold border-gold/40'
                        : 'bg-surface border-border-subtle text-editorial-muted hover:text-editorial-title hover:bg-surface-raised'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radar Matches Feed */}
          <div className="space-y-4">
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
                Rilisan Terkait Watchlist ({watchlistMatches.length})
              </h2>
              <p className="text-xs text-editorial-muted mt-0.5">
                Buku yang otomatis dipantau berdasarkan seri dan penerbit yang Anda ikuti
              </p>
            </div>

            {watchlistMatches.length === 0 ? (
              <div className="p-12 text-center bg-surface/30 rounded-2xl border border-border-subtle space-y-3">
                <Bookmark className="w-8 h-8 text-editorial-faint mx-auto" />
                <h3 className="font-editorial text-base font-semibold text-editorial-title">
                  Your library is quiet.
                </h3>
                <p className="text-xs text-editorial-muted max-w-sm mx-auto">
                  Mulai ikuti penerbit atau seri favorit Anda untuk melihat jadwal dan pemberitahuan rilis terbarunya di sini.
                </p>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-background text-xs font-semibold hover:bg-gold-400 transition-colors shadow-sm"
                >
                  <span>Discover Releases</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {watchlistMatches.map((pub) => (
                  <ReleaseCard key={pub.id} publication={pub} layout="grid" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COLLECTION */}
      {activeTab === 'collection' && (
        <div className="space-y-8">
          {/* Collection Metrics & Backup Strip */}
          <div className="p-6 rounded-2xl bg-surface/70 border border-border-subtle backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6 divide-x divide-border-subtle text-xs">
              <div>
                <span className="font-mono text-xl font-bold text-emerald-400 block">
                  {ownedCount}
                </span>
                <span className="text-editorial-faint">Dimiliki (Owned)</span>
              </div>
              <div className="pl-6">
                <span className="font-mono text-xl font-bold text-amber-400 block">
                  {wishlistCount}
                </span>
                <span className="text-editorial-faint">Wishlist</span>
              </div>
              <div className="pl-6">
                <span className="font-mono text-xl font-bold text-burgundy-400 block">
                  {preorderedCount}
                </span>
                <span className="text-editorial-faint">Pre-ordered</span>
              </div>
            </div>

            {/* Export / Import Controls */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-xs font-medium text-editorial-title flex items-center gap-1.5 transition-colors"
                title="Impor backup JSON koleksi"
              >
                <Upload className="w-3.5 h-3.5 text-editorial-faint" />
                <span>Impor</span>
              </button>
              <button
                type="button"
                onClick={exportCollectionJson}
                className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-xs font-medium text-editorial-title flex items-center gap-1.5 transition-colors"
                title="Unduh cadangan JSON koleksi"
              >
                <Download className="w-3.5 h-3.5 text-gold" />
                <span>Ekspor</span>
              </button>
            </div>
          </div>

          {/* Series Completion Tracker */}
          <div className="space-y-4">
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
                Pelacak Kelengkapan Seri Populer
              </h2>
              <p className="text-xs text-editorial-muted mt-0.5">
                Periksa nomor volume yang telah Anda kumpulkan untuk setiap seri
              </p>
            </div>

            <div className="space-y-3">
              {featuredSeries.map((s) => {
                const progress = getSeriesProgress(s.id, s.totalVolumes);
                return (
                  <div
                    key={s.id}
                    className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-16 bg-surface rounded-lg overflow-hidden shrink-0 border border-border-subtle">
                        {s.coverUrl ? (
                          <img src={s.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-editorial-faint text-[10px]">
                            Cover
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-editorial-faint block uppercase">
                          {s.publisherName}
                        </span>
                        <h3 className="font-editorial text-sm sm:text-base font-bold text-editorial-title truncate">
                          {s.name}
                        </h3>
                        <p className="text-xs text-editorial-muted mt-0.5">
                          {progress.owned} dari {progress.total} volume dimiliki ({progress.percentage}%)
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="flex items-center gap-4 sm:w-64">
                      <div className="flex-1 space-y-1">
                        <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border-subtle">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-gold rounded-full transition-all duration-500"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-editorial-faint">
                          <span>{progress.owned} Owned</span>
                          <span>{progress.total - progress.owned} Missing</span>
                        </div>
                      </div>
                      <Link
                        href={`/series/${s.slug}`}
                        className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-xs font-medium text-editorial-title hover:text-gold transition-colors shrink-0"
                      >
                        Kelola
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY (Recently Viewed) */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
                Buku & Seri Terakhir Dilihat
              </h2>
              <p className="text-xs text-editorial-muted mt-0.5">
                Riwayat penelusuran lokal tersimpan di browser Anda
              </p>
            </div>
            {recentItems.length > 0 && (
              <button
                type="button"
                onClick={clearRecentItems}
                className="text-xs text-editorial-faint hover:text-rose-400 transition-colors flex items-center gap-1 font-mono"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Riwayat</span>
              </button>
            )}
          </div>

          {recentItems.length === 0 ? (
            <div className="p-12 text-center bg-surface/30 rounded-2xl border border-border-subtle space-y-2">
              <History className="w-8 h-8 text-editorial-faint mx-auto" />
              <p className="text-xs text-editorial-muted">
                Belum ada riwayat buku atau seri yang dilihat.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.type === 'BOOK' ? `/books/${item.slug}` : `/series/${item.slug}`}
                  className="glass-card rounded-xl p-3 flex items-center gap-3 group hover:border-gold/40 transition-all"
                >
                  <div className="w-10 h-14 bg-surface rounded-md overflow-hidden shrink-0 border border-border-subtle">
                    {item.coverImage && (
                      <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-gold block">
                      {item.type}
                    </span>
                    <h4 className="text-xs font-semibold text-editorial-title group-hover:text-gold transition-colors truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-editorial-faint font-mono block mt-0.5">
                      {formatShortDate(item.viewedAt)}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-editorial-faint group-hover:text-gold group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

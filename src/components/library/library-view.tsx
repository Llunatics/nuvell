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
  Plus,
  BookOpen,
  SlidersHorizontal,
  Search,
  ArrowUpDown,
  Layers3,
} from 'lucide-react';
import { Publication, Series, UserCollectionItem } from '@/types';
import { ReleaseCard } from '@/components/books/release-card';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useCollection } from '@/hooks/use-collection';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { useDisplaySettings } from '@/hooks/use-display-settings';
import { useUserSeries } from '@/hooks/use-user-series';
import { UserSeriesTracker } from '@/components/series/user-series-tracker';
import { formatShortDate } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';

interface LibraryViewProps {
  publications: Publication[];
  featuredSeries?: Series[];
}

type LibraryTab = 'collection' | 'series' | 'watchlist' | 'history';
type CollectionStatusFilter = 'ALL' | 'OWNED' | 'WISHLIST' | 'PREORDERED';
type SortOption = 'recent' | 'title-asc' | 'release-desc' | 'price-asc' | 'price-desc';

const QUICK_TARGETS = [
  { type: 'PUBLISHER' as const, id: 'pub_elex', name: 'Elex Media Komputindo', slug: 'elex-media-komputindo' },
  { type: 'PUBLISHER' as const, id: 'pub_pgi', name: 'Phoenix Gramedia Indonesia', slug: 'phoenix-gramedia-indonesia' },
  { type: 'PUBLISHER' as const, id: 'pub_mnc', name: 'm&c! Publishing', slug: 'mc-publishing' },
  { type: 'SERIES' as const, id: 'ser_one_piece', name: 'One Piece', slug: 'one-piece' },
  { type: 'SERIES' as const, id: 'ser_kagurabachi', name: 'Kagurabachi', slug: 'kagurabachi' },
  { type: 'SERIES' as const, id: 'ser_spy_x_family', name: 'Spy x Family', slug: 'spy-x-family' },
  { type: 'SERIES' as const, id: 'ser_blue_lock', name: 'Blue Lock', slug: 'blue-lock' },
];

export function LibraryView({ publications }: LibraryViewProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as LibraryTab) || 'collection';
  const [activeTab, setActiveTab] = useState<LibraryTab>(
    ['collection', 'series', 'watchlist', 'history'].includes(initialTab) ? initialTab : 'collection'
  );

  const { items: watchlistItems, toggleWatchlist } = useWatchlist();
  const {
    collection,
    exportCollectionJson,
    importCollectionJson,
  } = useCollection();
  const { seriesList } = useUserSeries();
  const { items: recentItems, clearRecentItems } = useRecentlyViewed();
  const { density, setDensity, motion, setMotion } = useDisplaySettings();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search & Sort states for collection
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CollectionStatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Single Source of Truth for collection items:
  // Match user collection IDs strictly against available publications
  const collectedBooks = useMemo(() => {
    return publications
      .map((pub) => {
        const item = collection.get(pub.id);
        return item ? { pub, item } : null;
      })
      .filter(Boolean) as { pub: Publication; item: UserCollectionItem }[];
  }, [publications, collection]);

  // Derived counts guaranteed to match the displayed items
  const ownedCount = useMemo(
    () => collectedBooks.filter((b) => b.item.status === 'OWNED').length,
    [collectedBooks]
  );
  const wishlistCount = useMemo(
    () => collectedBooks.filter((b) => b.item.status === 'WISHLIST').length,
    [collectedBooks]
  );
  const preorderedCount = useMemo(
    () =>
      collectedBooks.filter(
        (b) => b.item.status === 'PREORDERED' || (b.item.status as string) === 'PREORDER'
      ).length,
    [collectedBooks]
  );
  const allCount = collectedBooks.length;

  // Incomplete user series count
  const incompleteSeriesCount = useMemo(() => {
    return seriesList.filter((s) => {
      const owned = s.volumes.filter((v) => v.status === 'OWNED').length;
      if (s.totalVolumes && s.totalVolumes > 0) {
        return owned < s.totalVolumes;
      }
      return s.volumes.some((v) => v.status === 'MISSING' || v.status === 'WISHLIST');
    }).length;
  }, [seriesList]);

  // Filter and Sort
  const filteredAndSortedBooks = useMemo(() => {
    let list = collectedBooks;

    // 1. Status Filter
    if (statusFilter === 'OWNED') {
      list = list.filter((b) => b.item.status === 'OWNED');
    } else if (statusFilter === 'WISHLIST') {
      list = list.filter((b) => b.item.status === 'WISHLIST');
    } else if (statusFilter === 'PREORDERED') {
      list = list.filter(
        (b) => b.item.status === 'PREORDERED' || (b.item.status as string) === 'PREORDER'
      );
    }

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.pub.title.toLowerCase().includes(q) ||
          b.pub.publisherName?.toLowerCase().includes(q) ||
          b.pub.authors?.some((a) =>
            (typeof a === 'string' ? a : a.name || '').toLowerCase().includes(q)
          )
      );
    }

    // 3. Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'recent') {
        const timeA = new Date(a.item.updatedAt || 0).getTime();
        const timeB = new Date(b.item.updatedAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'title-asc') {
        return a.pub.title.localeCompare(b.pub.title, 'id');
      }
      if (sortBy === 'release-desc') {
        const dateA = a.pub.releaseDate ? new Date(a.pub.releaseDate).getTime() : 0;
        const dateB = b.pub.releaseDate ? new Date(b.pub.releaseDate).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'price-asc') {
        return (a.pub.currentPrice || 0) - (b.pub.currentPrice || 0);
      }
      if (sortBy === 'price-desc') {
        return (b.pub.currentPrice || 0) - (a.pub.currentPrice || 0);
      }
      return 0;
    });
  }, [collectedBooks, statusFilter, searchQuery, sortBy]);

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
          Koleksi personal dan seri yang sedang kamu ikuti.
        </p>
      </div>

      {/* Primary Tabs Segmented Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-surface-raised rounded-2xl border border-border-subtle overflow-x-auto no-scrollbar shadow-sm">
        {[
          { id: 'collection', label: `Koleksi Buku (${allCount})`, icon: BookmarkCheck },
          { id: 'series', label: `Pelacak Seri Saya (${seriesList.length})`, icon: Layers3 },
          { id: 'watchlist', label: `Watchlist Radar (${watchlistItems.length})`, icon: Bookmark },
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

      {/* TAB 1: KOLEKSI BUKU */}
      {activeTab === 'collection' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Stats Overview Bar (Strict 1-to-1 consistency) */}
          <div className="p-4 sm:p-6 rounded-2xl bg-surface/70 border border-border-subtle backdrop-blur-md space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-6">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 flex-1">
              <button
                type="button"
                onClick={() => setStatusFilter('OWNED')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  statusFilter === 'OWNED'
                    ? 'bg-emerald-500/15 border-emerald-500/40 shadow-sm'
                    : 'bg-surface/60 border-border-subtle hover:border-emerald-500/30'
                }`}
              >
                <span className="font-mono text-xl font-bold text-emerald-400 block">
                  {ownedCount}
                </span>
                <span className="text-[11px] text-editorial-muted">Dimiliki</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('WISHLIST')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  statusFilter === 'WISHLIST'
                    ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
                    : 'bg-surface/60 border-border-subtle hover:border-amber-500/30'
                }`}
              >
                <span className="font-mono text-xl font-bold text-amber-400 block">
                  {wishlistCount}
                </span>
                <span className="text-[11px] text-editorial-muted">Wishlist</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('PREORDERED')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  statusFilter === 'PREORDERED'
                    ? 'bg-burgundy-400/15 border-burgundy-400/40 shadow-sm'
                    : 'bg-surface/60 border-border-subtle hover:border-burgundy-400/30'
                }`}
              >
                <span className="font-mono text-xl font-bold text-burgundy-400 block">
                  {preorderedCount}
                </span>
                <span className="text-[11px] text-editorial-muted">Pre-order</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('series')}
                className="p-3 rounded-xl bg-surface/60 border border-border-subtle hover:border-gold/40 text-left transition-all group"
              >
                <span className="font-mono text-xl font-bold text-gold block group-hover:scale-105 transition-transform">
                  {incompleteSeriesCount}
                </span>
                <span className="text-[11px] text-editorial-muted flex items-center justify-between">
                  <span>Seri Belum Lengkap</span>
                  <ArrowRight className="w-3 h-3 text-editorial-faint group-hover:text-gold transition-colors" />
                </span>
              </button>
            </div>

            {/* Backup / Export Controls */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle shrink-0">
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
                className="min-h-[40px] px-3 py-2 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-xs font-medium text-editorial-title flex items-center justify-center gap-2 transition-colors active:scale-95"
                title="Impor backup JSON koleksi"
              >
                <Upload className="w-3.5 h-3.5 text-editorial-faint" />
                <span className="hidden sm:inline">Impor</span>
              </button>
              <button
                type="button"
                onClick={exportCollectionJson}
                className="min-h-[40px] px-3 py-2 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-xs font-medium text-editorial-title flex items-center justify-center gap-2 transition-colors active:scale-95"
                title="Unduh cadangan JSON koleksi"
              >
                <Download className="w-3.5 h-3.5 text-gold" />
                <span className="hidden sm:inline">Ekspor</span>
              </button>
            </div>
          </div>

          {/* Filtering, Search & Sorting Controls */}
          <div className="space-y-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'ALL', label: 'Semua', count: allCount },
                { id: 'OWNED', label: 'Dimiliki', count: ownedCount },
                { id: 'WISHLIST', label: 'Wishlist', count: wishlistCount },
                { id: 'PREORDERED', label: 'Pre-order', count: preorderedCount },
              ].map((f) => {
                const isActive = statusFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id as CollectionStatusFilter)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${
                      isActive
                        ? 'bg-gold text-background border-gold font-semibold shadow-sm'
                        : 'bg-surface border-border-subtle text-editorial-muted hover:text-editorial-title hover:bg-surface-raised'
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                );
              })}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-faint" />
                <input
                  type="text"
                  placeholder="Cari judul, pengarang, penerbit dalam koleksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface border border-border-subtle focus:border-gold/50 focus:outline-none text-xs text-editorial-title placeholder:text-editorial-faint"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-editorial-faint hover:text-editorial-title text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-editorial-faint" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 rounded-xl bg-surface border border-border-subtle text-xs text-editorial-body focus:outline-none focus:border-gold/50"
                >
                  <option value="recent">Baru ditambahkan</option>
                  <option value="title-asc">Judul A-Z</option>
                  <option value="release-desc">Rilis terbaru</option>
                  <option value="price-asc">Harga terendah</option>
                  <option value="price-desc">Harga tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Collected Books Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
                  Daftar Buku Koleksi ({filteredAndSortedBooks.length})
                </h2>
                <p className="text-xs text-editorial-muted mt-0.5">
                  Publikasi yang Anda tandai dalam koleksi personal
                </p>
              </div>
            </div>

            {filteredAndSortedBooks.length === 0 ? (
              <div className="p-12 text-center bg-surface/30 rounded-2xl border border-border-subtle space-y-3">
                <BookmarkCheck className="w-10 h-10 text-editorial-faint mx-auto" />
                {searchQuery.trim() ? (
                  <>
                    <h3 className="font-editorial text-base font-semibold text-editorial-title">
                      Tidak ditemukan hasil untuk &quot;{searchQuery}&quot;
                    </h3>
                    <p className="text-xs text-editorial-muted max-w-sm mx-auto">
                      Coba gunakan kata kunci pencarian yang lain atau bersihkan filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border-subtle text-xs text-gold font-medium"
                    >
                      Reset Pencarian
                    </button>
                  </>
                ) : statusFilter === 'WISHLIST' ? (
                  <>
                    <h3 className="font-editorial text-base font-semibold text-editorial-title">
                      Belum ada wishlist.
                    </h3>
                    <p className="text-xs text-editorial-muted max-w-sm mx-auto">
                      Tambahkan buku yang ingin kamu baca nanti melalui tombol bookmark atau opsi koleksi di setiap buku.
                    </p>
                    <Link
                      href="/discover"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-background text-xs font-semibold hover:bg-gold-400 transition-colors shadow-sm"
                    >
                      <span>Jelajahi Rilisan</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </>
                ) : statusFilter === 'OWNED' ? (
                  <>
                    <h3 className="font-editorial text-base font-semibold text-editorial-title">
                      Belum ada buku yang ditandai dimiliki.
                    </h3>
                    <p className="text-xs text-editorial-muted max-w-sm mx-auto">
                      Buka detail buku yang sudah kamu miliki di rak fisikmu dan tandai sebagai &quot;Dimiliki&quot;.
                    </p>
                  </>
                ) : statusFilter === 'PREORDERED' ? (
                  <>
                    <h3 className="font-editorial text-base font-semibold text-editorial-title">
                      Belum ada buku dalam status pre-order.
                    </h3>
                    <p className="text-xs text-editorial-muted max-w-sm mx-auto">
                      Tandai buku yang sudah kamu pesan di gerai resmi sebelum tanggal terbit tiba.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-editorial text-base font-semibold text-editorial-title">
                      Koleksi personalmu masih kosong.
                    </h3>
                    <p className="text-xs text-editorial-muted max-w-sm mx-auto">
                      Mulai tandai komik, manga, atau novel favoritmu untuk memantau koleksi dan status kepemilikannya.
                    </p>
                    <Link
                      href="/discover"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-background text-xs font-semibold hover:bg-gold-400 transition-colors shadow-sm"
                    >
                      <span>Temukan Buku Baru</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {filteredAndSortedBooks.map(({ pub }) => (
                  <ReleaseCard key={pub.id} publication={pub} layout="grid" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PELACAK SERI SAYA (Requirement 10) */}
      {activeTab === 'series' && (
        <div className="space-y-6">
          <UserSeriesTracker />
        </div>
      )}

      {/* TAB 3: WATCHLIST RADAR */}
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
                  Radar Anda masih tenang.
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

      {/* TAB 4: HISTORY (Recently Viewed) */}
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

      {/* Secondary Settings: Density & Motion Preferences */}
      <div className="pt-6 border-t border-border-subtle">
        <div className="p-4 sm:p-5 rounded-2xl bg-surface/50 border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gold" />
              <h3 className="font-editorial text-sm font-semibold text-editorial-title">
                Preferensi Tampilan & Kenyamanan Baca
              </h3>
            </div>
            <span className="text-[10px] font-mono text-editorial-faint">
              Lokal Perangkat
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Density */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-editorial-muted font-medium">Kerapatan Tampilan (Density)</span>
              <div className="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setDensity('comfortable')}
                  className={`flex-1 min-h-[40px] py-2 rounded-lg text-xs font-medium transition-all ${
                    density === 'comfortable'
                      ? 'bg-surface-raised text-gold font-semibold shadow-sm'
                      : 'text-editorial-muted hover:text-editorial-title'
                  }`}
                >
                  Nyaman (Comfortable)
                </button>
                <button
                  type="button"
                  onClick={() => setDensity('compact')}
                  className={`flex-1 min-h-[40px] py-2 rounded-lg text-xs font-medium transition-all ${
                    density === 'compact'
                      ? 'bg-surface-raised text-gold font-semibold shadow-sm'
                      : 'text-editorial-muted hover:text-editorial-title'
                  }`}
                >
                  Kompak (Compact)
                </button>
              </div>
            </div>

            {/* Motion */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-editorial-muted font-medium">Efek Animasi (Motion)</span>
              <div className="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setMotion('full')}
                  className={`flex-1 min-h-[40px] py-2 rounded-lg text-xs font-medium transition-all ${
                    motion === 'full'
                      ? 'bg-surface-raised text-gold font-semibold shadow-sm'
                      : 'text-editorial-muted hover:text-editorial-title'
                  }`}
                >
                  Penuh (Full)
                </button>
                <button
                  type="button"
                  onClick={() => setMotion('reduced')}
                  className={`flex-1 min-h-[40px] py-2 rounded-lg text-xs font-medium transition-all ${
                    motion === 'reduced'
                      ? 'bg-surface-raised text-gold font-semibold shadow-sm'
                      : 'text-editorial-muted hover:text-editorial-title'
                  }`}
                >
                  Minimal (Reduced)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

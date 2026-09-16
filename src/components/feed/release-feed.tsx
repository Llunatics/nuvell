'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { Publication, Publisher } from '@/types';
import { ReleaseCard } from '../books/release-card';
import { useDisplaySettings } from '@/hooks/use-display-settings';
import { Tooltip } from '@/components/ui/tooltip';

interface ReleaseFeedProps {
  initialPublications: Publication[];
  publishers: Publisher[];
  title?: string;
  description?: string;
}

type QuickCategory = 'ALL' | 'NEW' | 'UPCOMING' | 'MANGA' | 'LIGHT_NOVEL' | 'NOVEL';
type SortOption = 'NEWEST_RELEASE' | 'OLDEST_RELEASE' | 'RECENTLY_UPDATED' | 'PRICE_ASC' | 'PRICE_DESC' | 'TITLE_ASC';

export function ReleaseFeed({
  initialPublications,
  publishers,
  title = 'Live Release Feed',
  description = 'Jelajahi rilisan resmi buku dan komik di Indonesia',
}: ReleaseFeedProps) {
  const { viewMode, setViewMode } = useDisplaySettings();

  // Quick filter
  const [quickCategory, setQuickCategory] = useState<QuickCategory>('ALL');

  // Advanced filters state (inside drawer)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [priceMax, setPriceMax] = useState<number>(500000);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST_RELEASE');
  const [displayLimit, setDisplayLimit] = useState(24);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedPublisher !== 'ALL') count++;
    if (selectedFormat !== 'ALL') count++;
    if (priceMax < 500000) count++;
    if (onlyAvailable) count++;
    return count;
  }, [selectedPublisher, selectedFormat, priceMax, onlyAvailable]);

  const clearAllFilters = () => {
    setQuickCategory('ALL');
    setSelectedPublisher('ALL');
    setSelectedFormat('ALL');
    setPriceMax(500000);
    setOnlyAvailable(false);
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let list = [...initialPublications];

    // 1. Quick Category Filter
    if (quickCategory !== 'ALL') {
      list = list.filter((p) => {
        const d = p.releaseDate || '';
        switch (quickCategory) {
          case 'NEW':
            return p.recentChangeBadge === 'NEW' || (d >= '2026-09-01' && d <= '2026-09-15');
          case 'UPCOMING':
            return p.status === 'PREORDER' || p.status === 'ANNOUNCED' || d > '2026-09-15';
          case 'MANGA':
            return (
              (p.genres?.includes('Manga') || p.genres?.includes('Manhwa') || p.genres?.includes('Komik')) &&
              !p.genres?.includes('Light Novel') &&
              !p.genres?.includes('Agama & Spiritualitas') &&
              !p.genres?.includes('Novel') &&
              p.format !== 'PAPERBACK'
            );
          case 'LIGHT_NOVEL':
            return p.genres?.includes('Light Novel');
          case 'NOVEL':
            return (
              p.genres?.includes('Novel') ||
              p.genres?.includes('Literary Fiction') ||
              p.genres?.includes('Historical Fiction') ||
              p.genres?.includes('Fiction')
            );
          default:
            return true;
        }
      });
    }

    // 2. Advanced Drawer Filters
    if (selectedPublisher !== 'ALL') {
      list = list.filter((p) => p.publisherId === selectedPublisher);
    }

    if (selectedFormat !== 'ALL') {
      list = list.filter((p) => p.format === selectedFormat);
    }

    if (priceMax < 500000) {
      list = list.filter((p) => (p.currentPrice || 0) <= priceMax);
    }

    if (onlyAvailable) {
      list = list.filter((p) => p.status === 'RELEASED');
    }

    // 3. Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'NEWEST_RELEASE':
          return (b.releaseDate || '').localeCompare(a.releaseDate || '');
        case 'OLDEST_RELEASE':
          return (a.releaseDate || '2099-12-31').localeCompare(b.releaseDate || '2099-12-31');
        case 'RECENTLY_UPDATED':
          return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
        case 'PRICE_ASC':
          return (a.currentPrice || 0) - (b.currentPrice || 0);
        case 'PRICE_DESC':
          return (b.currentPrice || 0) - (a.currentPrice || 0);
        case 'TITLE_ASC':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return list;
  }, [initialPublications, quickCategory, selectedPublisher, selectedFormat, priceMax, onlyAvailable, sortBy]);

  const visibleItems = filteredItems.slice(0, displayLimit);

  return (
    <section className="space-y-6">
      {/* Feed Control Bar: Minimal & Intentional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-editorial-title">
            {title}
          </h2>
          <p className="text-xs text-editorial-muted mt-0.5">
            {description} • {filteredItems.length} judul
          </p>
        </div>

        {/* Action Controls: Sort, Filter Drawer Trigger, Grid/List Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-border-subtle text-xs text-editorial-body shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-gold" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs"
              aria-label="Urutkan publikasi"
            >
              <option value="NEWEST_RELEASE" className="bg-surface">Rilis Terbaru</option>
              <option value="OLDEST_RELEASE" className="bg-surface">Rilis Terlama</option>
              <option value="RECENTLY_UPDATED" className="bg-surface">Baru Diperbarui</option>
              <option value="PRICE_ASC" className="bg-surface">Harga Terendah</option>
              <option value="PRICE_DESC" className="bg-surface">Harga Tertinggi</option>
              <option value="TITLE_ASC" className="bg-surface">Judul (A-Z)</option>
            </select>
          </div>

          {/* Filter Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-sm ${
              activeFiltersCount > 0
                ? 'bg-gold/15 text-gold border-gold/40'
                : 'bg-surface border-border-subtle text-editorial-muted hover:text-editorial-title hover:bg-surface-raised'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-gold text-background text-[10px] font-bold flex items-center justify-center font-mono">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle Segmented Control with Tooltip */}
          <div className="flex items-center bg-surface p-1 rounded-xl border border-border-subtle shadow-sm">
            <Tooltip content="Tampilan Kisi (Grid)">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-surface-raised text-gold shadow-sm border border-border-subtle'
                    : 'text-editorial-faint hover:text-editorial-title'
                }`}
                aria-label="Tampilan Kisi"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            <Tooltip content="Tampilan Daftar (List)">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-surface-raised text-gold shadow-sm border border-border-subtle'
                    : 'text-editorial-faint hover:text-editorial-title'
                }`}
                aria-label="Tampilan Daftar"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Quick Category Chips Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        {[
          { id: 'ALL', label: 'Semua Rilisan' },
          { id: 'NEW', label: 'Baru Rilis' },
          { id: 'UPCOMING', label: 'Akan Datang' },
          { id: 'MANGA', label: 'Manga & Komik' },
          { id: 'LIGHT_NOVEL', label: 'Light Novel' },
          { id: 'NOVEL', label: 'Novel' },
        ].map((item) => {
          const isActive = quickCategory === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setQuickCategory(item.id as QuickCategory)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-editorial-title text-background font-semibold shadow-sm border border-editorial-title'
                  : 'bg-surface border border-border-subtle text-editorial-muted hover:text-editorial-title hover:bg-surface-raised'
              }`}
            >
              {item.label}
            </button>
          );
        })}

        {/* Active Filter Chips indicator */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      {/* Publications Canvas */}
      {visibleItems.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-surface/30 rounded-2xl border border-border-subtle p-8">
          <BookOpen className="w-8 h-8 text-editorial-faint mx-auto" />
          <h3 className="font-editorial text-base font-semibold text-editorial-title">
            Tidak ada buku yang sesuai dengan filter
          </h3>
          <p className="text-xs text-editorial-muted max-w-sm mx-auto">
            Coba ubah kategori atau bersihkan filter lanjutan untuk melihat lebih banyak buku.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-xl bg-gold/15 text-gold text-xs font-medium hover:bg-gold/25 transition-colors border border-gold/30"
          >
            Bersihkan Semua Filter
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2.5">
          {visibleItems.map((pub) => (
            <ReleaseCard key={pub.id} publication={pub} layout="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {visibleItems.map((pub) => (
            <ReleaseCard key={pub.id} publication={pub} layout="grid" />
          ))}
        </div>
      )}

      {/* Pagination / Load More Button */}
      {displayLimit < filteredItems.length && (
        <div className="text-center pt-6">
          <button
            type="button"
            onClick={() => setDisplayLimit((prev) => prev + 24)}
            className="px-6 py-2.5 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle hover:border-gold/40 text-xs font-medium text-editorial-title transition-all shadow-sm"
          >
            Muat Lebih Banyak ({filteredItems.length - displayLimit} tersisa)
          </button>
        </div>
      )}

      {/* Advanced Filter Slide-Over Drawer */}
      {isFilterDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/30 dark:bg-black/60 backdrop-blur-[2px] transition-all animate-in fade-in duration-200"
          onClick={() => setIsFilterDrawerOpen(false)}
        >
          <div
            className="w-full max-w-md h-full bg-surface-raised border-l border-border-medium shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gold" />
                  <h3 className="font-editorial text-lg font-bold text-editorial-title">
                    Filter Lanjutan
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 rounded-lg text-editorial-faint hover:text-editorial-title hover:bg-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter 1: Publisher */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-editorial-faint uppercase tracking-wider block">
                  Penerbit Resmi
                </label>
                <select
                  value={selectedPublisher}
                  onChange={(e) => setSelectedPublisher(e.target.value)}
                  className="w-full bg-surface px-3 py-2 rounded-xl border border-border-subtle text-xs text-editorial-title focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  <option value="ALL">Semua Penerbit</option>
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Book Format */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-editorial-faint uppercase tracking-wider block">
                  Format Fisik
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full bg-surface px-3 py-2 rounded-xl border border-border-subtle text-xs text-editorial-title focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  <option value="ALL">Semua Format</option>
                  <option value="TANKOBON">Tankobon (Standar Manga)</option>
                  <option value="KANZENBAN">Kanzenban (Edisi Spesial)</option>
                  <option value="PAPERBACK">Paperback / Softcover</option>
                  <option value="HARDCOVER">Hardcover (Kolektor)</option>
                </select>
              </div>

              {/* Filter 3: Maximum Price Range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-editorial-faint uppercase tracking-wider">
                    Batas Harga Maksimal
                  </span>
                  <span className="font-mono font-semibold text-gold">
                    {priceMax >= 500000 ? 'Tanpa Batas' : `Rp ${priceMax.toLocaleString('id-ID')}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={30000}
                  max={500000}
                  step={10000}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-gold cursor-pointer"
                />
              </div>

              {/* Filter 4: Availability */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-editorial-title">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="rounded border-border-subtle text-gold accent-gold w-4 h-4"
                  />
                  <span>Hanya tampilkan buku yang sudah resmi rilis di toko</span>
                </label>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-6 border-t border-border-subtle flex items-center gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-xs font-medium text-editorial-muted hover:text-editorial-title transition-colors"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-gold text-background text-xs font-semibold hover:bg-gold-400 transition-colors shadow-sm"
              >
                Terapkan ({filteredItems.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

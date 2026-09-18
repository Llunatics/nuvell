'use client';

import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Search,
  Book,
  Layers,
  Building2,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Globe,
  BookOpen,
  Feather,
  CheckCircle2,
  Clock,
  History,
  Compass,
  Calendar,
  BookmarkCheck,
  LineChart,
  Loader2,
} from 'lucide-react';
import { Publication, Series, Publisher } from '@/types';
import { formatIDR } from '@/lib/formatters';
import { useModalOverlay } from '@/hooks/use-modal-overlay';

interface SearchDialogProps {
  initialQuery?: string;
}

type CategoryTab = 'all' | 'manga' | 'light-novel' | 'novel' | 'import' | 'series';

const RECENT_SEARCHES_KEY = 'nuvell_recent_search_queries';
const LEGACY_RECENT_SEARCHES_KEY = 'nuvelll_recent_search_queries';
const clientQueryCache = new Map<string, { pubs: Publication[]; series: Series[] }>();

export function SearchDialog({ initialQuery }: SearchDialogProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useModalOverlay(isOpen);
  const [query, setQuery] = useState(initialQuery || '');
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredPubs, setFilteredPubs] = useState<Publication[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const deferredQuery = useDeferredValue(query);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(RECENT_SEARCHES_KEY) ||
        localStorage.getItem(LEGACY_RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      } else {
        setRecentSearches(['One Piece', 'Kagurabachi', 'Elex Media', 'Frieren']);
      }
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // Keyboard shortcut listener: Cmd/Ctrl + K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery('');
      setActiveTab('all');
      setSelectedIndex(0);
      setFilteredPubs([]);
      setFilteredSeries([]);
    }
  }, [isOpen]);

  // Fetch search results via debounced API query
  useEffect(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) {
      setFilteredPubs([]);
      setFilteredSeries([]);
      setIsLoading(false);
      return;
    }

    const cacheKey = `${q}__${activeTab}`;
    const cached = clientQueryCache.get(cacheKey);
    if (cached) {
      setFilteredPubs(cached.pubs);
      setFilteredSeries(cached.series);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const abortController = new AbortController();

    const fetchTimer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}&category=${activeTab}`, {
        signal: abortController.signal,
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          const pubs = data.publications || [];
          const sers = data.series || [];
          clientQueryCache.set(cacheKey, { pubs, series: sers });
          setFilteredPubs(pubs);
          setFilteredSeries(sers);
          setIsLoading(false);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setIsLoading(false);
          }
        });
    }, 60);

    return () => {
      clearTimeout(fetchTimer);
      abortController.abort();
    };
  }, [deferredQuery, activeTab]);

  // Navigation quick actions
  const QUICK_ACTIONS = useMemo(() => [
    { label: 'Buka Kalender Rilis Bulanan', href: '/calendar', icon: Calendar },
    { label: 'Buka Library & Koleksi Saya', href: '/library', icon: BookmarkCheck },
    { label: 'Jelajahi Katalog Penerbit Resmi', href: '/discover?tab=publishers', icon: Building2 },
    { label: 'Lihat Analisis & Insights Pasar', href: '/insights', icon: LineChart },
  ], []);

  const matchingActions = useMemo(() => {
    if (!deferredQuery) return QUICK_ACTIONS;
    const q = deferredQuery.toLowerCase();
    return QUICK_ACTIONS.filter((a) => a.label.toLowerCase().includes(q));
  }, [deferredQuery, QUICK_ACTIONS]);

  // Combined items for keyboard navigation
  const allResultItems = useMemo(() => {
    const items: { type: 'action' | 'series' | 'pub'; url: string; title: string }[] = [];
    matchingActions.forEach((a) => items.push({ type: 'action', url: a.href, title: a.label }));
    filteredSeries.forEach((s) => items.push({ type: 'series', url: `/series/${s.slug}`, title: s.name }));
    filteredPubs.forEach((p) => items.push({ type: 'pub', url: `/books/${p.slug}`, title: p.title }));
    return items;
  }, [matchingActions, filteredSeries, filteredPubs]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < allResultItems.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResultItems[selectedIndex]) {
        if (query.trim()) saveRecentSearch(query);
        handleSelect(allResultItems[selectedIndex].url);
      }
    }
  };

  const handleSelect = (url: string) => {
    if (query.trim()) saveRecentSearch(query);
    setIsOpen(false);
    router.push(url);
  };

  const totalResults = filteredPubs.length + filteredSeries.length;

  return (
    <>
      {/* Search Input Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 sm:py-2 rounded-xl bg-surface hover:bg-surface-raised border border-border-medium hover:border-gold/50 text-editorial-muted hover:text-editorial-title transition-all text-xs sm:text-sm group shadow-sm focus:outline-none focus:ring-1 focus:ring-gold"
        aria-label="Cari buku, manga, komik, atau penerbit (Cmd+K)"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-editorial-muted group-hover:text-gold transition-colors shrink-0" />
          <span className="truncate text-editorial-muted group-hover:text-editorial-body text-xs font-normal">
            Cari judul, manga, ISBN, penerbit...
          </span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-editorial-faint bg-surface-raised rounded-md border border-border-medium shrink-0">
          ⌘K
        </kbd>
      </button>

      {/* Modern Command Palette Overlay - Portaled directly to document.body */}
      {isOpen && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-modal-title"
          className="modal-overlay-scrim flex items-stretch sm:items-start justify-center p-0 sm:p-4 sm:pt-20 transition-all animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-surface sm:border sm:border-border-bold dark:sm:border-border-medium sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-150 pt-safe pb-safe sm:pt-0 sm:pb-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center gap-2.5 px-3 sm:px-4 py-3 sm:py-3.5 border-b border-border-medium bg-surface shrink-0">
              {/* Mobile Back Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-2 -ml-1 text-editorial-muted hover:text-editorial-title rounded-lg active:scale-95 transition-all"
                aria-label="Tutup pencarian"
              >
                <ArrowLeft className="w-5 h-5 text-editorial-title" />
              </button>

              {isLoading ? (
                <Loader2 className="w-4 h-4 text-gold animate-spin shrink-0 hidden sm:block" />
              ) : (
                <Search className="w-4 h-4 text-gold shrink-0 hidden sm:block" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Cari judul, manga, ISBN, penerbit..."
                className="w-full bg-transparent text-editorial-title placeholder:text-editorial-faint text-base focus:outline-none font-medium"
              />
              {isLoading && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-gold bg-gold/10 border border-gold/30 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  <span className="hidden sm:inline">Mengindeks</span>
                </span>
              )}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedIndex(0);
                  }}
                  className="p-2 rounded-lg hover:bg-surface-raised text-editorial-muted hover:text-editorial-title transition-colors"
                  aria-label="Bersihkan input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd
                onClick={() => setIsOpen(false)}
                className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono text-editorial-faint bg-surface-raised border border-border-medium rounded cursor-pointer hover:text-editorial-title"
              >
                ESC
              </kbd>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-raised border-b border-border-subtle overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'all', label: 'Semua', icon: Sparkles },
                { id: 'manga', label: 'Komik & Manga', icon: BookOpen },
                { id: 'light-novel', label: 'Light Novel', icon: Book },
                { id: 'novel', label: 'Novel & Sastra', icon: Feather },
                { id: 'import', label: 'Buku Import', icon: Globe },
                { id: 'series', label: 'Seri', icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as CategoryTab);
                      setSelectedIndex(0);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium shrink-0 ${
                      isActive
                        ? 'bg-surface text-editorial-title font-semibold shadow-sm border border-border-medium'
                        : 'text-editorial-muted hover:text-editorial-title hover:bg-surface/70 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isActive ? 'text-gold' : 'text-editorial-faint'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Results Canvas */}
            <div ref={resultsContainerRef} className="flex-1 sm:max-h-[60vh] overflow-y-auto p-3 sm:p-4 space-y-4 bg-surface">
              {/* Professional Indexing Telemetry State */}
              {isLoading && totalResults === 0 && (
                <div className="py-6 px-3 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-raised border border-border-subtle shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-editorial-title">
                            Menyelaraskan Indeks & Repositori Resmi...
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                            LIVE RADAR
                          </span>
                        </div>
                        <p className="text-[11px] text-editorial-faint font-mono">
                          Memindai ISBN • Memverifikasi ketersediaan toko buku • Sinkronisasi katalog
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-gold/80">
                      <span className="w-1 h-3 rounded-full bg-gold animate-bounce delay-75" />
                      <span className="w-1 h-4 rounded-full bg-gold animate-bounce delay-150" />
                      <span className="w-1 h-2 rounded-full bg-gold animate-bounce delay-300" />
                    </div>
                  </div>

                  {/* Shimmering Skeleton Cards */}
                  <div className="space-y-2.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={`skel-${i}`}
                        className="p-3 rounded-xl bg-surface-raised/50 border border-border-subtle flex items-center justify-between animate-pulse"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-14 rounded-lg bg-surface-sunken shrink-0" />
                          <div className="space-y-2 flex-1 min-w-0 pr-4">
                            <div className="h-3.5 bg-surface-sunken rounded w-2/3" />
                            <div className="h-2.5 bg-surface-sunken/80 rounded w-1/3" />
                          </div>
                        </div>
                        <div className="h-4 w-16 bg-surface-sunken rounded shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results empty state */}
              {deferredQuery && !isLoading && totalResults === 0 && matchingActions.length === 0 && (
                <div className="py-12 text-center text-editorial-muted space-y-2">
                  <p className="text-sm font-medium text-editorial-title">
                    Tidak ditemukan publikasi resmi untuk &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-editorial-faint max-w-sm mx-auto">
                    Coba gunakan kata kunci lain, nama penulis, atau pastikan ejaan judul sudah sesuai.
                  </p>
                </div>
              )}

              {/* Initial Suggestions & Recent Searches (when query is empty) */}
              {!deferredQuery && (
                <div className="space-y-4 py-2 px-1">
                  {recentSearches.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-editorial-faint">
                        <span className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-gold" />
                          Pencarian Terakhir
                        </span>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-[10px] text-editorial-faint hover:text-gold transition-colors font-mono"
                        >
                          Hapus
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setQuery(term);
                              setSelectedIndex(0);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs bg-surface hover:bg-surface-raised border border-border-subtle hover:border-gold/40 text-editorial-body hover:text-gold transition-all"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Navigation Actions */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-editorial-faint">
                      Aksi Navigasi Cepat
                    </div>
                    {QUICK_ACTIONS.map((action, idx) => {
                      const Icon = action.icon;
                      const isSelected = selectedIndex === idx;
                      return (
                        <button
                          key={action.href}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={() => handleSelect(action.href)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-surface-raised text-gold shadow-sm'
                              : 'hover:bg-surface-raised/50 text-editorial-body'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-gold" />
                            <span className="text-xs font-medium">{action.label}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-editorial-faint" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Series Group */}
              {filteredSeries.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-rose-400" />
                    Seri & Waralaba ({filteredSeries.length})
                  </div>
                  <div className="mt-1 space-y-1">
                    {filteredSeries.map((s, sIdx) => {
                      const globalIdx = matchingActions.length + sIdx;
                      const isSelected = selectedIndex === globalIdx;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          onClick={() => handleSelect(`/series/${s.slug}`)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-surface-raised text-gold shadow-sm'
                              : 'hover:bg-surface-raised/50 text-editorial-title'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium">{s.name}</p>
                            <p className="text-xs text-editorial-muted mt-0.5">
                              {s.publisherName} • {s.totalVolumes ? `${s.totalVolumes} Volume` : 'Ongoing'}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-editorial-faint" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Publications Group */}
              {filteredPubs.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                    <Book className="w-3.5 h-3.5 text-gold" />
                    Judul Buku & Manga ({filteredPubs.length})
                  </div>
                  <div className="mt-1 space-y-1">
                    {filteredPubs.map((p, pIdx) => {
                      const globalIdx = matchingActions.length + filteredSeries.length + pIdx;
                      const isSelected = selectedIndex === globalIdx;
                      const isReleased = p.status === 'RELEASED';
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          onClick={() => handleSelect(`/books/${p.slug}`)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-surface-raised text-gold shadow-sm'
                              : 'hover:bg-surface-raised/50 text-editorial-title'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-12 bg-surface rounded border border-border-subtle overflow-hidden shrink-0">
                              {p.coverImage && (
                                <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{p.title}</p>
                              <div className="flex items-center gap-2 text-xs text-editorial-muted truncate mt-0.5">
                                <span className="truncate">{p.publisherName}</span>
                                <span>•</span>
                                <span
                                  className={`inline-flex items-center gap-1 font-medium ${
                                    isReleased ? 'text-emerald-400' : 'text-amber-400'
                                  }`}
                                >
                                  {isReleased ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : (
                                    <Clock className="w-3 h-3" />
                                  )}
                                  {p.status}
                                </span>
                                {p.releaseDate && <span className="text-editorial-faint">• {p.releaseDate}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            {p.currentPrice && (
                              <span className="text-xs font-mono font-medium text-gold">
                                {formatIDR(p.currentPrice)}
                              </span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-editorial-faint" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="px-4 py-2.5 bg-surface/70 border-t border-border-subtle flex items-center justify-between text-[11px] text-editorial-faint">
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-mono">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[10px]">↓</kbd>
                  navigasi
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[10px]">↵</kbd>
                  buka
                </span>
              </span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Index Terverifikasi
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

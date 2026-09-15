'use client';

import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Book,
  Layers,
  Building2,
  X,
  Sparkles,
  ArrowRight,
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
} from 'lucide-react';
import { Publication, Series, Publisher } from '@/types';
import { formatIDR } from '@/lib/formatters';

interface SearchDialogProps {
  initialQuery?: string;
}

type CategoryTab = 'all' | 'manga' | 'light-novel' | 'novel' | 'import' | 'series';

const RECENT_SEARCHES_KEY = 'nuvell_recent_search_queries';
const LEGACY_RECENT_SEARCHES_KEY = 'nuvelll_recent_search_queries';
const clientQueryCache = new Map<string, { pubs: Publication[]; series: Series[] }>();

export function SearchDialog({ initialQuery }: SearchDialogProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
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
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setActiveTab('all');
      setSelectedIndex(0);
      setFilteredPubs([]);
      setFilteredSeries([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
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
        className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-surface/70 hover:bg-surface border border-border-subtle hover:border-gold/40 text-editorial-muted hover:text-editorial-title transition-all text-xs sm:text-sm group shadow-sm"
        aria-label="Cari buku, manga, komik, atau penerbit (Cmd+K)"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search className="w-3.5 h-3.5 text-editorial-muted group-hover:text-gold transition-colors shrink-0" />
          <span className="truncate text-editorial-muted group-hover:text-editorial-body text-xs">
            Cari judul buku, manga, ISBN, penerbit...
          </span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-editorial-faint bg-surface-raised rounded-md border border-border-subtle shrink-0">
          ⌘K
        </kbd>
      </button>

      {/* Modern Command Palette Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-modal-title"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-neutral-950/25 dark:bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-surface-raised/95 backdrop-blur-2xl border border-border-medium ring-1 ring-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Gold Line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle bg-surface/40">
              <Search className="w-4 h-4 text-gold shrink-0 animate-pulse" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Ketik judul, manga, volume, ISBN, atau aksi..."
                className="w-full bg-transparent text-editorial-title placeholder:text-editorial-faint text-base sm:text-lg focus:outline-none font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedIndex(0);
                  }}
                  className="p-1 rounded-lg hover:bg-surface text-editorial-muted hover:text-editorial-title transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd
                onClick={() => setIsOpen(false)}
                className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono text-editorial-faint bg-surface border border-border-subtle rounded cursor-pointer hover:text-editorial-title"
              >
                ESC
              </kbd>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-surface/80 border-b border-border-subtle overflow-x-auto no-scrollbar text-xs">
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
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-medium shrink-0 ${
                      isActive
                        ? 'bg-surface-raised text-gold font-semibold shadow-sm'
                        : 'text-editorial-muted hover:text-editorial-title hover:bg-surface-raised/50'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Results Canvas */}
            <div ref={resultsContainerRef} className="max-h-[60vh] overflow-y-auto p-3 space-y-4 bg-background/50">
              {/* No results empty state */}
              {deferredQuery && totalResults === 0 && matchingActions.length === 0 && (
                <div className="py-12 text-center text-editorial-muted space-y-1">
                  <p className="text-sm font-medium text-editorial-title">
                    Tidak ditemukan hasil untuk &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-editorial-faint">
                    Coba kata kunci seperti &ldquo;One Piece&rdquo;, &ldquo;Kagurabachi&rdquo;, atau &ldquo;Gramedia&rdquo;.
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
        </div>
      )}
    </>
  );
}

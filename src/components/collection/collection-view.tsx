'use client';

import React, { useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  BookmarkCheck,
  Download,
  Upload,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Heart,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useCollection } from '@/hooks/use-collection';
import { Series, Publication } from '@/types';
import { formatIDR } from '@/lib/formatters';

interface CollectionViewProps {
  featuredSeries: Series[];
  publications: Publication[];
}

export function CollectionView({ featuredSeries, publications }: CollectionViewProps) {
  const {
    collection,
    totalItems,
    exportCollectionJson,
    importCollectionJson,
    getSeriesProgress,
    setItemStatus,
  } = useCollection();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const items = Array.from(collection.values());
  const ownedCount = items.filter((i) => i.status === 'OWNED').length;
  const wishlistCount = items.filter((i) => i.status === 'WISHLIST').length;
  const preorderedCount = items.filter((i) => i.status === 'PREORDERED').length;

  const pubMap = useMemo(() => {
    const map = new Map<string, Publication>();
    publications.forEach((p) => map.set(p.id, p));
    return map;
  }, [publications]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importCollectionJson(content);
        if (success) {
          alert('Koleksi berhasil diimpor!');
        } else {
          alert('Gagal mengimpor file: format JSON tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10">
      {/* Top Header & Export/Import Controls */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-gold">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-gold mb-1">
            <BookmarkCheck className="w-3.5 h-3.5" />
            PERSONAL COLLECTION TRACKER
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-editorial-title">
            Koleksi Buku & Manga Saya
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted mt-1 max-w-xl">
            Tandai volume yang telah Anda miliki, masukkan ke wishlist, atau lacak jilid yang masih hilang dari rak Anda. Tersimpan aman di browser Anda tanpa perlu login.
          </p>
        </div>

        {/* Action Buttons: Export & Import JSON */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
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
            className="px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-raised border border-border-subtle text-xs text-editorial-body flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-editorial-muted" />
            <span>Impor Cadangan</span>
          </button>
          <button
            type="button"
            onClick={exportCollectionJson}
            className="px-3.5 py-2 rounded-lg bg-gold text-background hover:bg-gold-400 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor JSON</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-editorial-faint font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            Total Ditandai
          </div>
          <p className="text-2xl font-bold font-editorial text-editorial-title mt-1">{totalItems}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sudah Dimiliki
          </div>
          <p className="text-2xl font-bold font-editorial text-emerald-400 mt-1">{ownedCount}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
            <Heart className="w-3.5 h-3.5" />
            Daftar Wishlist
          </div>
          <p className="text-2xl font-bold font-editorial text-amber-400 mt-1">{wishlistCount}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-burgundy-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            Telah Pre-order
          </div>
          <p className="text-2xl font-bold font-editorial text-burgundy-400 mt-1">{preorderedCount}</p>
        </div>
      </div>

      {/* Series Completion Progress Bars */}
      <section className="space-y-4">
        <h2 className="font-editorial text-xl font-bold text-editorial-title flex items-center gap-2">
          <Layers className="w-4 h-4 text-gold" />
          Progres Kelengkapan per Seri
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredSeries.map((s) => {
            const prog = getSeriesProgress(s.id, s.totalVolumes);
            return (
              <div key={s.id} className="glass-card p-4 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/series/${s.slug}`} className="hover:text-gold transition-colors">
                      <h3 className="font-editorial text-sm font-bold text-editorial-title truncate">
                        {s.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-editorial-faint font-mono">{s.publisherName}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                    {prog.percentage}%
                  </span>
                </div>

                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${prog.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-editorial-muted">
                  <span>{prog.owned} dari {s.totalVolumes || '?'} volume</span>
                  <Link href={`/series/${s.slug}`} className="text-gold hover:underline text-[11px]">
                    Buka Matriks →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tracked Items Table */}
      <section className="space-y-4">
        <h2 className="font-editorial text-xl font-bold text-editorial-title">
          Daftar Terbitan yang Ditandai ({items.length})
        </h2>

        {items.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl space-y-2">
            <BookmarkCheck className="w-8 h-8 text-editorial-faint mx-auto" />
            <p className="text-sm font-semibold text-editorial-title">Koleksi Anda masih kosong</p>
            <p className="text-xs text-editorial-muted">
              Jelajahi Live Feed Rilis atau Katalog Seri untuk menandai buku yang Anda miliki.
            </p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-editorial-faint font-mono uppercase text-[10px] bg-surface/40">
                    <th className="py-3 px-4">Judul Publikasi</th>
                    <th className="py-3 px-4">Nomor Jilid</th>
                    <th className="py-3 px-4">Status Koleksi</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {items.map((it) => {
                    const pub = pubMap.get(it.publicationId);
                    return (
                      <tr key={it.publicationId} className="hover:bg-surface/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-editorial-title">
                          {pub ? (
                            <Link href={`/books/${pub.slug}`} className="hover:text-gold transition-colors flex items-center gap-1.5">
                              <span>{pub.title}</span>
                              <ExternalLink className="w-3 h-3 text-editorial-faint" />
                            </Link>
                          ) : (
                            <span>{it.publicationId}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-editorial-muted">
                          {pub?.volume !== undefined ? `Vol. ${pub.volume}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                              it.status === 'OWNED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : it.status === 'WISHLIST'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-burgundy/15 text-burgundy-400 border border-burgundy/30'
                            }`}
                          >
                            {it.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setItemStatus(it.publicationId, 'OWNED')}
                              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                                it.status === 'OWNED' ? 'bg-emerald-500 text-background font-bold' : 'bg-surface hover:bg-surface-raised text-editorial-muted'
                              }`}
                            >
                              Miliki
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemStatus(it.publicationId, 'WISHLIST')}
                              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                                it.status === 'WISHLIST' ? 'bg-amber-500 text-background font-bold' : 'bg-surface hover:bg-surface-raised text-editorial-muted'
                              }`}
                            >
                              Wishlist
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemStatus(it.publicationId, null)}
                              className="px-2 py-1 rounded text-[10px] font-mono bg-surface hover:bg-rose-500/20 hover:text-rose-400 text-editorial-faint transition-colors"
                              title="Hapus dari pelacak"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

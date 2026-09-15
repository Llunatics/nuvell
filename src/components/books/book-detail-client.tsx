'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Check,
  Calendar,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Clock,
  BookOpen,
  Layers,
  Building2,
  User,
  Share2,
  History,
  Tag,
  Info,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Publication } from '@/types';
import { formatIDR, formatDate, getReleaseCountdown, formatShortDate } from '@/lib/formatters';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useCollection } from '@/hooks/use-collection';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { useToast } from '@/hooks/use-toast';

const PriceHistoryChart = dynamic(
  () => import('./price-history-chart').then((mod) => mod.PriceHistoryChart),
  {
    ssr: false,
    loading: () => (
      <div className="glass-card p-4 rounded-xl h-56 w-full flex items-center justify-center text-xs text-editorial-faint font-mono">
        Memuat riwayat fluktuasi harga...
      </div>
    ),
  }
);

interface BookDetailClientProps {
  publication: Publication;
  relatedPublications: Publication[];
  neighborVolumes: Publication[];
}

export function BookDetailClient({
  publication,
  relatedPublications,
  neighborVolumes,
}: BookDetailClientProps) {
  const { isWatchlisted, toggleWatchlist } = useWatchlist();
  const { getItemStatus, setItemStatus } = useCollection();
  const { addRecentItem } = useRecentlyViewed();
  const { toast } = useToast();

  const isFollowed = isWatchlisted('BOOK', publication.id);
  const collectionStatus = getItemStatus(publication.id);
  const countdown = getReleaseCountdown(publication.releaseDate);
  const isImport = publication.language === 'en' || publication.country?.includes('Import');

  // Track in recently viewed on mount
  React.useEffect(() => {
    addRecentItem({
      id: publication.id,
      slug: publication.slug,
      title: publication.title,
      coverImage: publication.coverImage,
      type: 'BOOK',
      publisherName: publication.publisherName,
    });
  }, [publication, addRecentItem]);

  // Price chart data
  const chartData = publication.priceHistory.map((p) => ({
    date: formatShortDate(p.recordedAt),
    price: p.price,
    source: p.sourceName || 'Katalog Resmi',
  }));

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Tautan disalin ke clipboard!', variant: 'success' });
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Main Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Book Cover & Actions */}
        <div className="md:col-span-5 lg:col-span-4 space-y-4">
          <div className="glass-panel p-3 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="aspect-[3/4] w-full bg-surface-overlay rounded-xl overflow-hidden relative">
              {publication.coverImage ? (
                <img
                  src={publication.coverImage}
                  alt={publication.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-editorial-faint text-sm">
                  Tidak ada sampul
                </div>
              )}

              {/* Status Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span
                  className={`px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-md backdrop-blur-md border ${
                    publication.status === 'RELEASED'
                      ? 'bg-black/85 text-emerald-400 border-emerald-500/40'
                      : publication.status === 'PREORDER'
                      ? 'bg-black/85 text-sky-400 border-sky-500/40'
                      : 'bg-black/85 text-amber-400 border-amber-500/40'
                  }`}
                >
                  {publication.status}
                </span>
                {isImport && (
                  <span className="px-2 py-1 text-xs font-mono font-bold uppercase rounded-md backdrop-blur-md border bg-cyan-950/85 text-cyan-300 border-cyan-600/40">
                    IMPORT
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Watchlist & Collection */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleWatchlist('BOOK', publication.id, publication.title, publication.slug);
                  if (!isFollowed) {
                    toast({ title: 'Ditambahkan ke Watchlist', description: publication.title, variant: 'success' });
                  } else {
                    toast({ title: 'Dihapus dari Watchlist', description: publication.title });
                  }
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
                  isFollowed
                    ? 'bg-gold text-background border-gold shadow-md font-semibold'
                    : 'bg-surface hover:bg-surface-raised border-border-subtle text-editorial-body'
                }`}
              >
                <Bookmark className="w-4 h-4" fill={isFollowed ? 'currentColor' : 'none'} />
                {isFollowed ? 'Diikuti di Radar' : '+ Tambah Watchlist'}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl text-xs font-medium bg-surface hover:bg-surface-raised border border-border-subtle text-editorial-muted hover:text-editorial-title flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Bagikan
              </button>
            </div>

            {/* Collection Status Selector (Owned, Wishlist, Preordered) */}
            <div className="glass-card p-3 rounded-xl space-y-2 text-xs">
              <span className="text-editorial-faint font-mono uppercase text-[10px] block">
                Status Koleksi Pribadi:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'OWNED', label: 'Dimiliki' },
                  { id: 'WISHLIST', label: 'Wishlist' },
                  { id: 'PREORDERED', label: 'Pre-order' },
                ].map((s) => {
                  const isSelected = collectionStatus === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        const nextStatus = isSelected ? null : (s.id as any);
                        setItemStatus(
                          publication.id,
                          nextStatus,
                          {
                            seriesId: publication.seriesId || undefined,
                            volume: publication.volume || undefined,
                          }
                        );
                        if (nextStatus) {
                          toast({ title: `Status diubah: ${s.label}`, description: publication.title, variant: 'success' });
                        } else {
                          toast({ title: 'Dihapus dari status koleksi', description: publication.title });
                        }
                      }}
                      className={`py-1.5 px-2 rounded-lg text-center text-[11px] font-medium border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold'
                          : 'bg-surface border-border-subtle text-editorial-faint hover:text-editorial-body'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Completeness Score Card (Section 64) */}
          <div className="glass-card p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-editorial-faint uppercase text-[10px]">
                Data Completeness Score
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {publication.completenessScore}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                style={{ width: `${publication.completenessScore}%` }}
              />
            </div>
            <p className="text-[11px] text-editorial-faint">
              Berdasarkan kelengkapan ISBN, tanggal rilis, harga resmi, dan verifikasi penerbit.
            </p>
          </div>
        </div>

        {/* Right Column: Title, Metadata, Provenance & Pricing */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          {/* Breadcrumb & Series Jump */}
          <div className="flex items-center gap-2 text-xs text-editorial-faint font-mono">
            <Link href="/" className="hover:text-gold transition-colors">
              Beranda
            </Link>
            <span>/</span>
            {publication.seriesName ? (
              <Link
                href={`/series/${publication.seriesId?.replace('ser_', '')}`}
                className="hover:text-gold transition-colors truncate"
              >
                {publication.seriesName}
              </Link>
            ) : (
              <span>Publikasi</span>
            )}
            <span>/</span>
            <span className="text-editorial-muted truncate">Vol. {publication.volume || 'Tunggal'}</span>
          </div>

          {/* Header Titles */}
          <div className="space-y-2">
            <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-black text-editorial-title leading-tight">
              {publication.title}
            </h1>
            {publication.originalTitle && (
              <p className="text-sm font-editorial italic text-editorial-muted">
                {publication.originalTitle}
              </p>
            )}
            {publication.subtitle && (
              <p className="text-sm text-editorial-faint font-sans">
                {publication.subtitle}
              </p>
            )}
          </div>

          {/* Author & Publisher Details */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-editorial-body pt-1">
            {publication.authors.length > 0 && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gold shrink-0" />
                <span>
                  Karya{' '}
                  {publication.authors.map((a, idx) => (
                    <Link
                      key={a.authorId}
                      href={`/authors/${a.slug}`}
                      className="font-medium text-editorial-title hover:text-gold underline decoration-border-subtle hover:decoration-gold"
                    >
                      {a.name}
                      {idx < publication.authors.length - 1 ? ', ' : ''}
                    </Link>
                  ))}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-gold shrink-0" />
              <span>
                Penerbit{' '}
                <Link
                  href={`/publishers/${publication.publisherId.replace('pub_', '')}`}
                  className="font-medium text-editorial-title hover:text-gold underline decoration-border-subtle hover:decoration-gold"
                >
                  {publication.publisherName}
                </Link>
                {publication.imprintName && ` (${publication.imprintName})`}
              </span>
            </div>
          </div>

          {/* Release Countdown Highlight Box */}
          <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-gold">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" />
                <span className="font-editorial font-bold text-editorial-title text-base sm:text-lg">
                  {countdown.label}
                </span>
              </div>
              <p className="text-xs text-editorial-muted mt-0.5">
                Tanggal Rilis Resmi: {formatDate(publication.releaseDate)} (WIB)
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-editorial-faint uppercase font-mono block">
                Harga Teramati
              </span>
              <span className="text-xl sm:text-2xl font-bold font-editorial text-editorial-title">
                {formatIDR(publication.currentPrice)}
              </span>
            </div>
          </div>

          {/* Series Volume Switcher (Neighbor Volumes) */}
          {neighborVolumes.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-editorial-faint flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gold" />
                Nomor Jilid Terkait dalam Seri {publication.seriesName}:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {neighborVolumes.map((nv) => {
                  const isCurrent = nv.id === publication.id;
                  return (
                    <Link
                      key={nv.id}
                      href={`/books/${nv.slug}`}
                      className={`px-3 py-1 rounded text-xs font-mono shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-gold text-background font-bold shadow-sm'
                          : 'bg-surface hover:bg-surface-raised text-editorial-muted hover:text-editorial-title border border-border-subtle'
                      }`}
                    >
                      Vol. {nv.volume || 'SP'}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {publication.description && (
            <div className="space-y-2">
              <h3 className="font-editorial text-sm font-bold text-editorial-title">
                Sinopsis & Ringkasan Publikasi
              </h3>
              <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed whitespace-pre-line font-serif">
                {publication.description}
              </p>
            </div>
          )}

          {/* Multi-Source Comparison Table (Section 25) */}
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-base font-bold text-editorial-title flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold" />
                Perbandingan Ketersediaan & Sumber Resmi
              </h3>
              <span className="text-xs text-editorial-faint font-mono">
                {publication.sources.length} Sumber Terverifikasi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-editorial-faint font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Sumber Pelacak</th>
                    <th className="py-2.5 px-3">Status Ketersediaan</th>
                    <th className="py-2.5 px-3">Harga Teramati</th>
                    <th className="py-2.5 px-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {publication.sources.map((src) => (
                    <tr key={src.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-editorial-title flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{src.sourceName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-overlay text-editorial-body border border-border-subtle">
                          {src.availability}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-editorial-title">
                        {formatIDR(publication.currentPrice)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={src.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface hover:bg-surface-raised border border-border-subtle text-gold hover:text-gold-300 transition-colors text-[11px]"
                        >
                          <span>Kunjungi Sumber</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-editorial-faint italic">
              Catatan Provenance: Platform ini tidak memproses transaksi pembayaran (non-e-commerce). Kami hanya mengarahkan pembaca ke katalog dan toko resmi penerbit.
            </p>
          </div>

          {/* Price Tracking Chart (Section 24) */}
          {chartData.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border-subtle">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-base font-bold text-editorial-title flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  Riwayat & Fluktuasi Harga
                </h3>
                <div className="text-xs text-editorial-faint font-mono">
                  <span>Terendah: {formatIDR(publication.lowestObservedPrice)}</span>
                </div>
              </div>

              <PriceHistoryChart data={chartData} />
            </div>
          )}

          {/* Change Detection Audit Trail (Section 12) */}
          {publication.changes.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border-subtle">
              <h3 className="font-editorial text-base font-bold text-editorial-title flex items-center gap-2">
                <History className="w-4 h-4 text-gold" />
                Log Deteksi Perubahan Crawler
              </h3>
              <div className="space-y-2">
                {publication.changes.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-lg bg-surface/70 border border-border-subtle text-xs flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="font-mono font-bold text-gold uppercase text-[10px] mr-2">
                        {ch.field}
                      </span>
                      <span className="text-editorial-body">
                        {ch.oldValue ? `${ch.oldValue} → ` : ''}{ch.newValue}
                      </span>
                    </div>
                    <span className="text-[10px] text-editorial-faint font-mono shrink-0">
                      {formatDate(ch.detectedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bibliographic Specifications */}
          <div className="pt-4 border-t border-border-subtle space-y-3">
            <h3 className="font-editorial text-base font-bold text-editorial-title">
              Spesifikasi Bibliografi Resmi
            </h3>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
              <div>
                <dt className="text-editorial-faint font-mono uppercase text-[10px]">ISBN-13</dt>
                <dd className="font-mono text-editorial-title font-medium">{publication.isbn13 || 'TBA'}</dd>
              </div>
              <div>
                <dt className="text-editorial-faint font-mono uppercase text-[10px]">Format Buku</dt>
                <dd className="font-mono text-editorial-title">
                  {publication.format === 'HARDCOVER' ? 'Hard Cover' : publication.format}
                </dd>
              </div>
              <div>
                <dt className="text-editorial-faint font-mono uppercase text-[10px]">Bahasa & Negara</dt>
                <dd className="text-editorial-title">
                  {publication.language === 'en'
                    ? 'English (Buku Import)'
                    : publication.language === 'ja'
                    ? 'Jepang'
                    : 'Bahasa Indonesia'}{' '}
                  ({publication.country || 'Indonesia'})
                </dd>
              </div>
              <div>
                <dt className="text-editorial-faint font-mono uppercase text-[10px]">Jumlah Halaman</dt>
                <dd className="font-mono text-editorial-title">{publication.pageCount ? `${publication.pageCount} Halaman` : 'TBA'}</dd>
              </div>
              <div>
                <dt className="text-editorial-faint font-mono uppercase text-[10px]">Dimensi & Berat</dt>
                <dd className="text-editorial-title">{publication.dimensions || '-'} • {publication.weight ? `${publication.weight}g` : '-'}</dd>
              </div>
              <div>
                <dt className="text-editorial-faint font-mono uppercase text-[10px]">Batas Usia</dt>
                <dd className="font-mono text-editorial-title">{publication.ageRating || 'Umum'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Related Releases in Same Series or Publisher */}
      {relatedPublications.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-border-subtle">
          <h2 className="font-editorial text-xl font-bold text-editorial-title">
            Rilisan Terkait yang Mungkin Anda Sukai
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedPublications.map((rel) => (
              <Link
                key={rel.id}
                href={`/books/${rel.slug}`}
                className="glass-card rounded-xl p-3 flex flex-col justify-between group"
              >
                <div className="aspect-[3/4] w-full bg-surface-overlay rounded-lg overflow-hidden mb-2">
                  {rel.coverImage && (
                    <img src={rel.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-editorial-title line-clamp-1 group-hover:text-gold transition-colors">
                    {rel.title}
                  </h3>
                  <p className="text-[11px] text-editorial-muted font-mono mt-0.5">
                    {formatIDR(rel.currentPrice)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

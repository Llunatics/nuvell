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
  ChevronDown,
  Plus,
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

  const [openSections, setOpenSections] = React.useState({
    description: true,
    sources: true,
    metadata: false,
    priceHistory: false,
    changes: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  const handleCollectionToggle = () => {
    const nextStatus = collectionStatus === 'OWNED' ? null : 'OWNED';
    setItemStatus(publication.id, nextStatus, {
      seriesId: publication.seriesId || undefined,
      volume: publication.volume || undefined,
    });
    if (nextStatus === 'OWNED') {
      toast({ title: 'Ditandai sebagai Dimiliki', description: publication.title, variant: 'success' });
    } else {
      toast({ title: 'Dihapus dari Koleksi', description: publication.title });
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-28 md:pb-0">
      {/* 1. Main Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
        {/* Left Column: Book Cover & Desktop Actions */}
        <div className="md:col-span-5 lg:col-span-4 space-y-4">
          <div className="glass-panel p-2.5 sm:p-3 rounded-2xl overflow-hidden shadow-xl relative max-w-[240px] sm:max-w-none mx-auto">
            <div className="aspect-[3/4] w-full bg-surface-overlay rounded-xl overflow-hidden relative shadow-inner">
              {publication.coverImage ? (
                <img
                  src={publication.coverImage}
                  alt={publication.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-editorial-faint text-sm bg-surface-sunken">
                  Tidak ada sampul
                </div>
              )}

              {/* Status Overlay */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 text-[11px] font-mono font-bold uppercase rounded-md backdrop-blur-md border ${
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
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold uppercase rounded-md backdrop-blur-md border bg-cyan-950/85 text-cyan-300 border-cyan-600/40">
                    IMPORT
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Action Buttons: Watchlist & Collection (hidden on mobile, served by sticky bar) */}
          <div className="hidden md:block space-y-2">
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

          {/* Description (Collapsible on Mobile) */}
          {publication.description && (
            <div className="space-y-2 pt-2 border-t border-border-subtle/70 md:border-t-0">
              <button
                type="button"
                onClick={() => toggleSection('description')}
                className="w-full md:cursor-default flex items-center justify-between text-left py-1"
              >
                <h3 className="font-editorial text-sm sm:text-base font-bold text-editorial-title">
                  Sinopsis & Ringkasan Publikasi
                </h3>
                <ChevronDown className={`w-4 h-4 text-gold transition-transform md:hidden ${openSections.description ? 'rotate-180' : ''}`} />
              </button>
              <div className={`${openSections.description ? 'block' : 'hidden md:block'} transition-all`}>
                <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed whitespace-pre-line font-serif">
                  {publication.description}
                </p>
              </div>
            </div>
          )}

          {/* Multi-Source Comparison (Section 25 - Collapsible on Mobile) */}
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => toggleSection('sources')}
              className="w-full md:cursor-default flex items-center justify-between text-left py-1"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold" />
                <h3 className="font-editorial text-sm sm:text-base font-bold text-editorial-title">
                  Perbandingan Ketersediaan & Sumber Resmi
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-editorial-faint font-mono hidden sm:inline">
                  {publication.sources.length} Sumber Terverifikasi
                </span>
                <ChevronDown className={`w-4 h-4 text-gold transition-transform md:hidden ${openSections.sources ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <div className={`${openSections.sources ? 'block' : 'hidden md:block'} space-y-3`}>
              {/* Mobile Card Layout for Sources */}
              <div className="sm:hidden space-y-2">
                {publication.sources.map((src) => (
                  <div key={src.id} className="glass-card p-3 rounded-xl space-y-2 border border-border-subtle">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium text-xs text-editorial-title">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{src.sourceName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-overlay text-editorial-body border border-border-subtle">
                        {src.availability}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border-subtle/60">
                      <span className="font-mono font-bold text-xs text-editorial-title">
                        {formatIDR(publication.currentPrice)}
                      </span>
                      <a
                        href={src.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-raised border border-border-subtle text-gold text-xs font-medium transition-colors"
                      >
                        <span>Kunjungi Sumber</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table for Sources */}
              <div className="hidden sm:block overflow-x-auto">
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
          </div>

          {/* Price Tracking Chart (Collapsible on Mobile) */}
          {chartData.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => toggleSection('priceHistory')}
                className="w-full md:cursor-default flex items-center justify-between text-left py-1"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-editorial text-sm sm:text-base font-bold text-editorial-title">
                    Riwayat & Fluktuasi Harga
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-editorial-faint font-mono hidden sm:inline">
                    Terendah: {formatIDR(publication.lowestObservedPrice)}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gold transition-transform md:hidden ${openSections.priceHistory ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <div className={`${openSections.priceHistory ? 'block' : 'hidden md:block'} space-y-3`}>
                <div className="sm:hidden text-xs text-editorial-faint font-mono">
                  Terendah teramati: <span className="text-gold font-bold">{formatIDR(publication.lowestObservedPrice)}</span>
                </div>
                <PriceHistoryChart data={chartData} />
              </div>
            </div>
          )}

          {/* Change Detection Audit Trail (Collapsible on Mobile) */}
          {publication.changes.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => toggleSection('changes')}
                className="w-full md:cursor-default flex items-center justify-between text-left py-1"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-gold" />
                  <h3 className="font-editorial text-sm sm:text-base font-bold text-editorial-title">
                    Log Deteksi Perubahan Crawler
                  </h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-gold transition-transform md:hidden ${openSections.changes ? 'rotate-180' : ''}`} />
              </button>

              <div className={`${openSections.changes ? 'block' : 'hidden md:block'} space-y-2`}>
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

          {/* Bibliographic Specifications (Collapsible on Mobile) */}
          <div className="pt-4 border-t border-border-subtle space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('metadata')}
              className="w-full md:cursor-default flex items-center justify-between text-left py-1"
            >
              <h3 className="font-editorial text-sm sm:text-base font-bold text-editorial-title">
                Spesifikasi Bibliografi Resmi
              </h3>
              <ChevronDown className={`w-4 h-4 text-gold transition-transform md:hidden ${openSections.metadata ? 'rotate-180' : ''}`} />
            </button>

            <div className={`${openSections.metadata ? 'block' : 'hidden md:block'}`}>
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
      </div>

      {/* Related Releases in Same Series or Publisher */}
      {relatedPublications.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-border-subtle">
          <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
            Rilisan Terkait yang Mungkin Anda Sukai
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedPublications.map((rel) => (
              <Link
                key={rel.id}
                href={`/books/${rel.slug}`}
                className="glass-card rounded-xl p-3 flex flex-col justify-between group hover:border-gold/40 transition-all"
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

      {/* Sticky Mobile Bottom Action Bar (Requirement 16 & 17) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle p-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] flex items-center gap-2.5 shadow-2xl">
        <button
          type="button"
          onClick={handleCollectionToggle}
          className={`flex-1 h-11 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs ${
            collectionStatus === 'OWNED'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-gold text-background hover:bg-gold-400'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{collectionStatus === 'OWNED' ? '✓ Dalam Koleksi' : '+ Koleksi'}</span>
        </button>

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
          className={`h-11 px-3.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            isFollowed
              ? 'bg-gold/15 text-gold border-gold/40 font-semibold'
              : 'bg-surface border-border-subtle text-editorial-body hover:text-editorial-title'
          }`}
          aria-label="Toggle Watchlist"
        >
          <Bookmark className="w-4 h-4" fill={isFollowed ? 'currentColor' : 'none'} />
          <span>Watchlist</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="h-11 w-11 rounded-xl bg-surface border border-border-subtle text-editorial-muted hover:text-editorial-title flex items-center justify-center transition-colors active:scale-95 shrink-0"
          aria-label="Bagikan buku"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { dataService } from '@/server/db/data-service';
import { LibraryView } from '@/components/library/library-view';

export const metadata: Metadata = {
  title: 'Library — Watchlist & Koleksi Volume Saya | nuvell',
  description:
    'Kelola watchlist buku rilisan baru, lacak kelengkapan volume komik koleksi Anda, dan telusuri riwayat terbitan favorit.',
};

export default function LibraryPage() {
  const allSeries = dataService.getAllSeries();
  const popularSeriesSlugs = [
    'one-piece',
    'detektif-conan',
    'spy-x-family',
    'jujutsu-kaisen',
    'chainsaw-man',
    'blue-lock',
    'kagurabachi',
    'haikyu-fly-high-volleyball',
    'doraemon',
  ];
  const featuredSeries = allSeries
    .filter((s) => popularSeriesSlugs.includes(s.slug))
    .sort((a, b) => (b.totalVolumes || 0) - (a.totalVolumes || 0));

  const publications = dataService.getAllPublications().map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    volume: p.volume,
    coverImage: p.coverImage,
    releaseDate: p.releaseDate,
    status: p.status,
    format: p.format,
    genres: p.genres,
    currentPrice: p.currentPrice,
    publisherId: p.publisherId,
    publisherName: p.publisherName,
    seriesId: p.seriesId,
    authors: p.authors,
    recentChangeBadge: p.recentChangeBadge,
    sources: [],
    priceHistory: [],
    changes: [],
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <Suspense fallback={<div className="py-20 text-center text-xs text-editorial-faint">Memuat Library...</div>}>
        <LibraryView
          publications={publications as any}
          featuredSeries={featuredSeries}
        />
      </Suspense>
    </div>
  );
}

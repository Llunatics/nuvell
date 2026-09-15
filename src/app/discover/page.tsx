import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { dataService } from '@/server/db/data-service';
import { DiscoverView } from '@/components/discover/discover-view';

export const metadata: Metadata = {
  title: 'Discover — Eksplorasi Buku, Komik, Seri & Penerbit Indonesia | nuvell',
  description:
    'Eksplorasi rilisan baru, seri komik manga, direktori penerbit resmi, dan genre terbitan di Indonesia.',
};

export default function DiscoverPage() {
  const allPublications = dataService.getAllPublications();
  const publishers = dataService.getAllPublishers();
  const series = dataService.getAllSeries();

  const publications = allPublications.map((p) => ({
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
    seriesName: p.seriesName,
    authors: p.authors,
    recentChangeBadge: p.recentChangeBadge,
    sources: [],
    priceHistory: [],
    changes: [],
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <Suspense fallback={<div className="py-20 text-center text-xs text-editorial-faint">Memuat Discover...</div>}>
        <DiscoverView
          publications={publications as any}
          publishers={publishers}
          series={series}
        />
      </Suspense>
    </div>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import { Layers } from 'lucide-react';
import { dataService } from '@/server/db/data-service';
import { SeriesTrackerClient, SeriesSummary } from '@/components/series/series-tracker-client';

export const metadata: Metadata = {
  title: 'Series Tracker — Pantau Kelengkapan Volume Manga & Novel | nuvell',
  description:
    'Lacak status jilid manga, manhwa, dan light novel di Indonesia. Pantau volume yang sudah terbit, sedang pre-order, dan volume yang hilang dari koleksi.',
};

export default function SeriesCatalogPage() {
  const seriesList: SeriesSummary[] = dataService.getAllSeries().map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    originalTitle: s.originalTitle || undefined,
    publisherName: s.publisherName || undefined,
    totalVolumes: s.totalVolumes || undefined,
    coverUrl: s.coverUrl || (s as any).coverImage || undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-mono text-gold mb-1">
          <Layers className="w-3.5 h-3.5" />
          INDONESIA SERIES TRACKER
        </div>
        <h1 className="font-editorial text-3xl font-bold text-editorial-title">
          Katalog Seri & Waralaba
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1 max-w-2xl">
          Pantau kelengkapan jilid dan rilisan berkala dari seri manga, manhwa, dan light novel populer di Indonesia ({seriesList.length} Seri Terdaftar).
        </p>
      </div>

      <SeriesTrackerClient allSeries={seriesList} />
    </div>
  );
}

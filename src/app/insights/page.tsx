import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { dataService } from '@/server/db/data-service';
import { InsightsView } from '@/components/insights/insights-view';

export const metadata: Metadata = {
  title: 'Insights — Tren & Analisis Pasar Buku Indonesia | nuvell',
  description:
    'Laporan editorial dan analisis pasar perbukuan Indonesia: perbandingan volume penerbit, dinamika harga ritel, dan log perubahan jadwal.',
};

export default function InsightsPage() {
  const publications = dataService.getAllPublications();
  const publishers = dataService.getAllPublishers();
  const sources = dataService.getAllSources();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <Suspense fallback={<div className="py-20 text-center text-xs text-editorial-faint">Memuat Insights...</div>}>
        <InsightsView
          publications={publications}
          publishers={publishers}
          sources={sources}
        />
      </Suspense>
    </div>
  );
}

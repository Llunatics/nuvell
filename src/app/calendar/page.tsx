import React from 'react';
import type { Metadata } from 'next';
import { dataService } from '@/server/db/data-service';
import { ReleaseCalendar } from '@/components/calendar/release-calendar';

export const metadata: Metadata = {
  title: 'Kalender Rilis Buku & Komik Indonesia | nuvell',
  description:
    'Kalender bulanan jadwal rilis buku, komik manga, manhwa, novel, dan light novel di Indonesia zona waktu Asia/Jakarta (WIB).',
};

export default function CalendarPage() {
  // Pass lightweight publications to eliminate multi-megabyte nested arrays (priceHistory, sources, changes)
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
    publisherName: p.publisherName,
    language: p.language,
    authors: p.authors,
    sources: [],
    priceHistory: [],
    changes: [],
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <ReleaseCalendar publications={publications as any} />
    </div>
  );
}

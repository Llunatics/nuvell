import React from 'react';
import type { Metadata } from 'next';
import { dataService } from '@/server/db/data-service';
import { HomeFeedClient } from '@/components/home/home-feed-client';

export const metadata: Metadata = {
  title: 'nuvell — Indonesia Book Release Discovery & Tracking',
  description:
    'Lacak rilis buku baru, jadwal terbit komik manga, manhwa, novel, dan light novel resmi di Indonesia.',
};

export default function HomePage() {
  const allPublications = dataService.getAllPublications();
  const publishers = dataService.getAllPublishers();
  const allSeries = dataService.getAllSeries();
  const announcements = dataService.getAllAnnouncements();

  // Curate active publications for home showcase (top 250 items covering today, upcoming, and fresh releases)
  const publications = allPublications.slice(0, 250).map((p) => ({
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
    completenessScore: p.completenessScore,
    sources: [],
    priceHistory: [],
    changes: [],
  }));

  // Curate featured series with covers (30 series)
  const series = allSeries.filter((s) => s.coverUrl).slice(0, 30);

  return (
    <HomeFeedClient
      publications={publications as any}
      publishers={publishers}
      series={series}
      announcements={announcements}
    />
  );
}

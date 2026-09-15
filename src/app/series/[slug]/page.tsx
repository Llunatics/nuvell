import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { dataService } from '@/server/db/data-service';
import { SeriesVolumeMatrix } from '@/components/series/series-volume-matrix';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = dataService.getSeriesBySlug(slug);

  if (!series) {
    return { title: 'Seri Tidak Ditemukan — nuvell' };
  }

  return {
    title: `${series.name} — Indonesia Series Tracker & Volume Matrix | nuvell`,
    description: `Lacak status rilis seluruh volume ${series.name} di Indonesia. Penerbit: ${series.publisherName || 'Resmi'}, total jilid: ${series.totalVolumes || 'Ongoing'}.`,
  };
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const series = dataService.getSeriesBySlug(slug);

  if (!series) {
    notFound();
  }

  const publications = dataService
    .getAllPublications()
    .filter((p) => p.seriesId === series.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <SeriesVolumeMatrix series={series} publications={publications} />
    </div>
  );
}

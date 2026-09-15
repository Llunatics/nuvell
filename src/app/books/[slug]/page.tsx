import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { dataService } from '@/server/db/data-service';
import { BookDetailClient } from '@/components/books/book-detail-client';
import { Publication } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const publication = dataService.getPublicationBySlug(slug);

  if (!publication) {
    return {
      title: 'Publikasi Tidak Ditemukan — nuvell',
    };
  }

  return {
    title: `${publication.title} — Informasi Rilis & Harga Resmi Indonesia | nuvell`,
    description: `Lacak rilis ${publication.title} oleh ${publication.publisherName}. Tanggal rilis resmi: ${publication.releaseDate || 'TBA'}, ISBN: ${publication.isbn13 || 'TBA'}, harga teramati: Rp ${publication.currentPrice?.toLocaleString('id-ID') || '-'}.`,
    openGraph: {
      title: `${publication.title} — Jadwal Rilis Indonesia`,
      description: publication.description?.slice(0, 160),
      images: publication.coverImage ? [publication.coverImage] : [],
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const publication = dataService.getPublicationBySlug(slug);

  if (!publication) {
    notFound();
  }

  const related = dataService.getRelatedPublications(publication, 4);

  // Neighbor volumes in the same series
  let neighborVolumes: Publication[] = [];
  if (publication.seriesId) {
    neighborVolumes = dataService
      .getAllPublications()
      .filter((p) => p.seriesId === publication.seriesId)
      .sort((a, b) => (a.volume || 0) - (b.volume || 0));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <BookDetailClient
        publication={publication}
        relatedPublications={related}
        neighborVolumes={neighborVolumes}
      />
    </div>
  );
}

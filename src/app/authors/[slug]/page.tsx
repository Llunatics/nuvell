import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { User, BookOpen, Layers } from 'lucide-react';
import { dataService } from '@/server/db/data-service';
import { ReleaseCard } from '@/components/books/release-card';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const authorData = dataService.getAuthorBySlug(slug);

  if (!authorData) {
    return { title: 'Pengarang Tidak Ditemukan — nuvell' };
  }

  return {
    title: `${authorData.author.name} — Profil Pengarang & Terbitan di Indonesia | nuvell`,
    description: `Daftar buku, komik manga, dan karya ${authorData.author.name} yang diterbitkan resmi di Indonesia.`,
  };
}

export default async function AuthorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const authorData = dataService.getAuthorBySlug(slug);

  if (!authorData) {
    notFound();
  }

  const { author, publications } = authorData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      {/* Author Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-l-4 border-gold flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-surface-overlay border border-border-subtle flex items-center justify-center text-gold shrink-0">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase text-gold">Profil Kreator / Penulis</span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-editorial-title">
            {author.name}
          </h1>
          {author.biography && (
            <p className="text-xs sm:text-sm text-editorial-muted max-w-2xl leading-relaxed pt-1">
              {author.biography}
            </p>
          )}
        </div>
      </div>

      {/* Publications by Author */}
      <section className="space-y-4">
        <h2 className="font-editorial text-xl font-bold text-editorial-title">
          Karya Terbitan di Indonesia ({publications.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {publications.map((pub) => (
            <ReleaseCard key={pub.id} publication={pub} layout="grid" />
          ))}
        </div>
      </section>
    </div>
  );
}

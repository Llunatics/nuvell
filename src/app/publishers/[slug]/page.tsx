import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ShieldCheck, ExternalLink, Calendar, BookOpen, Layers, Radio } from 'lucide-react';
import { dataService } from '@/server/db/data-service';
import { ReleaseCard } from '@/components/books/release-card';
import { formatShortDate } from '@/lib/formatters';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const publisher = dataService.getPublisherBySlug(slug);

  if (!publisher) {
    return { title: 'Penerbit Tidak Ditemukan — nuvell' };
  }

  return {
    title: `${publisher.name} — Jadwal Rilis & Katalog Terbitan Baru Indonesia | nuvell`,
    description: `Pantau rilisan buku, manga, dan novel terbaru dari ${publisher.name} di Indonesia. Jadwal resmi terverifikasi dari sumber terpercaya.`,
  };
}

export default async function PublisherDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const publisher = dataService.getPublisherBySlug(slug);

  if (!publisher) {
    notFound();
  }

  const publications = dataService.getPublicationsByPublisher(publisher.id);
  const announcements = dataService.getAllAnnouncements().filter((a) => a.publisherId === publisher.id);

  const upcoming = publications.filter((p) => p.status === 'PREORDER' || p.status === 'ANNOUNCED');
  const available = publications.filter((p) => p.status === 'RELEASED' || p.status === 'AVAILABLE');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      {/* Publisher Header Banner */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border-l-4 border-gold space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-overlay border border-border-subtle flex items-center justify-center font-editorial font-bold text-2xl text-gold shadow-lg shrink-0">
              {publisher.name[0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Penerbit Resmi Terverifikasi
                </span>
                <span className="text-xs text-editorial-faint font-mono">• {publisher.country}</span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-editorial-title">
                {publisher.name}
              </h1>
              {publisher.description && (
                <p className="text-xs sm:text-sm text-editorial-muted max-w-2xl leading-relaxed pt-1">
                  {publisher.description}
                </p>
              )}
            </div>
          </div>

          {publisher.websiteUrl && (
            <a
              href={publisher.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-xs text-gold hover:text-gold-300 transition-colors shrink-0"
            >
              <span>Situs Resmi Penerbit</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border-subtle">
          <div>
            <span className="text-[10px] font-mono uppercase text-editorial-faint block">Total Terlacak</span>
            <p className="text-xl font-bold font-editorial text-editorial-title">{publications.length} Judul</p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-editorial-faint block">Segera Hadir</span>
            <p className="text-xl font-bold font-editorial text-purple-400">{upcoming.length} Rilis</p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-editorial-faint block">Lini Imprint</span>
            <p className="text-xl font-bold font-editorial text-editorial-title">{publisher.imprints?.length || 0}</p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-editorial-faint block">Status Sumber</span>
            <p className="text-xl font-bold font-editorial text-emerald-400">Aktif & Sehat</p>
          </div>
        </div>
      </div>

      {/* Official Announcements */}
      {announcements.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-editorial text-xl font-bold text-editorial-title flex items-center gap-2">
            <Radio className="w-4 h-4 text-gold" />
            Siaran Pers & Berita Rilis Resmi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="glass-card p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-mono text-editorial-faint block">{formatShortDate(ann.publishedAt)}</span>
                <h3 className="font-editorial text-sm font-bold text-editorial-title">{ann.title}</h3>
                <p className="text-xs text-editorial-muted line-clamp-2">{ann.excerpt}</p>
                <a
                  href={ann.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gold hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Baca Selengkapnya di Sumber Asli ↗
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Releases */}
      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-editorial text-xl font-bold text-editorial-title">
            Segera Terbit dari {publisher.name} ({upcoming.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {upcoming.map((pub) => (
              <ReleaseCard key={pub.id} publication={pub} layout="grid" />
            ))}
          </div>
        </section>
      )}

      {/* Available Releases */}
      <section className="space-y-4">
        <h2 className="font-editorial text-xl font-bold text-editorial-title">
          Katalog Terbitan Beredar ({available.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {available.map((pub) => (
            <ReleaseCard key={pub.id} publication={pub} layout="grid" />
          ))}
        </div>
      </section>
    </div>
  );
}

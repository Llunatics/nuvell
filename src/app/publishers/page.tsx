import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Building2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { dataService } from '@/server/db/data-service';

export const metadata: Metadata = {
  title: 'Penerbit Buku & Komik Resmi di Indonesia | nuvell',
  description:
    'Daftar lengkap penerbit buku, komik manga, manhwa, dan sastra resmi di Indonesia yang dipantau oleh sistem nuvell.',
};

export default function PublishersDirectoryPage() {
  const publishers = dataService.getAllPublishers();
  const allPubs = dataService.getAllPublications();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-mono text-gold mb-1">
          <Building2 className="w-3.5 h-3.5" />
          VERIFIED PUBLISHER DIRECTORY
        </div>
        <h1 className="font-editorial text-3xl font-bold text-editorial-title">
          Penerbit Terverifikasi di Indonesia
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1 max-w-2xl">
          Informasi rilis dikumpulkan langsung dari jadwal resmi penerbit, katalog toko buku jaringan nasional, dan pengumuman distributor.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishers.map((pub) => {
          const pubReleases = allPubs.filter((p) => p.publisherId === pub.id);
          const upcoming = pubReleases.filter((p) => p.status === 'PREORDER' || p.status === 'ANNOUNCED');

          return (
            <div
              key={`${pub.id}-${pub.slug}`}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-surface-overlay border border-border-subtle flex items-center justify-center font-editorial font-bold text-lg text-gold group-hover:border-gold/50 transition-colors">
                    {pub.name[0]}
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Resmi
                  </span>
                </div>

                <div>
                  <Link href={`/publishers/${pub.slug}`} className="hover:text-gold transition-colors">
                    <h2 className="font-editorial text-lg font-bold text-editorial-title">
                      {pub.name}
                    </h2>
                  </Link>
                  <p className="text-xs text-editorial-muted mt-1 line-clamp-2 leading-relaxed">
                    {pub.description}
                  </p>
                </div>

                {pub.imprints && pub.imprints.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase text-editorial-faint block mb-1">
                      Lini Imprint:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {pub.imprints.map((imp) => (
                        <span
                          key={imp.id}
                          className="px-2 py-0.5 rounded text-[11px] bg-surface border border-border-subtle text-editorial-body"
                        >
                          {imp.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats & Link */}
              <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                <div className="text-xs font-mono text-editorial-faint">
                  <span>{pubReleases.length} rilisan</span> • <span>{upcoming.length} segera hadir</span>
                </div>
                <Link
                  href={`/publishers/${pub.slug}`}
                  className="text-xs text-gold font-medium hover:underline flex items-center gap-1"
                >
                  Lihat Profil →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

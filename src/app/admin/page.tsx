import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Terminal, ArrowLeft, ShieldAlert } from 'lucide-react';
import { dataService } from '@/server/db/data-service';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export const metadata: Metadata = {
  title: 'Crawler Observability & Admin | nuvell',
  description: 'Panel kontrol internal pemantauan adapter crawler, antrean job, dan log observabilitas nuvell.',
};

export default function AdminPage() {
  const sources = dataService.getAllSources();
  const logs = dataService.getCrawlLogs();
  const queue = dataService.getReviewQueue();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6">
      {/* Admin Isolation Header Banner */}
      <div className="p-4 rounded-2xl bg-surface border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Terminal className="w-4 h-4" />
          </span>
          <div>
            <span className="font-semibold text-editorial-title block">
              Area Administrasi & Observabilitas Internal
            </span>
            <span className="text-editorial-faint text-[11px]">
              Panel ini terisolasi dari navigasi publik pengguna umum
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-raised hover:bg-surface border border-border-subtle text-editorial-muted hover:text-gold transition-colors font-medium self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Produk Publik</span>
        </Link>
      </div>

      <AdminDashboard
        initialSources={sources}
        initialLogs={logs}
        reviewQueue={queue}
      />
    </div>
  );
}

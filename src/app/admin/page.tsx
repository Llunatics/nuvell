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
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-surface/80 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Terminal className="w-4 h-4" />
          </span>
          <div>
            <span className="font-semibold text-editorial-title block text-xs sm:text-sm">
              Area Administrasi & Observabilitas Internal
            </span>
            <span className="text-editorial-faint text-xs">
              Panel terisolasi untuk pemantauan adapter dan orkestrasi perayapan data
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-editorial-muted hover:text-editorial-title transition-all font-medium text-xs sm:text-sm self-start sm:self-auto shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-gold" />
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

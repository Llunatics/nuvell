import React from 'react';
import type { Metadata } from 'next';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  Terminal,
  ExternalLink,
  Info,
  Layers,
} from 'lucide-react';
import { dataService } from '@/server/db/data-service';
import { formatDate } from '@/lib/formatters';

export const metadata: Metadata = {
  title: 'Transparansi Sumber & Etika Crawler | nuvell',
  description:
    'Komitmen keterbukaan data, etika perayapan (web crawling) yang sopan, kepatuhan robots.txt, dan daftar sumber terverifikasi di nuvell.',
};

export default function SourcesPage() {
  const sources = dataService.getAllSources();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border-l-4 border-gold space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-gold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          PUBLIC DATA AGGREGATION & SCRAPING ETHICS
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-editorial-title">
          Transparansi Sumber & Etika Pelacak
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted max-w-2xl leading-relaxed">
          Platform ini secara otomatis mengumpulkan dan mengorganisasi informasi bibliografi dan jadwal rilis yang tersedia secara publik dari sumber-sumber terverifikasi di Indonesia.
        </p>
      </div>

      {/* Principles Grid (Section 3 & 50) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="font-editorial text-base font-bold text-editorial-title">
            Kepatuhan Robots.txt & ToS
          </h2>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Crawler selalu memeriksa file robots.txt di setiap domain sebelum melakukan permintaan data, serta mematuhi aturan Disallow dan Crawl-delay yang ditetapkan pemilik situs.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="font-editorial text-base font-bold text-editorial-title">
            Rate Limiting & Delay Sopan
          </h2>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Menerapkan interval delay minimal 2.000 ms antar-permintaan dengan batas konkurensi rendah dan exponential backoff agar tidak membebani server penyedia sumber.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-editorial text-base font-bold text-editorial-title">
            Tanpa Stealth & Bypass
          </h2>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Kami TIDAK PERNAH membypass CAPTCHA, authentication, paywall, atau anti-bot protection. Jika sumber membatasi akses otomatis, adapter akan dinonaktifkan secara terhormat.
          </p>
        </div>
      </div>

      {/* Registered Sources Table (Section 5, 50) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-xl font-bold text-editorial-title">
              Daftar Sumber Terdaftar (Source Registry)
            </h2>
            <p className="text-xs text-editorial-muted">
              Status kesehatan, interval crawl, dan parameter kepatuhan per sumber
            </p>
          </div>
          <span className="text-xs font-mono text-editorial-faint">
            {sources.length} Sumber Aktif
          </span>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface/50 text-editorial-faint font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Nama Sumber & Domain</th>
                  <th className="py-3 px-4">Tipe Sumber</th>
                  <th className="py-3 px-4">Tingkat Keyakinan</th>
                  <th className="py-3 px-4">Status Kesehatan</th>
                  <th className="py-3 px-4">Kepatuhan Robots.txt</th>
                  <th className="py-3 px-4">Interval Crawl</th>
                  <th className="py-3 px-4">Terakhir Diperiksa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {sources.map((src) => (
                  <tr key={src.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-editorial-title">
                      <div>
                        <span>{src.name}</span>
                        <a
                          href={src.baseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-editorial-muted font-mono block hover:text-gold transition-colors"
                        >
                          {src.domain} ↗
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-border-subtle text-editorial-body">
                        {src.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gold text-[11px]">
                      {src.confidenceLevel.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {src.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-editorial-muted">
                      {src.robotsStatus}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-editorial-faint">
                      {src.crawlIntervalMin} menit
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-editorial-faint">
                      {src.lastCrawledAt ? formatDate(src.lastCrawledAt) : 'Belum pernah'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* User-Agent Identification Banner */}
      <div className="glass-card p-6 rounded-2xl space-y-2 border border-border-subtle font-mono text-xs text-editorial-muted">
        <span className="text-gold font-bold uppercase text-[10px] block">Identitas Crawler (User-Agent Header)</span>
        <code className="p-2.5 rounded bg-surface block text-editorial-title overflow-x-auto">
          nuvell-bot/1.0 (+https://nuvell.id/crawler-policy; contact@nuvell.id)
        </code>
        <p className="text-[11px] text-editorial-faint font-sans pt-1">
          Pengelola situs web yang ingin memperbarui instruksi atau meminta pengecualian perayapan dapat menghubungi kontak di atas.
        </p>
      </div>
    </div>
  );
}

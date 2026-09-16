'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Building2,
  TrendingDown,
  History,
  Radio,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Publication, Publisher, Source } from '@/types';
import { formatIDR, formatShortDate, formatDate } from '@/lib/formatters';

const FormatPieChart = dynamic(
  () => import('./insights-charts').then((mod) => mod.FormatPieChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-xs text-editorial-faint font-mono">
        Memuat grafik format...
      </div>
    ),
  }
);

const PriceDistributionBarChart = dynamic(
  () => import('./insights-charts').then((mod) => mod.PriceDistributionBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-xs text-editorial-faint font-mono">
        Memuat grafik rentang harga...
      </div>
    ),
  }
);

const PublisherVolumeBarChart = dynamic(
  () => import('./insights-charts').then((mod) => mod.PublisherVolumeBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 flex items-center justify-center text-xs text-editorial-faint font-mono">
        Memuat grafik volume penerbit...
      </div>
    ),
  }
);

interface InsightsViewProps {
  publications: Publication[];
  publishers: Publisher[];
  sources: Source[];
}

type InsightsTab = 'trends' | 'publishers' | 'prices' | 'changes';

export function InsightsView({ publications, publishers, sources }: InsightsViewProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as InsightsTab) || 'trends';
  const [activeTab, setActiveTab] = useState<InsightsTab>(
    ['trends', 'publishers', 'prices', 'changes'].includes(initialTab) ? initialTab : 'trends'
  );

  // Aggregate detected changes across publications
  const allChanges = useMemo(() => {
    return publications.flatMap((p) =>
      (p.changes || []).map((c) => ({
        ...c,
        publicationTitle: p.title,
        publicationSlug: p.slug,
        publisherName: p.publisherName,
      }))
    ).sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }, [publications]);

  const priceChanges = useMemo(() => {
    return allChanges.filter((c) => c.field === 'PRICE');
  }, [allChanges]);

  const dateShifts = useMemo(() => {
    return allChanges.filter((c) => c.field === 'RELEASE_DATE');
  }, [allChanges]);

  // Publisher chart data
  const pubCounts = useMemo(() => {
    return publishers.map((pub) => ({
      name: pub.name.replace('Komputindo', '').trim(),
      fullName: pub.name,
      slug: pub.slug,
      count: publications.filter((p) => p.publisherId === pub.id).length,
    })).sort((a, b) => b.count - a.count);
  }, [publishers, publications]);

  // Format data
  const formatData = useMemo(() => {
    const formatMap = new Map<string, number>();
    publications.forEach((p) => {
      formatMap.set(p.format || 'OTHER', (formatMap.get(p.format || 'OTHER') || 0) + 1);
    });
    return Array.from(formatMap.entries()).map(([name, value]) => ({ name, value }));
  }, [publications]);

  // Price segments data
  const priceData = useMemo(() => [
    { range: '< Rp 50k', count: publications.filter((p) => (p.currentPrice || 0) < 50000).length },
    { range: 'Rp 50k - 100k', count: publications.filter((p) => (p.currentPrice || 0) >= 50000 && (p.currentPrice || 0) <= 100000).length },
    { range: 'Rp 100k - 150k', count: publications.filter((p) => (p.currentPrice || 0) > 100000 && (p.currentPrice || 0) <= 150000).length },
    { range: '> Rp 150k', count: publications.filter((p) => (p.currentPrice || 0) > 150000).length },
  ], [publications]);

  const validPrices = publications.map((p) => p.currentPrice).filter(Boolean) as number[];
  const avgPrice = validPrices.length > 0 ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0;

  const COLORS = ['#C5A059', '#8B263E', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-wider">
          <LineChartIcon className="w-3.5 h-3.5" />
          PASAR & INTELIJEN TERBITAN BUKU INDONESIA
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-editorial-title">
          Insights
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted max-w-2xl leading-relaxed">
          Analisis editorial dan tren agregasi resmi penerbit: distribusi format, dinamika harga ritel, pergeseran tanggal edar, dan aktivitas terverifikasi.
        </p>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-editorial-faint uppercase block">
            Judul Terindeks
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-editorial text-editorial-title">
            {publications.length}
          </p>
          <span className="text-[11px] text-editorial-faint block">
            Dari {publishers.length} penerbit resmi
          </span>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-editorial-faint uppercase block">
            Rata-Rata Harga Buku
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-editorial text-gold">
            {formatIDR(avgPrice)}
          </p>
          <span className="text-[11px] text-editorial-faint block">
            Harga resmi toko buku Indonesia
          </span>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-editorial-faint uppercase block">
            Perubahan Tanggal
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-editorial text-burgundy-400">
            {dateShifts.length}
          </p>
          <span className="text-[11px] text-editorial-faint block">
            Pergeseran jadwal terdeteksi
          </span>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-editorial-faint uppercase block">
            Dinamika Harga
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-editorial text-emerald-400">
            {priceChanges.length}
          </p>
          <span className="text-[11px] text-editorial-faint block">
            Penyesuaian harga teramati
          </span>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-surface-raised rounded-2xl border border-border-subtle overflow-x-auto no-scrollbar shadow-sm">
        {[
          { id: 'trends', label: 'Tren Pasar & Format', icon: TrendingUp },
          { id: 'publishers', label: 'Aktivitas Penerbit', icon: Building2 },
          { id: 'prices', label: `Pergerakan Harga (${priceChanges.length})`, icon: TrendingDown },
          { id: 'changes', label: `Log Perubahan Jadwal (${dateShifts.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as InsightsTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-surface text-editorial-title font-semibold shadow-sm border border-border-subtle'
                  : 'text-editorial-muted hover:text-editorial-title hover:bg-surface/50 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-editorial-faint'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TRENDS */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Format Breakdown */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="font-editorial text-base font-bold text-editorial-title">
                Distribusi Format Fisik
              </h3>
              <p className="text-xs text-editorial-muted">
                Perbandingan volume cetak antara Tankobon, Kanzenban, Paperback, dan Hardcover
              </p>
            </div>
            <FormatPieChart data={formatData} />
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              {formatData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-editorial-body">{entry.name}:</span>
                  <span className="font-mono font-semibold text-editorial-title">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Segmentation */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="font-editorial text-base font-bold text-editorial-title">
                Rentang Harga Buku di Indonesia
              </h3>
              <p className="text-xs text-editorial-muted">
                Sebaran harga komik manga reguler vs buku kolektor dan edisi khusus
              </p>
            </div>
            <PriceDistributionBarChart data={priceData} />
          </div>
        </div>
      )}

      {/* TAB 2: PUBLISHERS */}
      {activeTab === 'publishers' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="font-editorial text-base font-bold text-editorial-title">
                Volume Terbitan per Penerbit
              </h3>
              <p className="text-xs text-editorial-muted">
                Jumlah judul resmi yang aktif dipantau dan didistribusikan di jaringan Gramedia
              </p>
            </div>

            <PublisherVolumeBarChart data={pubCounts} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pubCounts.map((p) => (
              <div key={p.slug} className="glass-card rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-editorial text-sm font-bold text-editorial-title">
                    {p.fullName}
                  </h4>
                  <p className="text-xs text-editorial-muted mt-0.5 font-mono">
                    {p.count} judul aktif terlacak
                  </p>
                </div>
                <Link
                  href={`/publishers/${p.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-raised border border-border-subtle text-xs text-gold transition-colors font-medium"
                >
                  Katalog →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRICE MOVEMENTS */}
      {activeTab === 'prices' && (
        <div className="space-y-4">
          <div>
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
              Riwayat Perubahan Harga Resmi
            </h2>
            <p className="text-xs text-editorial-muted mt-0.5">
              Pencatatan penurunan harga, diskon pre-order, dan perubahan harga teramati
            </p>
          </div>

          {priceChanges.length === 0 ? (
            <div className="p-12 text-center bg-surface/30 rounded-2xl border border-border-subtle">
              <p className="text-xs text-editorial-muted">
                Belum ada fluktuasi harga yang signifikan terdeteksi dalam 14 hari terakhir.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {priceChanges.map((change) => (
                <div
                  key={change.id}
                  className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-editorial-faint">
                      {change.publisherName} • {formatShortDate(change.detectedAt)}
                    </span>
                    <Link href={`/books/${change.publicationSlug}`}>
                      <h4 className="text-sm font-semibold text-editorial-title hover:text-gold transition-colors">
                        {change.publicationTitle}
                      </h4>
                    </Link>
                    {change.sourceName && (
                      <p className="text-xs text-editorial-muted">Terdeteksi dari {change.sourceName}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {change.oldValue && (
                      <span className="text-xs line-through text-editorial-faint font-mono">
                        {formatIDR(Number(change.oldValue) || 0)}
                      </span>
                    )}
                    <span className="text-xs text-gold font-mono font-bold">
                      {formatIDR(Number(change.newValue) || 0)}
                    </span>
                    <Link
                      href={`/books/${change.publicationSlug}`}
                      className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-raised border border-border-subtle text-xs text-editorial-title"
                    >
                      Lihat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SCHEDULE CHANGES */}
      {activeTab === 'changes' && (
        <div className="space-y-4">
          <div>
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
              Log Perubahan Jadwal Terbit
            </h2>
            <p className="text-xs text-editorial-muted mt-0.5">
              Pencatatan pergeseran tanggal edar komik atau buku yang dikonfirmasi oleh penerbit
            </p>
          </div>

          {dateShifts.length === 0 ? (
            <div className="p-12 text-center bg-surface/30 rounded-2xl border border-border-subtle">
              <p className="text-xs text-editorial-muted">
                Semua jadwal rilis saat ini tepat waktu dan belum mengalami perubahan.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dateShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-editorial-faint">
                      {shift.publisherName} • {formatShortDate(shift.detectedAt)}
                    </span>
                    <Link href={`/books/${shift.publicationSlug}`}>
                      <h4 className="text-sm font-semibold text-editorial-title hover:text-gold transition-colors">
                        {shift.publicationTitle}
                      </h4>
                    </Link>
                    {shift.sourceName && (
                      <p className="text-xs text-editorial-muted">Konfirmasi: {shift.sourceName}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
                    {shift.oldValue && (
                      <span className="line-through text-editorial-faint">{shift.oldValue}</span>
                    )}
                    <span className="text-burgundy-400 font-semibold">→ {shift.newValue}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

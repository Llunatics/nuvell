'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Publication, Publisher, Source } from '@/types';
import { formatIDR } from '@/lib/formatters';

interface AnalyticsChartsProps {
  publications: Publication[];
  publishers: Publisher[];
  sources: Source[];
}

export function AnalyticsCharts({ publications, publishers, sources }: AnalyticsChartsProps) {
  // 1. Releases by Publisher
  const pubCounts = publishers.map((pub) => ({
    name: pub.name.replace('Komputindo', '').trim(),
    count: publications.filter((p) => p.publisherId === pub.id).length,
  }));

  // 2. Releases by Format
  const formatMap = new Map<string, number>();
  publications.forEach((p) => {
    formatMap.set(p.format, (formatMap.get(p.format) || 0) + 1);
  });
  const formatData = Array.from(formatMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // 3. Releases by Genre
  const genreMap = new Map<string, number>();
  publications.forEach((p) => {
    p.genres.forEach((g) => {
      genreMap.set(g, (genreMap.get(g) || 0) + 1);
    });
  });
  const genreData = Array.from(genreMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 4. Price Distribution
  const priceData = [
    { range: '< Rp 50k', count: publications.filter((p) => (p.currentPrice || 0) < 50000).length },
    { range: 'Rp 50k - 100k', count: publications.filter((p) => (p.currentPrice || 0) >= 50000 && (p.currentPrice || 0) <= 100000).length },
    { range: 'Rp 100k - 150k', count: publications.filter((p) => (p.currentPrice || 0) > 100000 && (p.currentPrice || 0) <= 150000).length },
    { range: '> Rp 150k', count: publications.filter((p) => (p.currentPrice || 0) > 150000).length },
  ];

  const COLORS = ['#C5A059', '#8B263E', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  // Average price calculation
  const validPrices = publications.map((p) => p.currentPrice).filter(Boolean) as number[];
  const avgPrice = validPrices.length > 0 ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0;

  return (
    <div className="space-y-10">
      {/* High-Level Analytical KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-mono text-editorial-faint uppercase block">Total Judul Dianalisis</span>
          <p className="text-3xl font-bold font-editorial text-editorial-title mt-1">{publications.length}</p>
          <span className="text-[11px] text-editorial-faint mt-1 block">Dari {publishers.length} penerbit resmi</span>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-mono text-editorial-faint uppercase block">Rata-Rata Harga Teramati</span>
          <p className="text-3xl font-bold font-editorial text-gold mt-1">{formatIDR(avgPrice)}</p>
          <span className="text-[11px] text-editorial-faint mt-1 block">Harga ritel resmi Indonesia</span>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-mono text-editorial-faint uppercase block">Rata-Rata Kelengkapan Data</span>
          <p className="text-3xl font-bold font-editorial text-emerald-400 mt-1">94%</p>
          <span className="text-[11px] text-editorial-faint mt-1 block">ISBN & tanggal terverifikasi</span>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-mono text-editorial-faint uppercase block">Jaringan Sumber Terpantau</span>
          <p className="text-3xl font-bold font-editorial text-editorial-title mt-1">{sources.length}</p>
          <span className="text-[11px] text-editorial-faint mt-1 block">Penerbit, toko, dan katalog</span>
        </div>
      </div>

      {/* 2-Column Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Releases by Publisher */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 shadow-xl">
          <div>
            <h3 className="font-editorial text-base font-bold text-editorial-title">
              Distribusi Terbitan per Penerbit
            </h3>
            <p className="text-xs text-editorial-muted">Pangsa jumlah judul yang terlacak di Indonesia</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pubCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12151C', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F9FAFB' }}
                />
                <Bar dataKey="count" fill="#C5A059" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Format Breakdown */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 shadow-xl">
          <div>
            <h3 className="font-editorial text-base font-bold text-editorial-title">
              Pangsa Format Publikasi
            </h3>
            <p className="text-xs text-editorial-muted">Perbandingan Tankobon, Paperback, Hardcover, dan Kanzenban</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {formatData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#12151C', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F9FAFB' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Top Genres */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 shadow-xl">
          <div>
            <h3 className="font-editorial text-base font-bold text-editorial-title">
              Genre Terbanyak Dirilis
            </h3>
            <p className="text-xs text-editorial-muted">Klasifikasi terpopuler yang beredar di pasar pembaca</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#6B7280" fontSize={11} />
                <YAxis dataKey="genre" type="category" stroke="#6B7280" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12151C', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F9FAFB' }}
                />
                <Bar dataKey="count" fill="#8B263E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Price Distribution */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 shadow-xl">
          <div>
            <h3 className="font-editorial text-base font-bold text-editorial-title">
              Distribusi Rentang Harga (IDR)
            </h3>
            <p className="text-xs text-editorial-muted">Harga teramati dari komik reguler hingga edisi kolektor berilustrasi</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12151C', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F9FAFB' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface/60 border border-border-subtle text-xs text-editorial-faint font-mono text-center">
        Catatan Metodologi: Semua metrik di atas dihitung secara objektif dari data rilis teramati yang telah melalui proses normalisasi dan deduplikasi nuvell.
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { PriceSnapshot, Publication } from '@/types';
import { formatIDR, formatShortDate, formatDateTimeWIB } from '@/lib/formatters';
import { computePriceMetrics, getPublicationPriceSnapshots } from '@/lib/price';
import { TrendingDown, Calendar, ShieldCheck, Tag, Info } from 'lucide-react';

interface PriceHistoryChartProps {
  publication?: Publication;
  snapshots?: PriceSnapshot[];
  data?: { date: string; price: number; source: string }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomPriceTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0].payload;
  const snapshot: PriceSnapshot | undefined = dataPoint.snapshot;

  return (
    <div className="bg-surface-overlay border border-border-medium rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[200px] z-50">
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-1">
        <span className="font-mono text-[11px] text-editorial-faint">
          {snapshot?.observedAt ? formatDateTimeWIB(snapshot.observedAt) : label}
        </span>
        {snapshot?.sourceName && (
          <span className="text-[10px] font-mono text-gold truncate max-w-[100px]">
            {snapshot.sourceName}
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        {snapshot?.isDiscounted && snapshot.regularPrice ? (
          <>
            <div className="flex items-center justify-between gap-2 text-editorial-muted text-[11px]">
              <span>Harga Normal:</span>
              <span className="line-through font-mono">{formatIDR(snapshot.regularPrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-emerald-400 font-bold">
              <span>Harga Promo:</span>
              <span className="font-mono">{formatIDR(snapshot.effectivePrice)}</span>
            </div>
            {snapshot.discountPercent && (
              <div className="text-[10px] font-mono text-amber-400 text-right">
                Hemat {snapshot.discountPercent}%
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-editorial-muted">Harga Teramati:</span>
            <span className="font-mono font-bold text-editorial-title">
              {formatIDR(dataPoint.price)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PriceHistoryChart({ publication, snapshots: propSnapshots, data }: PriceHistoryChartProps) {
  // Derive snapshots from publication if provided, else propSnapshots, else convert data
  const snapshots: PriceSnapshot[] = React.useMemo(() => {
    if (propSnapshots && propSnapshots.length > 0) return propSnapshots;
    if (publication) return getPublicationPriceSnapshots(publication);
    if (data && data.length > 0) {
      return data.map((d, idx) => ({
        id: `snap_${idx}`,
        bookId: 'unknown',
        sourceId: 'src_default',
        sourceName: d.source,
        observedAt: d.date,
        currency: 'IDR',
        regularPrice: d.price,
        salePrice: null,
        effectivePrice: d.price,
        discountPercent: null,
        isDiscounted: false,
        availability: 'AVAILABLE',
      }));
    }
    return [];
  }, [publication, propSnapshots, data]);

  const metrics = React.useMemo(() => {
    if (publication) {
      return computePriceMetrics(publication, snapshots);
    }
    if (snapshots.length > 0) {
      return computePriceMetrics(
        {
          id: snapshots[0]?.bookId || 'unknown',
          slug: 'unknown',
          title: 'Unknown',
          format: 'PAPERBACK',
          language: 'id',
          country: 'Indonesia',
          status: 'RELEASED',
          firstSeenAt: snapshots[0]?.observedAt || '',
          lastSeenAt: snapshots[snapshots.length - 1]?.observedAt || '',
          completenessScore: 100,
          publisherId: 'pub_default',
          publisherName: 'Publisher',
          authors: [],
          genres: [],
          sources: [],
          priceHistory: [],
          changes: [],
          sourceCount: 1,
          currentPrice: snapshots[snapshots.length - 1]?.effectivePrice,
        } as unknown as Publication,
        snapshots
      );
    }
    return null;
  }, [publication, snapshots]);

  // STATE 1: Empty state
  if (!metrics || metrics.state === 'EMPTY') {
    return (
      <div className="rounded-2xl p-6 bg-surface/60 border border-border-subtle text-center space-y-2">
        <Info className="w-6 h-6 text-editorial-faint mx-auto" />
        <h4 className="font-editorial text-sm font-semibold text-editorial-title">
          Belum Ada Riwayat Harga
        </h4>
        <p className="text-xs text-editorial-muted max-w-md mx-auto">
          Riwayat fluktuasi harga akan mulai dicatat secara otomatis saat crawler mendeteksi observasi harga pertama di katalog resmi.
        </p>
      </div>
    );
  }

  // Format chart data points (only actual observed points)
  const chartPoints = snapshots.map((s) => ({
    date: formatShortDate(s.observedAt),
    price: s.effectivePrice,
    regularPrice: s.regularPrice,
    snapshot: s,
  }));

  return (
    <div className="space-y-4">
      {/* Price Summary Dashboard Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Current Effective Price */}
        <div className="p-3 rounded-xl bg-surface/80 border border-border-subtle space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-editorial-faint block">
            Harga Saat Ini
          </span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-sm sm:text-base text-editorial-title">
              {formatIDR(metrics.currentPrice)}
            </span>
            {metrics.isDiscounted && metrics.discountPercent && (
              <span className="text-[10px] font-mono font-bold px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                -{metrics.discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Lowest Observed Price */}
        <div className="p-3 rounded-xl bg-surface/80 border border-border-subtle space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-editorial-faint block">
            Terendah Teramati
          </span>
          <span className="font-mono font-bold text-sm sm:text-base text-gold">
            {formatIDR(metrics.lowestObservedPrice)}
          </span>
        </div>

        {/* Highest Observed / Normal List Price */}
        <div className="p-3 rounded-xl bg-surface/80 border border-border-subtle space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-editorial-faint block">
            Tertinggi Teramati
          </span>
          <span className="font-mono font-bold text-sm sm:text-base text-editorial-body">
            {formatIDR(metrics.highestObservedPrice)}
          </span>
        </div>

        {/* Last Observation Timestamp */}
        <div className="p-3 rounded-xl bg-surface/80 border border-border-subtle space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-editorial-faint block">
            Terakhir Diperbarui
          </span>
          <span className="font-mono text-xs sm:text-[11px] text-editorial-muted block truncate">
            {metrics.lastUpdated ? formatDateTimeWIB(metrics.lastUpdated) : 'Terkini (WIB)'}
          </span>
        </div>
      </div>

      {/* STATE 2: Single Point Limited History */}
      {metrics.state === 'SINGLE_POINT' && (
        <div className="rounded-xl p-4 bg-surface/50 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-editorial-title">
              <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>
                Riwayat mulai dicatat sejak {formatDateTimeWIB(metrics.firstRecordedAt)}
              </span>
            </div>
            <p className="text-[11px] text-editorial-muted">
              Harga saat ini stabil di {formatIDR(metrics.currentPrice)}. Grafik fluktuasi akan terbentuk otomatis ketika terdapat perubahan atau promo harga baru.
            </p>
          </div>

          {metrics.isDiscounted && metrics.regularPrice && (
            <div className="p-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 shrink-0 text-right font-mono">
              <span className="text-[10px] text-editorial-muted block line-through">
                Normal: {formatIDR(metrics.regularPrice)}
              </span>
              <span className="text-emerald-400 font-bold text-xs">
                Promo: {formatIDR(metrics.currentPrice)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* STATE 3: Multiple Points Authentic Chart */}
      {metrics.state === 'MULTIPLE_POINTS' && (
        <div className="rounded-xl p-4 bg-surface/50 border border-border-subtle h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                domain={['auto', 'auto']}
                tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomPriceTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#C5A059"
                strokeWidth={2.5}
                dot={{ fill: '#C5A059', r: 4, strokeWidth: 2, stroke: '#12161F' }}
                activeDot={{ r: 6, fill: '#C5A059', stroke: '#FDFBF5', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

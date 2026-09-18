import { Source, CrawlLog } from '@/types';
import { formatDateTimeWIB, formatRelativeTime } from './formatters';

export type SystemSyncStatus = 'LIVE' | 'SYNCING' | 'TRACKER' | 'STALE' | 'ERROR';

export interface FreshnessInfo {
  status: SystemSyncStatus;
  label: string;
  badgeClass: string;
  dotClass: string;
  tooltipText: string;
  lastSyncAt: string | null;
}

/**
 * Computes honest system/data sync freshness based on crawl logs and source health.
 */
export function getSystemFreshness(
  sources?: Source[],
  latestLog?: CrawlLog | null,
  isSyncing = false
): FreshnessInfo {
  if (isSyncing) {
    return {
      status: 'SYNCING',
      label: 'SYNCING',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-400 animate-ping',
      tooltipText: 'Sedang melakukan sinkronisasi data katalog penerbit...',
      lastSyncAt: latestLog?.finishedAt || null,
    };
  }

  // Check if any critical source is broken
  const hasErrorSource = sources?.some((s) => s.status === 'CIRCUIT_OPEN' || s.status === 'BLOCKED');
  if (hasErrorSource) {
    return {
      status: 'ERROR',
      label: 'DEGRADED',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dotClass: 'bg-rose-500',
      tooltipText: 'Sebagian jalur perayap mengalami kendala teknis.',
      lastSyncAt: latestLog?.finishedAt || null,
    };
  }

  const syncDateStr = latestLog?.finishedAt || sources?.[0]?.lastSuccessAt;
  if (!syncDateStr) {
    return {
      status: 'TRACKER',
      label: 'TRACKER',
      badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      dotClass: 'bg-sky-400 animate-pulse',
      tooltipText: 'Pelacak aktif • Siap menyinkronkan rilis resmi',
      lastSyncAt: null,
    };
  }

  const syncTime = new Date(syncDateStr).getTime();
  const now = Date.now();
  const diffHours = (now - syncTime) / (1000 * 60 * 60);

  if (diffHours <= 2) {
    return {
      status: 'LIVE',
      label: 'LIVE',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400 animate-pulse',
      tooltipText: `Data diperbarui ${formatRelativeTime(syncDateStr)} (${formatDateTimeWIB(syncDateStr)})`,
      lastSyncAt: syncDateStr,
    };
  } else if (diffHours <= 24) {
    return {
      status: 'TRACKER',
      label: 'SYNC',
      badgeClass: 'bg-gold/15 text-gold border-gold/30',
      dotClass: 'bg-gold',
      tooltipText: `Sinkronisasi terakhir: ${formatDateTimeWIB(syncDateStr)}`,
      lastSyncAt: syncDateStr,
    };
  } else {
    return {
      status: 'STALE',
      label: 'STALE',
      badgeClass: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
      dotClass: 'bg-zinc-400',
      tooltipText: `Data melampaui SLA (>24 jam). Sinkronisasi terakhir: ${formatDateTimeWIB(syncDateStr)}`,
      lastSyncAt: syncDateStr,
    };
  }
}

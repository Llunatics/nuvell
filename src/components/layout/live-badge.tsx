'use client';

import React, { useEffect, useState } from 'react';
import { getSystemFreshness, FreshnessInfo } from '@/lib/freshness';
import { Tooltip } from '@/components/ui/tooltip';

export function LiveBadge() {
  const [freshness, setFreshness] = useState<FreshnessInfo>(() =>
    getSystemFreshness(undefined, null, false)
  );

  useEffect(() => {
    // Attempt to fetch latest crawl log or source status from health/status API
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.sources || data?.latestCrawl) {
          setFreshness(getSystemFreshness(data.sources, data.latestCrawl, data.isSyncing));
        }
      })
      .catch(() => {
        // Keep default honest TRACKER state
      });
  }, []);

  return (
    <Tooltip content={freshness.tooltipText} side="bottom">
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight border shadow-2xs cursor-help transition-colors ${freshness.badgeClass}`}
      >
        <span className={`w-1 h-1 rounded-full shrink-0 ${freshness.dotClass}`} />
        <span className="leading-none">{freshness.label}</span>
      </span>
    </Tooltip>
  );
}

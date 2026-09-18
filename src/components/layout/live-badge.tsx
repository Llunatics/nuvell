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
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider border shadow-sm cursor-help transition-colors ${freshness.badgeClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${freshness.dotClass}`} />
        <span>{freshness.label}</span>
      </span>
    </Tooltip>
  );
}

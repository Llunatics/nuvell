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
        className={`inline-flex items-center px-1 py-[1px] rounded-[3px] text-[7px] sm:text-[7.5px] font-mono font-semibold tracking-wider uppercase border leading-none cursor-help transition-all ${freshness.badgeClass}`}
      >
        {(freshness.status === 'LIVE' || freshness.status === 'SYNCING') && (
          <span className={`w-1 h-1 rounded-full mr-1 shrink-0 ${freshness.dotClass}`} />
        )}
        <span className="leading-none">{freshness.label}</span>
      </span>
    </Tooltip>
  );
}


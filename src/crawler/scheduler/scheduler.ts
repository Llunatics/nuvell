// Scheduler for nuvelll Crawl Jobs

import { ALL_ADAPTERS } from '../adapters';
import { jobQueue, CrawlJobPayload } from '../jobs/queue';

export class CrawlerScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[nuvelll:Scheduler] Starting crawl scheduler...');

    for (const adapter of ALL_ADAPTERS) {
      const intervalMs = adapter.crawlIntervalMin * 60 * 1000;

      // Schedule periodic crawls
      const timer = setInterval(() => {
        console.log(`[nuvelll:Scheduler] Triggering periodic crawl for ${adapter.name} (${adapter.id})`);
        jobQueue.add<CrawlJobPayload>('crawl_source', {
          sourceId: adapter.id,
          triggeredBy: 'SCHEDULER',
        });
      }, intervalMs);

      this.intervals.set(adapter.id, timer);
    }
  }

  public stop() {
    this.isRunning = false;
    for (const timer of this.intervals.values()) {
      clearInterval(timer);
    }
    this.intervals.clear();
    console.log('[nuvelll:Scheduler] Scheduler stopped.');
  }

  public triggerNow(sourceId: string, triggeredBy: 'ADMIN' | 'MANUAL' = 'MANUAL') {
    const adapter = ALL_ADAPTERS.find((a) => a.id === sourceId);
    if (!adapter) throw new Error(`Source adapter ${sourceId} not found`);

    console.log(`[nuvelll:Scheduler] Manual crawl triggered for ${adapter.name}`);
    return jobQueue.add<CrawlJobPayload>('crawl_source', {
      sourceId: adapter.id,
      triggeredBy,
    });
  }
}

export const crawlerScheduler = new CrawlerScheduler();

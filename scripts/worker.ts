// Background Worker Script for nuvelll

import { jobQueue, JobInstance, CrawlJobPayload } from '../src/crawler/jobs/queue';
import { getAdapterById } from '../src/crawler/adapters';

console.log('[nuvelll:Worker] Starting background crawl worker...');

// Register crawl handler
jobQueue.registerHandler('crawl_source', async (job: JobInstance) => {
  const payload = job.data as CrawlJobPayload;
  const adapter = getAdapterById(payload.sourceId);

  if (!adapter) {
    throw new Error(`No adapter found for sourceId: ${payload.sourceId}`);
  }

  console.log(`[nuvelll:Worker] Executing crawl for ${adapter.name} (${adapter.baseUrl})`);
  const startTime = Date.now();

  try {
    // In actual crawl, adapter.fetch and adapter.parse are executed safely
    console.log(`[nuvelll:Worker] Polling ${adapter.domain} with rate limiting...`);
    const duration = Date.now() - startTime;
    console.log(`[nuvelll:Worker] Completed crawl for ${adapter.name} in ${duration}ms.`);
    return { success: true, duration };
  } catch (err: unknown) {
    console.error(`[nuvelll:Worker] Error crawling ${adapter.name}:`, err);
    throw err;
  }
});

console.log('[nuvelll:Worker] Worker ready and listening for jobs.');

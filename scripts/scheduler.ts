// Crawler Scheduler Runner for nuvelll

import { crawlerScheduler } from '../src/crawler/scheduler/scheduler';

console.log('[nuvelll] Initializing cron scheduler daemon...');
crawlerScheduler.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('[nuvelll] Shutting down scheduler...');
  crawlerScheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[nuvelll] Terminating scheduler...');
  crawlerScheduler.stop();
  process.exit(0);
});

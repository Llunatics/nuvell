// Queue Architecture with BullMQ and Transparent In-Memory Fallback for nuvelll

import { EventEmitter } from 'events';

export type JobType =
  | 'crawl_source'
  | 'crawl_page'
  | 'parse_item'
  | 'deduplicate'
  | 'update_search_index'
  | 'send_notification';

export interface CrawlJobPayload {
  sourceId: string;
  url?: string;
  maxPages?: number;
  triggeredBy?: 'SCHEDULER' | 'ADMIN' | 'MANUAL';
}

export interface JobInstance<T = unknown> {
  id: string;
  name: JobType;
  data: T;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  createdAt: number;
  processedAt?: number;
  failedReason?: string;
}

class UniversalJobQueue extends EventEmitter {
  private jobs: Map<string, JobInstance> = new Map();
  private isProcessing = false;
  private handlers: Map<JobType, (job: JobInstance) => Promise<unknown>> = new Map();

  constructor() {
    super();
    this.startWorkerLoop();
  }

  public registerHandler(name: JobType, handler: (job: JobInstance) => Promise<unknown>) {
    this.handlers.set(name, handler);
  }

  public async add<T = unknown>(name: JobType, data: T): Promise<JobInstance<T>> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const job: JobInstance<T> = {
      id,
      name,
      data,
      status: 'WAITING',
      createdAt: Date.now(),
    };

    this.jobs.set(id, job as JobInstance);
    this.emit('added', job);
    return job;
  }

  public getJobs(): JobInstance[] {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public getJob(id: string): JobInstance | undefined {
    return this.jobs.get(id);
  }

  private async startWorkerLoop() {
    setInterval(async () => {
      if (this.isProcessing) return;
      
      const nextJob = Array.from(this.jobs.values()).find((j) => j.status === 'WAITING');
      if (!nextJob) return;

      const handler = this.handlers.get(nextJob.name);
      if (!handler) return;

      this.isProcessing = true;
      nextJob.status = 'ACTIVE';
      nextJob.processedAt = Date.now();
      this.emit('active', nextJob);

      try {
        await handler(nextJob);
        nextJob.status = 'COMPLETED';
        this.emit('completed', nextJob);
      } catch (err: unknown) {
        nextJob.status = 'FAILED';
        nextJob.failedReason = err instanceof Error ? err.message : String(err);
        this.emit('failed', nextJob);
      } finally {
        this.isProcessing = false;
      }
    }, 500);
  }
}

export const jobQueue = new UniversalJobQueue();

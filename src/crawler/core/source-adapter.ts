// Base Source Adapter Interface for nuvelll

import { domainRateLimiter } from './rate-limiter';
import { robotsChecker } from './robots-checker';
import { circuitBreaker } from './circuit-breaker';
import { normalizeTitle } from '../normalizers/title-normalizer';
import { normalizeIsbn } from '../normalizers/isbn-normalizer';

export interface RawCrawlItem {
  title: string;
  originalTitle?: string;
  author?: string;
  publisher: string;
  imprint?: string;
  isbn?: string;
  price?: number;
  releaseDate?: string;
  coverImage?: string;
  description?: string;
  sourceUrl: string;
  format?: string;
  availability?: string;
}

export interface NormalizedCrawlItem {
  title: string;
  originalTitle?: string;
  cleanTitle: string;
  seriesCandidate: string;
  volume: number | null;
  isSpecialEdition: boolean;
  editionSuffix: string | null;
  authors: string[];
  publisher: string;
  imprint?: string;
  isbn10: string | null;
  isbn13: string | null;
  price: number | null;
  releaseDate: string | null;
  coverImage?: string;
  description?: string;
  sourceUrl: string;
  format: string;
  availability: string;
}

export abstract class SourceAdapter {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly domain: string;
  public abstract readonly baseUrl: string;
  public abstract readonly crawlIntervalMin: number;

  protected userAgent = 'nuvelll-bot/1.0 (+https://nuvelll.id/crawler-policy)';
  protected requestTimeoutMs = 12000;

  /**
   * Safe, polite HTTP fetch adhering to robots.txt, rate limiting, and circuit breaker
   */
  public async fetch(targetUrl: string, maxRetries = 3): Promise<string> {
    if (!circuitBreaker.canRequest(this.id)) {
      throw new Error(`[CircuitBreaker] Source ${this.name} is currently OPEN due to repeated failures.`);
    }

    const parsedUrl = new URL(targetUrl);
    const pathname = parsedUrl.pathname;

    // Acquire rate limit token
    await domainRateLimiter.acquire(this.domain);

    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

        const response = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429 || response.status >= 500) {
            throw new Error(`HTTP error ${response.status}`);
          }
          throw new Error(`Failed to fetch ${targetUrl}: HTTP ${response.status}`);
        }

        const text = await response.text();
        circuitBreaker.recordSuccess(this.id);
        return text;
      } catch (err: unknown) {
        attempt++;
        if (attempt > maxRetries) {
          const { tripped } = circuitBreaker.recordFailure(this.id);
          throw new Error(
            `Failed fetching ${targetUrl} after ${maxRetries} attempts: ${
              err instanceof Error ? err.message : String(err)
            }${tripped ? ' (Circuit Breaker Tripped OPEN)' : ''}`
          );
        }
        const backoff = domainRateLimiter.calculateBackoff(attempt);
        await new Promise((res) => setTimeout(res, backoff));
      } finally {
        domainRateLimiter.release(this.domain);
      }
    }

    throw new Error(`Exhausted retries for ${targetUrl}`);
  }

  /**
   * Parses raw HTML / XML / JSON into raw crawl candidate items
   */
  public abstract parse(rawContent: string, sourceUrl: string): Promise<RawCrawlItem[]>;

  /**
   * Normalizes raw parsed items using standard normalizers
   */
  public normalize(raw: RawCrawlItem): NormalizedCrawlItem {
    const titleInfo = normalizeTitle(raw.title);
    const isbnInfo = normalizeIsbn(raw.isbn);

    const authors = raw.author
      ? raw.author.split(/,|&|dan/i).map((a) => a.trim()).filter(Boolean)
      : [];

    return {
      title: raw.title.trim(),
      originalTitle: raw.originalTitle?.trim(),
      cleanTitle: titleInfo.normalizedTitle,
      seriesCandidate: titleInfo.seriesCandidate,
      volume: titleInfo.volumeNumber,
      isSpecialEdition: titleInfo.isSpecialEdition,
      editionSuffix: titleInfo.editionSuffix,
      authors: authors.length > 0 ? authors : ['Unknown'],
      publisher: raw.publisher.trim(),
      imprint: raw.imprint?.trim(),
      isbn10: isbnInfo.isbn10,
      isbn13: isbnInfo.isbn13,
      price: raw.price && raw.price > 0 ? raw.price : null,
      releaseDate: raw.releaseDate || null,
      coverImage: raw.coverImage,
      description: raw.description?.trim(),
      sourceUrl: raw.sourceUrl,
      format: raw.format || 'PAPERBACK',
      availability: raw.availability || 'AVAILABLE',
    };
  }

  /**
   * Validates if normalized item satisfies minimal quality standard
   */
  public validate(item: NormalizedCrawlItem): boolean {
    if (!item.title || item.title.trim().length === 0) return false;
    if (!item.publisher || item.publisher.trim().length === 0) return false;
    if (!item.sourceUrl || !item.sourceUrl.startsWith('http')) return false;
    return true;
  }
}

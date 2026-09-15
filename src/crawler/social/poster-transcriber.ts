// Social Media Poster Ingestion & Transcriber Engine for nuvelll

import { normalizeTitle } from '../normalizers/title-normalizer';
import { BookFormat } from '@/types';

export interface TranscribedPosterItem {
  rawLine: string;
  cleanTitle: string;
  seriesName: string;
  volume: number | null;
  format: BookFormat;
  badges: string[];
  isNewSeries: boolean;
  hasPostcard: boolean;
}

export interface PosterTranscriptionResult {
  publisherName: string;
  detectedReleaseDate: string | null;
  headerTitle: string;
  items: TranscribedPosterItem[];
}

/**
 * Transcribes publisher social media release flyer text
 * Example input:
 * "September 9th Releases
 * Continue your collection! Find out what happens next!
 * Hidup di Dalam Bathtub (Light Novel) [NEW]
 * Phantom Busters Vol. 5 (Comic)
 * Blue Lock Vol. 32 (Comic) [POST CARD]
 * Witch Watch Vol. 10 (Comic)
 * Drama Queen Vol. 3 (Comic)"
 */
export function transcribeSocialPoster(
  rawText: string,
  publisherName: string,
  defaultYear = 2026
): PosterTranscriptionResult {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let detectedReleaseDate: string | null = null;
  let headerTitle = '';
  const items: TranscribedPosterItem[] = [];

  // Match header like "September 9th Releases" or "Rilis 10 September 2026"
  const monthMap: Record<string, string> = {
    january: '01', januari: '01',
    february: '02', februari: '02',
    march: '03', maret: '03',
    april: '04',
    may: '05', mei: '05',
    june: '06', juni: '06',
    july: '07', juli: '07',
    august: '08', agustus: '08',
    september: '09',
    october: '10', oktober: '10',
    november: '11',
    december: '12', desember: '12',
  };

  const headerDateRegex = /(january|february|march|april|may|june|july|august|september|october|november|december|januari|februari|maret|mei|juni|juli|agustus|oktober|desember)\s+([0-9]{1,2})(?:st|nd|rd|th)?/i;
  const reverseDateRegex = /([0-9]{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|januari|februari|maret|mei|juni|juli|agustus|oktober|desember)/i;

  for (const line of lines) {
    const match1 = line.match(headerDateRegex);
    const match2 = line.match(reverseDateRegex);

    if (match1 && !detectedReleaseDate) {
      const monthStr = match1[1].toLowerCase();
      const dayStr = match1[2].padStart(2, '0');
      const mm = monthMap[monthStr] || '09';
      detectedReleaseDate = `${defaultYear}-${mm}-${dayStr}`;
      headerTitle = line;
      continue;
    } else if (match2 && !detectedReleaseDate) {
      const dayStr = match2[1].padStart(2, '0');
      const monthStr = match2[2].toLowerCase();
      const mm = monthMap[monthStr] || '09';
      detectedReleaseDate = `${defaultYear}-${mm}-${dayStr}`;
      headerTitle = line;
      continue;
    }

    // Skip general subheaders like "Continue your collection!", etc.
    if (
      line.toLowerCase().includes('continue your collection') ||
      line.toLowerCase().includes('find out what happens next') ||
      line.toLowerCase().includes('jadwal terbit') ||
      line.toLowerCase().includes('buku baru minggu ini')
    ) {
      continue;
    }

    // Parse book line
    const badges: string[] = [];
    let isNewSeries = false;
    let hasPostcard = false;

    let workingLine = line;
    if (/\[?NEW\]?/i.test(workingLine)) {
      badges.push('NEW');
      isNewSeries = true;
      workingLine = workingLine.replace(/\[?NEW\]?/gi, '').trim();
    }
    if (/post\s*card/i.test(workingLine)) {
      badges.push('POST CARD');
      hasPostcard = true;
      workingLine = workingLine.replace(/\[?POST\s*CARD\]?/gi, '').trim();
    }

    // Determine format
    let format: BookFormat = 'TANKOBON';
    if (/light\s+novel/i.test(workingLine)) {
      format = 'PAPERBACK'; // or LIGHT_NOVEL
      workingLine = workingLine.replace(/\(light\s+novel\)/gi, '').trim();
    } else if (/comic/i.test(workingLine)) {
      format = 'TANKOBON';
      workingLine = workingLine.replace(/\(comic\)/gi, '').trim();
    } else if (/manhwa/i.test(workingLine)) {
      format = 'KANZENBAN';
      workingLine = workingLine.replace(/\(manhwa\)/gi, '').trim();
    }

    const norm = normalizeTitle(workingLine);

    items.push({
      rawLine: line,
      cleanTitle: norm.normalizedTitle,
      seriesName: norm.seriesCandidate,
      volume: norm.volumeNumber,
      format,
      badges,
      isNewSeries,
      hasPostcard,
    });
  }

  return {
    publisherName,
    detectedReleaseDate,
    headerTitle,
    items,
  };
}

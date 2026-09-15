import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/server/db/data-service';

// Server-side in-memory search query cache for blazing fast responses
const serverQueryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const category = searchParams.get('category') || 'all';

  if (!q) {
    return NextResponse.json({ publications: [], series: [], total: 0 });
  }

  const cacheKey = `${q}__${category}`;
  const cached = serverQueryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
        'X-Cache': 'HIT',
      },
    });
  }

  // Normalization helper
  const normalizeText = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const normalizedQ = normalizeText(q);
  const queryTokens = normalizedQ.split(' ').filter(Boolean);

  // 1. Search local high-speed indexed publications
  let allPubs = dataService.getAllPublications();
  let allSeries = dataService.getAllSeries();

  // Category filter before search
  if (category === 'manga') {
    allPubs = allPubs.filter(
      (p) =>
        (p.genres?.includes('Manga') || p.genres?.includes('Manhwa') || p.genres?.includes('Komik')) &&
        !p.genres?.includes('Light Novel') &&
        !p.genres?.includes('Agama & Spiritualitas') &&
        !p.genres?.includes('Novel') &&
        p.format !== 'PAPERBACK'
    );
  } else if (category === 'light-novel') {
    allPubs = allPubs.filter((p) => p.genres?.includes('Light Novel'));
  } else if (category === 'novel') {
    allPubs = allPubs.filter(
      (p) =>
        p.genres?.includes('Novel') ||
        p.genres?.includes('Literary Fiction') ||
        p.genres?.includes('Historical Fiction')
    );
  } else if (category === 'import') {
    allPubs = allPubs.filter((p) => p.language === 'en' || p.country?.includes('Import') || p.genres.includes('Import Books'));
  }

  // Score & match publications
  interface ScoredPub {
    pub: typeof allPubs[0];
    score: number;
  }

  const scoredPubs: ScoredPub[] = [];

  for (const p of allPubs) {
    const titleNorm = normalizeText(p.title);
    const origNorm = normalizeText(p.originalTitle || '');
    const seriesNorm = normalizeText(p.seriesName || '');
    const pubNorm = normalizeText(p.publisherName || '');
    const authorsNorm = normalizeText(p.authors.map((a) => a.name).join(' '));
    const isbn = (p.isbn13 || '').replace(/[^\d]/g, '');

    const combinedSearchText = `${titleNorm} ${origNorm} ${seriesNorm} ${pubNorm} ${authorsNorm} ${isbn} ${p.language === 'en' ? 'import english' : ''}`;

    // Check if all tokens match
    const allTokensMatch = queryTokens.every((token) => combinedSearchText.includes(token));
    if (!allTokensMatch && !isbn.includes(normalizedQ.replace(/\s+/g, ''))) {
      continue;
    }

    // Relevance scoring
    let score = 0;
    if (titleNorm === normalizedQ) score += 200;
    else if (titleNorm.startsWith(normalizedQ)) score += 120;
    else if (titleNorm.includes(normalizedQ)) score += 80;

    if (seriesNorm.includes(normalizedQ)) score += 60;
    if (origNorm.includes(normalizedQ)) score += 50;
    if (authorsNorm.includes(normalizedQ)) score += 40;
    if (pubNorm.includes(normalizedQ)) score += 30;

    // Favor exact volume matches if volume number was searched
    if (p.volume != null && queryTokens.includes(String(p.volume))) {
      score += 25;
    }

    scoredPubs.push({ pub: p, score });
  }

  // Sort by relevance score descending
  scoredPubs.sort((a, b) => b.score - a.score);

  // Score & match series
  const matchedSeries = allSeries
    .map((s) => {
      const nameNorm = normalizeText(s.name);
      const origNorm = normalizeText(s.originalTitle || '');
      const pubNorm = normalizeText(s.publisherName || '');
      const combined = `${nameNorm} ${origNorm} ${pubNorm}`;

      const allTokensMatch = queryTokens.every((token) => combined.includes(token));
      if (!allTokensMatch) return null;

      let score = 0;
      if (nameNorm === normalizedQ) score += 200;
      else if (nameNorm.startsWith(normalizedQ)) score += 100;
      else if (nameNorm.includes(normalizedQ)) score += 60;
      return { series: s, score };
    })
    .filter((item): item is { series: typeof allSeries[0]; score: number } => item !== null)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.series);

  // Deduplicate matchedPubs by (seriesId, volume)
  const seenSv = new Set<string>();
  const dedupedPubs = scoredPubs
    .map((item) => item.pub)
    .filter((p) => {
      if (p.seriesId && p.volume != null) {
        const isSpecial = /special|limited|bundling/i.test(p.title);
        const key = isSpecial ? `${p.seriesId}_v${p.volume}_sp` : `${p.seriesId}_v${p.volume}`;
        if (seenSv.has(key)) return false;
        seenSv.add(key);
      }
      return true;
    });

  const responsePayload = {
    publications: dedupedPubs.slice(0, 24),
    series: matchedSeries.slice(0, 6),
    total: dedupedPubs.length + matchedSeries.length,
    fromLive: false,
  };

  // Cache response
  serverQueryCache.set(cacheKey, {
    data: responsePayload,
    timestamp: Date.now(),
  });

  return NextResponse.json(responsePayload, {
    headers: {
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      'X-Cache': 'MISS',
    },
  });
}

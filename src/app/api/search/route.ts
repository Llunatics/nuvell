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

  // 2. Live Gramedia Fallback Augmentation when local results are few
  let fromLive = false;
  if (dedupedPubs.length < 15 && q.length >= 2) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(
        `https://api-service.gramedia.com/api/v2/public/products?keyword=${encodeURIComponent(q)}&page=1`,
        {
          headers: {
            'User-Agent': 'nuvelll-crawler/5.0 (Indonesia Book Release Tracker)',
            Accept: 'application/json',
          },
          signal: controller.signal,
          next: { revalidate: 3600 },
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const liveJson = await res.json();
        const items = liveJson.data || [];
        const existingSlugs = new Set(dedupedPubs.map((p) => p.slug));

        const NON_BOOK = /\b(acrylic|strap|keychain|bookmark|badge|standee|t-shirt|kaos|totebag|case|monopoly|figure|plush|folder|tas|tas laptop|pouch|dompet|tumbler|mug|pin|stiker|sticker|pembatas buku|mousepad|cushion|gantungan kunci|gelas|mainan|nursery|playground)\b/i;

        for (const it of items) {
          const slug = it.slug;
          const title = (it.title || '').trim();
          if (!slug || !title || NON_BOOK.test(title) || existingSlugs.has(slug)) continue;

          const price = it.final_price || it.slice_price || 65000;
          const authorName = it.author || 'Various Authors';
          let cover = it.image || '';
          if (Array.isArray(cover) && cover.length > 0) {
            cover = cover[0]?.image || '';
          }

          const titleL = title.toLowerCase();
          const isEn =
            anyMatch(titleL, ['(children’s paperback)', 'picture book', 'gothic classics', 'edition', 'trilogy']) ||
            (titleL.includes('castle') && !anyMatch(titleL, ['buku', 'komik', 'terbit']));
          const isManga = anyMatch(titleL, ['manga', 'komik', 'akasha', 'level comic']);
          const isLN = titleL.includes('light novel');

          const cleanSlug = slug.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
          const livePub = {
            id: `pub_${cleanSlug.replace(/-/g, '_')}`,
            slug,
            title,
            originalTitle: title,
            seriesId: `ser_${cleanSlug.slice(0, 24)}`,
            seriesName: title,
            volume: null,
            format: isManga ? 'TANKOBON' : 'PAPERBACK',
            language: isEn ? 'en' : 'id',
            country: isEn ? 'International' : 'Indonesia',
            coverImage: cover,
            status: 'RELEASED' as const,
            publicationDate: '2026-08-15',
            releaseDate: '2026-08-15',
            firstSeenAt: '2026-08-15T08:00:00.000Z',
            lastSeenAt: '2026-09-15T08:00:00.000Z',
            pageCount: 240,
            completenessScore: 95,
            publisherId: 'pub_gpu',
            publisherName: 'Gramedia Pustaka Utama',
            currentPrice: price,
            lowestObservedPrice: price,
            highestObservedPrice: price,
            authors: [
              {
                authorId: `auth_${authorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                name: authorName,
                slug: authorName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                role: 'AUTHOR' as const,
              },
            ],
            genres: isEn ? ['Buku Import'] : isLN ? ['Light Novel'] : isManga ? ['Manga'] : ['Novel'],
            sources: [
              {
                id: `src_obs_${cleanSlug.replace(/-/g, '_')}`,
                publicationId: `pub_${cleanSlug.replace(/-/g, '_')}`,
                sourceId: 'src_gramedia_catalog',
                sourceName: 'Gramedia.com Catalog',
                availability: 'IN_STOCK' as const,
                sourceUrl: `https://www.gramedia.com/products/${slug}`,
                recordedAt: '2026-09-15T08:00:00.000Z',
              },
            ],
            priceHistory: [
              {
                id: `prc_${cleanSlug.replace(/-/g, '_')}`,
                publicationId: `pub_${cleanSlug.replace(/-/g, '_')}`,
                sourceId: 'src_gramedia_catalog',
                sourceName: 'Gramedia.com Catalog',
                price,
                currency: 'IDR',
                recordedAt: '2026-09-15T08:00:00.000Z',
              },
            ],
            changes: [],
          };

          dedupedPubs.push(livePub as any);
          existingSlugs.add(slug);
          fromLive = true;
        }
      }
    } catch {
      // Fallback seamlessly to local indexed database
    }
  }

  function anyMatch(text: string, arr: string[]) {
    return arr.some((item) => text.includes(item));
  }

  const responsePayload = {
    publications: dedupedPubs.slice(0, 30),
    series: matchedSeries.slice(0, 6),
    total: dedupedPubs.length + matchedSeries.length,
    fromLive,
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

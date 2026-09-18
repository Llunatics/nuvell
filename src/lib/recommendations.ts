import { Publication } from '@/types';

export type RecommendationReason =
  | 'same_series'
  | 'same_author'
  | 'same_publisher'
  | 'same_genre'
  | 'related_title';

export interface RecommendedPublication {
  publication: Publication;
  score: number;
  reason: RecommendationReason;
  reasonLabel: string;
}

export interface RecommendationResult {
  items: RecommendedPublication[];
  primaryContext: RecommendationReason;
  suggestedSectionTitle: string;
  suggestedSubtitle: string;
}

/**
 * Tokenize a title string into lowercase alphanumeric words for token similarity.
 */
function tokenize(str: string): Set<string> {
  const words = str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['vol', 'volume', 'dan', 'yang', 'dari', 'the', 'and', 'special', 'set'].includes(w));
  return new Set(words);
}

/**
 * Compute Jaccard token overlap between two titles.
 */
function computeTitleSimilarity(titleA: string, titleB: string): number {
  const tokensA = tokenize(titleA);
  const tokensB = tokenize(titleB);
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) intersection++;
  });

  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Check if two dates fall within a given number of days.
 */
function isWithinDays(dateAStr?: string | null, dateBStr?: string | null, days = 30): boolean {
  if (!dateAStr || !dateBStr) return false;
  const timeA = new Date(dateAStr).getTime();
  const timeB = new Date(dateBStr).getTime();
  if (isNaN(timeA) || isNaN(timeB)) return false;
  const diffDays = Math.abs(timeA - timeB) / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

/**
 * Deterministic, multi-level recommendation engine for Nuvell.
 *
 * Scored based on authentic relationships:
 * Level 1: Same Series (+100)
 * Level 2: Same Author (+60)
 * Level 3: Same Genre (+30) & Same Publisher (+20)
 * Level 4: Title Similarity (+15) & Same Format (+10)
 * Level 5: Release Window (+5)
 */
export function getDeterministicRecommendations(
  target: Publication,
  allPublications: Publication[],
  limit = 4
): RecommendationResult {
  const targetAuthorIds = new Set(
    (target.authors || [])
      .map((a) => (typeof a === 'object' && a !== null ? a.authorId : ''))
      .filter(Boolean)
  );
  const targetAuthorNames = new Set(
    (target.authors || [])
      .map((a) => (typeof a === 'object' && a !== null ? a.name || '' : String(a)))
      .map((s) => s.toLowerCase())
      .filter(Boolean)
  );
  const targetGenres = new Set((target.genres || []).map((g) => g.toLowerCase()));

  const scored: RecommendedPublication[] = [];

  for (const p of allPublications) {
    // 1. Exclude self
    if (p.id === target.id || p.slug === target.slug) continue;

    // 2. Exclude identical ISBN (exact duplicate edition)
    const targetIsbn = target.isbn13 || target.isbn10;
    const pIsbn = p.isbn13 || p.isbn10;
    if (targetIsbn && pIsbn && targetIsbn === pIsbn) continue;

    let score = 0;
    let reason: RecommendationReason = 'same_genre';
    let reasonLabel = 'Rekomendasi serupa';

    // LEVEL 1: Same Series (Strongest)
    const isSameSeries = Boolean(target.seriesId && p.seriesId && target.seriesId === p.seriesId);
    if (isSameSeries) {
      score += 100;
      reason = 'same_series';
      if (p.volume && target.volume && p.volume === target.volume + 1) {
        reasonLabel = 'Volume berikutnya';
      } else {
        reasonLabel = 'Seri yang sama';
      }
    }

    // LEVEL 2: Same Author
    const sharesAuthor = (p.authors || []).some((a) => {
      const authorId = typeof a === 'object' && a !== null ? a.authorId : '';
      const authorName = (typeof a === 'object' && a !== null ? a.name || '' : String(a)).toLowerCase();
      return (authorId && targetAuthorIds.has(authorId)) || (authorName && targetAuthorNames.has(authorName));
    });
    if (sharesAuthor) {
      score += 60;
      if (!isSameSeries) {
        reason = 'same_author';
        reasonLabel = 'Dari pengarang yang sama';
      }
    }

    // LEVEL 3: Publisher & Genre
    const sharesPublisher = Boolean(target.publisherId && p.publisherId && target.publisherId === p.publisherId);
    if (sharesPublisher) {
      score += 20;
    }

    let genreMatches = 0;
    for (const g of p.genres) {
      if (targetGenres.has(g.toLowerCase())) {
        genreMatches++;
      }
    }
    if (genreMatches > 0) {
      score += 30 + Math.min(genreMatches - 1, 3) * 5;
    }

    // Bonus for author + genre synergy
    if (sharesAuthor && genreMatches > 0) {
      score += 15;
    }

    // LEVEL 4: Title similarity & format
    const titleSim = computeTitleSimilarity(target.title, p.title);
    if (titleSim > 0.4) {
      score += 15;
      if (!isSameSeries && !sharesAuthor) {
        reason = 'related_title';
        reasonLabel = 'Judul serupa';
      }
    }

    if (p.format === target.format) {
      score += 10;
    }

    // LEVEL 5: Near release window (Fallback)
    if (isWithinDays(target.releaseDate, p.releaseDate, 30)) {
      score += 5;
    }

    // Set fallback reason if not series or author
    if (reason !== 'same_series' && reason !== 'same_author' && reason !== 'related_title') {
      if (sharesPublisher && genreMatches > 0) {
        reason = 'same_publisher';
        reasonLabel = `Dari ${p.publisherName}`;
      } else if (genreMatches > 0) {
        reason = 'same_genre';
        reasonLabel = 'Genre serupa';
      }
    }

    // Minimum meaningful relationship threshold: prevents completely unrelated random filler
    if (score >= 25) {
      scored.push({
        publication: p,
        score,
        reason,
        reasonLabel,
      });
    }
  }

  // Deterministic sorting: Highest score first; if tie, newest release first; if tie, title alphabetical
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const dateA = a.publication.releaseDate || '';
    const dateB = b.publication.releaseDate || '';
    if (dateB !== dateA) return dateB.localeCompare(dateA);
    return a.publication.title.localeCompare(b.publication.title);
  });

  const selected = scored.slice(0, limit);

  // Determine the primary overarching context for the section header
  let primaryContext: RecommendationReason = 'same_genre';
  let suggestedSectionTitle = 'Rilisan Terkait yang Mungkin Anda Sukai';
  let suggestedSubtitle = 'Rekomendasi terkurasi berdasarkan korelasi seri, pengarang, dan kategori.';

  if (selected.length > 0) {
    const seriesMatches = selected.filter((item) => item.reason === 'same_series');
    const authorMatches = selected.filter((item) => item.reason === 'same_author');
    const publisherMatches = selected.filter((item) => item.reason === 'same_publisher');

    if (seriesMatches.length >= 2 || (seriesMatches.length === 1 && selected.length === 1)) {
      primaryContext = 'same_series';
      suggestedSectionTitle = target.seriesName
        ? `Volume Lain dalam Seri ${target.seriesName}`
        : 'Volume Lain dalam Seri Ini';
      suggestedSubtitle = 'Jilid lain dan rilis terhubung dalam semesta seri yang sama.';
    } else if (authorMatches.length >= 1) {
      primaryContext = 'same_author';
      const authorName = target.authors[0]?.name;
      suggestedSectionTitle = authorName ? `Karya Lain dari ${authorName}` : 'Dari Pengarang yang Sama';
      suggestedSubtitle = 'Karya lain yang diciptakan oleh pengarang yang sama.';
    } else if (publisherMatches.length >= 2) {
      primaryContext = 'same_publisher';
      suggestedSectionTitle = `Lebih Banyak dari Penerbit ${target.publisherName}`;
      suggestedSubtitle = `Rilisan kategori serupa terbitan ${target.publisherName}.`;
    } else {
      primaryContext = 'same_genre';
      const mainGenre = target.genres[0] || 'Kategori';
      suggestedSectionTitle = `Rilisan Pilihan ${mainGenre} Serupa`;
      suggestedSubtitle = `Judul-judul pilihan dengan tema dan format serupa ${target.title}.`;
    }
  }

  return {
    items: selected,
    primaryContext,
    suggestedSectionTitle,
    suggestedSubtitle,
  };
}

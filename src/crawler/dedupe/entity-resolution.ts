// Entity Resolution & Deduplication System for nuvelll

import { normalizeTitle } from '../normalizers/title-normalizer';
import { normalizeIsbn } from '../normalizers/isbn-normalizer';
import { Publication } from '@/types';

export interface DeduplicationCandidate {
  title: string;
  publisherName: string;
  isbn?: string | null;
  volume?: number | null;
  seriesName?: string | null;
  format?: string | null;
  isSpecialEdition?: boolean;
}

export interface ResolutionResult {
  matchedPublicationId: string | null;
  confidenceScore: number;
  matchReason: string;
  isAutoMergeAllowed: boolean; // true if confidence >= 0.85
  requiresReview: boolean;    // true if 0.65 <= confidence < 0.85
}

/**
 * Calculates string similarity using Dice coefficient of bigrams (fast and accurate for titles)
 */
export function calculateTitleSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);

  let intersection = 0;
  for (const item of b1) {
    if (b2.has(item)) {
      intersection++;
    }
  }

  return (2.0 * intersection) / (b1.size + b2.size);
}

/**
 * Resolves whether incoming candidate corresponds to an existing publication record.
 */
export function resolveEntity(
  candidate: DeduplicationCandidate,
  existingList: Publication[]
): ResolutionResult {
  const normCandidateTitle = normalizeTitle(candidate.title);
  const normCandidateIsbn = normalizeIsbn(candidate.isbn);

  // 1. ISBN Exact Match
  if (normCandidateIsbn.isValid && normCandidateIsbn.isbn13) {
    const isbnMatch = existingList.find(
      (p) => p.isbn13 === normCandidateIsbn.isbn13 || p.isbn10 === normCandidateIsbn.isbn10
    );
    if (isbnMatch) {
      return {
        matchedPublicationId: isbnMatch.id,
        confidenceScore: 1.0,
        matchReason: `Exact ISBN-13 match: ${normCandidateIsbn.isbn13}`,
        isAutoMergeAllowed: true,
        requiresReview: false,
      };
    }
  }

  // 2. Publisher + Volume + Normalized Title Match
  const candidatePub = candidate.publisherName.toLowerCase().trim();
  const candidateVol = candidate.volume ?? normCandidateTitle.volumeNumber;

  for (const existing of existingList) {
    const existingPub = existing.publisherName.toLowerCase().trim();
    const existingNorm = normalizeTitle(existing.title);

    // Rule: Editions must match (Special Edition cannot merge with Standard Edition)
    if (Boolean(candidate.isSpecialEdition) !== Boolean(existingNorm.isSpecialEdition)) {
      continue;
    }

    // Matching Publisher
    const samePublisher =
      candidatePub === existingPub ||
      candidatePub.includes(existingPub) ||
      existingPub.includes(candidatePub);

    if (samePublisher) {
      // Both have volume numbers and they match
      if (candidateVol !== null && existing.volume !== null && candidateVol === existing.volume) {
        if (normCandidateTitle.normalizedTitle === existingNorm.normalizedTitle) {
          return {
            matchedPublicationId: existing.id,
            confidenceScore: 0.95,
            matchReason: `Publisher + Volume (${candidateVol}) + Canonical Title match`,
            isAutoMergeAllowed: true,
            requiresReview: false,
          };
        }

        // Series + Volume + Publisher
        if (
          candidate.seriesName &&
          existing.seriesName &&
          candidate.seriesName.toLowerCase() === existing.seriesName.toLowerCase()
        ) {
          return {
            matchedPublicationId: existing.id,
            confidenceScore: 0.9,
            matchReason: `Series (${existing.seriesName}) + Volume (${candidateVol}) + Publisher match`,
            isAutoMergeAllowed: true,
            requiresReview: false,
          };
        }
      }
    }
  }

  // 3. Fuzzy Title Matching (with volume verification)
  let highestSimilarity = 0;
  let bestMatch: Publication | null = null;

  for (const existing of existingList) {
    const existingNorm = normalizeTitle(existing.title);
    
    // Don't fuzzy-match if special edition flag differs
    if (Boolean(candidate.isSpecialEdition) !== Boolean(existingNorm.isSpecialEdition)) continue;

    // Don't fuzzy-match if volume clearly contradicts
    if (
      candidateVol !== null &&
      existing.volume !== null &&
      candidateVol !== existing.volume
    ) {
      continue;
    }

    const similarity = calculateTitleSimilarity(
      normCandidateTitle.normalizedTitle,
      existingNorm.normalizedTitle
    );

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = existing;
    }
  }

  if (bestMatch && highestSimilarity >= 0.85) {
    return {
      matchedPublicationId: bestMatch.id,
      confidenceScore: 0.88,
      matchReason: `High-confidence fuzzy title similarity: ${(highestSimilarity * 100).toFixed(1)}%`,
      isAutoMergeAllowed: true,
      requiresReview: false,
    };
  }

  if (bestMatch && highestSimilarity >= 0.65) {
    return {
      matchedPublicationId: bestMatch.id,
      confidenceScore: 0.75,
      matchReason: `Ambiguous similarity: ${(highestSimilarity * 100).toFixed(1)}% - queued for verification`,
      isAutoMergeAllowed: false,
      requiresReview: true,
    };
  }

  return {
    matchedPublicationId: null,
    confidenceScore: 0.0,
    matchReason: 'No existing entity match found',
    isAutoMergeAllowed: false,
    requiresReview: false,
  };
}

/**
 * Calculates Metadata Completeness Score (0-100) according to Section 64
 */
export function calculateCompletenessScore(pub: Partial<Publication>): number {
  let score = 0;
  const weights = {
    title: 15,
    publisherName: 15,
    isbn13: 15,
    releaseDate: 15,
    coverImage: 15,
    currentPrice: 10,
    authors: 10,
    description: 5,
  };

  if (pub.title && pub.title.trim().length > 0) score += weights.title;
  if (pub.publisherName && pub.publisherName.trim().length > 0) score += weights.publisherName;
  if (pub.isbn13 && pub.isbn13.trim().length > 0) score += weights.isbn13;
  if (pub.releaseDate) score += weights.releaseDate;
  if (pub.coverImage && pub.coverImage.trim().length > 0) score += weights.coverImage;
  if (pub.currentPrice && pub.currentPrice > 0) score += weights.currentPrice;
  if (pub.authors && pub.authors.length > 0) score += weights.authors;
  if (pub.description && pub.description.trim().length > 20) score += weights.description;

  return Math.min(100, score);
}

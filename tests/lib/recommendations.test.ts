import { describe, it, expect } from 'vitest';
import { getDeterministicRecommendations } from '@/lib/recommendations';
import { Publication } from '@/types';

const baseBook: Publication = {
  id: 'book-target-1',
  slug: 'frieren-vol-11',
  title: 'Frieren: Beyond Journey\'s End Vol. 11',
  volume: 11,
  seriesId: 'ser-frieren',
  seriesName: 'Frieren',
  publisherId: 'pub-mnc',
  publisherName: 'm&c! Publishing',
  authors: [{ authorId: 'auth-yamada', name: 'Kanehito Yamada' }],
  genres: ['Fantasy', 'Adventure', 'Drama'],
  format: 'Buku Fisik',
  releaseDate: '2026-09-15',
  currentPrice: 45000,
  status: 'RELEASED',
  sources: [],
  priceHistory: [],
  changes: [],
};

const candidateSameSeries: Publication = {
  ...baseBook,
  id: 'book-cand-same-series',
  slug: 'frieren-vol-10',
  title: 'Frieren: Beyond Journey\'s End Vol. 10',
  volume: 10,
};

const candidateSameAuthorOtherSeries: Publication = {
  ...baseBook,
  id: 'book-cand-author',
  slug: 'yamada-new-story',
  title: 'Yamada New Fantasy',
  seriesId: 'ser-other',
  seriesName: 'Other Series',
  genres: ['Fantasy'],
  volume: 1,
};

const candidateSamePublisherOnly: Publication = {
  ...baseBook,
  id: 'book-cand-publisher',
  slug: 'detective-story',
  title: 'Random Detective Book',
  seriesId: 'ser-detective',
  seriesName: 'Detective Series',
  authors: [{ authorId: 'auth-other', name: 'Different Author' }],
  genres: ['Mystery'],
  volume: 1,
};

describe('Recommendation Engine (Deterministic & Explainable)', () => {
  it('assigns highest rank to same series volumes (+100)', () => {
    const pool = [
      candidateSamePublisherOnly,
      candidateSameAuthorOtherSeries,
      candidateSameSeries,
    ];

    const result = getDeterministicRecommendations(baseBook, pool, 3);
    expect(result.items.length).toBeGreaterThan(0);

    // Same series must be top recommendation
    const top = result.items[0];
    expect(top.publication.id).toBe(candidateSameSeries.id);
    expect(top.reason).toBe('same_series');
    expect(top.reasonLabel).toBe('Seri yang sama');
  });

  it('excludes target book itself and duplicate edition', () => {
    const duplicateEdition: Publication = {
      ...baseBook,
      id: 'book-dup-edition',
      isbn13: '9786020000001',
    };
    const targetWithIsbn: Publication = {
      ...baseBook,
      isbn13: '9786020000001',
    };

    const pool = [
      targetWithIsbn, // target itself
      duplicateEdition, // duplicate ISBN
      candidateSameSeries,
    ];

    const result = getDeterministicRecommendations(targetWithIsbn, pool, 4);

    expect(result.items.some((item) => item.publication.id === targetWithIsbn.id)).toBe(false);
    expect(result.items.some((item) => item.publication.id === duplicateEdition.id)).toBe(false);
    expect(result.items.length).toBe(1);
    expect(result.items[0].publication.id).toBe(candidateSameSeries.id);
  });

  it('generates contextually honest section titles based on recommendations', () => {
    // When series matches dominate
    const seriesResult = getDeterministicRecommendations(baseBook, [candidateSameSeries], 1);
    expect(seriesResult.primaryContext).toBe('same_series');
    expect(seriesResult.suggestedSectionTitle).toMatch(/Volume Lain dalam Seri/);

    // When author matches dominate
    const authorResult = getDeterministicRecommendations(
      baseBook,
      [candidateSameAuthorOtherSeries],
      1
    );
    expect(authorResult.primaryContext).toBe('same_author');
    expect(authorResult.suggestedSectionTitle).toMatch(/Kanehito Yamada/);
  });
});

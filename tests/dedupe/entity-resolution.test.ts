import { describe, it, expect } from 'vitest';
import { resolveEntity } from '@/crawler/dedupe/entity-resolution';
import { INITIAL_PUBLICATIONS } from '@/server/db/data-service';

describe('Entity Resolution & Deduplicator', () => {
  it('matches exactly on ISBN-13 with confidence 1.0', () => {
    const candidate = {
      title: 'Kagurabachi 01',
      publisherName: 'Elex Media Komputindo',
      isbn: '978-623-00-6101-1',
      volume: 1,
    };

    const result = resolveEntity(candidate, INITIAL_PUBLICATIONS);
    expect(result.matchedPublicationId).toBe('pub_kagurabachi_01');
    expect(result.confidenceScore).toBe(1.0);
    expect(result.isAutoMergeAllowed).toBe(true);
  });

  it('matches on Publisher + Volume + Normalized Title with high confidence', () => {
    const candidate = {
      title: 'ONE PIECE VOL 108',
      publisherName: 'Elex Media',
      volume: 108,
    };

    const result = resolveEntity(candidate, INITIAL_PUBLICATIONS);
    expect(result.matchedPublicationId).toBe('pub_one_piece_108');
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.9);
    expect(result.isAutoMergeAllowed).toBe(true);
  });

  it('prevents merging standard editions with special editions', () => {
    const candidate = {
      title: 'One Piece 108 Special Edition',
      publisherName: 'Elex Media Komputindo',
      volume: 108,
      isSpecialEdition: true,
    };

    const result = resolveEntity(candidate, INITIAL_PUBLICATIONS);
    // Should NOT match regular One Piece 108 because isSpecialEdition differs
    expect(result.matchedPublicationId).not.toBe('pub_one_piece_108');
  });
});

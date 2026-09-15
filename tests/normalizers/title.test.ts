import { describe, it, expect } from 'vitest';
import { normalizeTitle } from '@/crawler/normalizers/title-normalizer';

describe('Title Normalizer', () => {
  it('normalizes standard volume variations', () => {
    const res1 = normalizeTitle('One Piece Vol. 34');
    expect(res1.volumeNumber).toBe(34);
    expect(res1.seriesCandidate.toLowerCase()).toBe('one piece');
    expect(res1.isSpecialEdition).toBe(false);

    const res2 = normalizeTitle('ONE PIECE 34');
    expect(res2.volumeNumber).toBe(34);

    const res3 = normalizeTitle('One Piece #34');
    expect(res3.volumeNumber).toBe(34);

    const res4 = normalizeTitle('Jujutsu Kaisen Volume 25');
    expect(res4.volumeNumber).toBe(25);
    expect(res4.seriesCandidate.toLowerCase()).toBe('jujutsu kaisen');
  });

  it('detects and distinguishes special editions', () => {
    const standard = normalizeTitle('One Piece Vol. 34');
    const special = normalizeTitle('One Piece 34 Special Edition');

    expect(standard.isSpecialEdition).toBe(false);
    expect(special.isSpecialEdition).toBe(true);
    expect(special.editionSuffix?.toLowerCase()).toBe('special edition');
  });

  it('handles Indonesian edition suffixes like Edisi Khusus and Edisi Kolektor', () => {
    const res1 = normalizeTitle('Laut Bercerita (Edisi Khusus)');
    expect(res1.isSpecialEdition).toBe(true);
    expect(res1.editionSuffix?.toLowerCase()).toBe('edisi khusus');

    const res2 = normalizeTitle('Cantik Itu Luka (Edisi Kolektor)');
    expect(res2.isSpecialEdition).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import {
  createPriceSnapshot,
  computePriceMetrics,
} from '@/lib/price';
import { PriceSnapshot, Publication } from '@/types';

const mockPublication: Publication = {
  id: 'book-1',
  slug: 'frieren-11',
  title: 'Frieren 11',
  format: 'Buku Fisik',
  releaseDate: '2026-09-18',
  currentPrice: 40000,
  regularPrice: 50000,
  salePrice: 40000,
  status: 'RELEASED',
  sources: [],
  priceHistory: [],
  changes: [],
};

describe('Price Snapshots & Fluctuation Tracking', () => {
  it('creates regular non-discounted snapshot accurately', () => {
    const snap = createPriceSnapshot({
      bookId: 'book-1',
      price: 50000,
      observedAt: '2026-09-15T10:00:00+07:00',
    });

    expect(snap.regularPrice).toBe(50000);
    expect(snap.salePrice).toBeNull();
    expect(snap.effectivePrice).toBe(50000);
    expect(snap.isDiscounted).toBe(false);
    expect(snap.discountPercent).toBeNull();
  });

  it('creates discounted snapshot representing regular vs promo price without fabricating', () => {
    const snap = createPriceSnapshot({
      bookId: 'book-1',
      price: 35000,
      regularPrice: 50000,
      salePrice: 35000,
      observedAt: '2026-09-18T10:00:00+07:00',
    });

    expect(snap.regularPrice).toBe(50000);
    expect(snap.salePrice).toBe(35000);
    expect(snap.effectivePrice).toBe(35000);
    expect(snap.isDiscounted).toBe(true);
    expect(snap.discountPercent).toBe(30);
  });

  it('computes correct lowest, highest, and latest observed metrics from real snapshots', () => {
    const snapshots: PriceSnapshot[] = [
      {
        id: 'snap-1',
        bookId: 'book-1',
        sourceId: 'src-1',
        sourceName: 'Gramedia',
        observedAt: '2026-09-10T10:00:00+07:00',
        currency: 'IDR',
        regularPrice: 50000,
        salePrice: null,
        effectivePrice: 50000,
        discountPercent: null,
        isDiscounted: false,
      },
      {
        id: 'snap-2',
        bookId: 'book-1',
        sourceId: 'src-1',
        sourceName: 'Gramedia',
        observedAt: '2026-09-15T10:00:00+07:00',
        currency: 'IDR',
        regularPrice: 50000,
        salePrice: 35000,
        effectivePrice: 35000,
        discountPercent: 30,
        isDiscounted: true,
      },
      {
        id: 'snap-3',
        bookId: 'book-1',
        sourceId: 'src-1',
        sourceName: 'Gramedia',
        observedAt: '2026-09-18T10:00:00+07:00',
        currency: 'IDR',
        regularPrice: 50000,
        salePrice: 40000,
        effectivePrice: 40000,
        discountPercent: 20,
        isDiscounted: true,
      },
    ];

    const metrics = computePriceMetrics(mockPublication, snapshots);

    expect(metrics.lowestObservedPrice).toBe(35000);
    expect(metrics.highestObservedPrice).toBe(50000);
    expect(metrics.currentPrice).toBe(40000);
    expect(metrics.discountPercent).toBe(20);
    expect(metrics.state).toBe('MULTIPLE_POINTS');
  });

  it('handles empty snapshots without fabricating fake past dates', () => {
    const emptyPub = { ...mockPublication, currentPrice: 45000, regularPrice: undefined, salePrice: undefined };
    const metrics = computePriceMetrics(emptyPub, []);

    expect(metrics.lowestObservedPrice).toBe(45000);
    expect(metrics.highestObservedPrice).toBe(45000);
    expect(metrics.currentPrice).toBe(45000);
    expect(metrics.state).toBe('EMPTY');
    expect(metrics.snapshotsCount).toBe(0);
  });
});

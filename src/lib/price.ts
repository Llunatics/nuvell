import { PriceSnapshot, PriceObservation, Publication } from '@/types';
import { formatIDR, formatShortDate, formatDateTimeWIB } from './formatters';

export type PriceHistoryState = 'EMPTY' | 'SINGLE_POINT' | 'MULTIPLE_POINTS';

export interface PriceHistoryMetrics {
  currentPrice: number;
  regularPrice: number | null;
  salePrice: number | null;
  lowestObservedPrice: number;
  highestObservedPrice: number;
  discountPercent: number | null;
  isDiscounted: boolean;
  lastUpdated: string | null;
  snapshotsCount: number;
  state: PriceHistoryState;
  firstRecordedAt: string | null;
}

/**
 * Creates an authentic PriceSnapshot following the domain rules:
 * - If no discount: regularPrice = currentPrice, salePrice = null, effectivePrice = regularPrice, isDiscounted = false
 * - If discounted: regularPrice = original list price, salePrice = promo price, effectivePrice = salePrice, isDiscounted = true
 * - Never fabricates fake historical timestamps.
 */
export function createPriceSnapshot(params: {
  id?: string;
  bookId: string;
  sourceId?: string;
  sourceName?: string;
  observedAt: string;
  currency?: string;
  price: number;
  regularPrice?: number | null;
  salePrice?: number | null;
  availability?: string;
  sourceUrl?: string;
}): PriceSnapshot {
  const currency = params.currency || 'IDR';
  const observedAt = params.observedAt;
  const sourceId = params.sourceId || 'src_gramedia_catalog';
  const sourceName = params.sourceName || 'Katalog Resmi';
  const availability = params.availability || 'AVAILABLE';

  let regularPrice: number;
  let salePrice: number | null = null;
  let effectivePrice: number;
  let discountPercent: number | null = null;
  let isDiscounted = false;

  if (params.salePrice != null && params.regularPrice != null && params.regularPrice > params.salePrice) {
    // Explicit discount given
    regularPrice = params.regularPrice;
    salePrice = params.salePrice;
    effectivePrice = salePrice;
    discountPercent = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
    isDiscounted = true;
  } else if (params.regularPrice != null && params.regularPrice > params.price) {
    regularPrice = params.regularPrice;
    salePrice = params.price;
    effectivePrice = params.price;
    discountPercent = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
    isDiscounted = true;
  } else {
    // Normal non-discounted price
    regularPrice = params.regularPrice || params.price;
    salePrice = null;
    effectivePrice = params.price;
    isDiscounted = false;
    discountPercent = null;
  }

  return {
    id: params.id || `prc_snap_${params.bookId}_${new Date(observedAt).getTime()}`,
    bookId: params.bookId,
    sourceId,
    sourceName,
    observedAt,
    currency,
    regularPrice,
    salePrice,
    effectivePrice,
    discountPercent,
    isDiscounted,
    availability,
    sourceUrl: params.sourceUrl,
  };
}

/**
 * Extracts and normalizes genuine price snapshots from a Publication.
 * Only returns actual historical observations (never fabricates artificial daily points).
 */
export function getPublicationPriceSnapshots(publication: Publication): PriceSnapshot[] {
  // 1. If publication already has dedicated priceSnapshots, sort by observedAt ascending
  if (publication.priceSnapshots && publication.priceSnapshots.length > 0) {
    return [...publication.priceSnapshots].sort(
      (a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime()
    );
  }

  // 2. Otherwise convert raw priceHistory observations
  const observations = publication.priceHistory || [];
  if (observations.length === 0) {
    // If only currentPrice exists, create a single initial snapshot from firstSeenAt or recorded timestamp
    if (publication.currentPrice != null) {
      const snap = createPriceSnapshot({
        bookId: publication.id,
        observedAt: publication.lastPriceObservedAt || publication.lastSeenAt || publication.firstSeenAt || new Date().toISOString(),
        price: publication.currentPrice,
        regularPrice: publication.regularPrice,
        salePrice: publication.salePrice,
      });
      return [snap];
    }
    return [];
  }

  const snapshots: PriceSnapshot[] = observations.map((obs) => {
    return createPriceSnapshot({
      id: obs.id,
      bookId: obs.publicationId || publication.id,
      sourceId: obs.sourceId,
      sourceName: obs.sourceName,
      observedAt: obs.recordedAt,
      currency: obs.currency,
      price: obs.price,
      regularPrice: publication.regularPrice,
      salePrice: publication.salePrice,
    });
  });

  return snapshots.sort(
    (a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime()
  );
}

/**
 * Computes essential price metrics for display and UI indicators.
 */
export function computePriceMetrics(
  publication: Publication,
  snapshots: PriceSnapshot[]
): PriceHistoryMetrics {
  const currentEffective = publication.currentPrice || (snapshots.length > 0 ? snapshots[snapshots.length - 1].effectivePrice : 0);

  if (snapshots.length === 0) {
    return {
      currentPrice: currentEffective,
      regularPrice: publication.regularPrice || null,
      salePrice: publication.salePrice || null,
      lowestObservedPrice: publication.lowestObservedPrice || currentEffective,
      highestObservedPrice: publication.highestObservedPrice || currentEffective,
      discountPercent: publication.discountPercent || null,
      isDiscounted: Boolean(publication.isDiscounted),
      lastUpdated: publication.lastSeenAt || null,
      snapshotsCount: 0,
      state: 'EMPTY',
      firstRecordedAt: null,
    };
  }

  const effectivePrices = snapshots.map((s) => s.effectivePrice).filter((p) => p > 0);
  const regularPrices = snapshots.map((s) => s.regularPrice).filter((p) => p > 0);
  const allPrices = [...effectivePrices, ...regularPrices];

  const lowestObserved = allPrices.length > 0 ? Math.min(...effectivePrices) : currentEffective;
  const highestObserved = allPrices.length > 0 ? Math.max(...allPrices) : currentEffective;

  const latestSnap = snapshots[snapshots.length - 1];
  const firstSnap = snapshots[0];

  const isDiscounted = latestSnap.isDiscounted || Boolean(publication.isDiscounted);
  const regularPrice = latestSnap.regularPrice || publication.regularPrice || null;
  const salePrice = latestSnap.salePrice || publication.salePrice || null;
  const discountPercent = latestSnap.discountPercent || publication.discountPercent || null;

  let state: PriceHistoryState = 'EMPTY';
  if (snapshots.length === 1) {
    state = 'SINGLE_POINT';
  } else if (snapshots.length >= 2) {
    state = 'MULTIPLE_POINTS';
  }

  return {
    currentPrice: latestSnap.effectivePrice || currentEffective,
    regularPrice,
    salePrice,
    lowestObservedPrice: publication.lowestObservedPrice ? Math.min(publication.lowestObservedPrice, lowestObserved) : lowestObserved,
    highestObservedPrice: publication.highestObservedPrice ? Math.max(publication.highestObservedPrice, highestObserved) : highestObserved,
    discountPercent,
    isDiscounted,
    lastUpdated: latestSnap.observedAt || publication.lastSeenAt || null,
    snapshotsCount: snapshots.length,
    state,
    firstRecordedAt: firstSnap.observedAt,
  };
}

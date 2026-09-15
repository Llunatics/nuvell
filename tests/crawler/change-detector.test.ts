import { describe, it, expect } from 'vitest';
import { changeDetector } from '@/crawler/core/change-detector';
import { INITIAL_PUBLICATIONS } from '@/server/db/data-service';
describe('Change Detector', () => {
  it('detects price drop changes accurately', () => {
    const pub = INITIAL_PUBLICATIONS[0];
    const oldPrice = pub.currentPrice ?? 45000;
    const oldPriceStr = oldPrice.toString();
    const newPrice = oldPrice - 3000;
    const changes = changeDetector.detectChanges(pub, {
      publicationId: pub.id,
      newPrice: newPrice,
    });

    expect(changes.length).toBe(1);
    expect(changes[0].field).toBe('PRICE');
    expect(changes[0].oldValue).toBe(oldPriceStr);
    expect(changes[0].newValue).toBe(newPrice.toString());
    expect(changes[0].summary).toContain('Harga turun');
  });

  it('detects release date shift changes', () => {
    const pub = INITIAL_PUBLICATIONS[0];
    const oldDateStr = pub.releaseDate;
    const changes = changeDetector.detectChanges(pub, {
      publicationId: pub.id,
      newReleaseDate: '2026-09-30',
    });

    expect(changes.length).toBe(1);
    expect(changes[0].field).toBe('RELEASE_DATE');
    expect(changes[0].oldValue).toBe(oldDateStr);
    expect(changes[0].newValue).toBe('2026-09-30');
    expect(changes[0].summary).toContain('Jadwal rilis bergeser');
  });
});

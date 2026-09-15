import { describe, it, expect } from 'vitest';
import { dataService } from '@/server/db/data-service';

describe('Search & Deduplication Verification', () => {
  it('Kinki franchise has complete volumes and correct publisher', () => {
    const kinkiPubs = dataService
      .getAllPublications()
      .filter((p) => p.title.toLowerCase().includes('kinki'));

    // Verify all volumes exist
    const titles = kinkiPubs.map((p) => p.title);
    expect(titles.some((t) => t.includes('Vol. 1'))).toBe(true);
    expect(titles.some((t) => t.includes('Vol. 2'))).toBe(true);
    expect(titles.some((t) => t.includes('Vol. 3'))).toBe(true);

    // Verify Vol 1 has official specs
    const vol1 = kinkiPubs.find((p) => p.title.includes('Vol. 1'));
    expect(vol1).toBeDefined();
    expect(vol1?.publisherName).toBe('Phoenix Gramedia Indonesia');
    expect(vol1?.publisherId).toBe('pub_pgi');
    expect(vol1?.releaseDate).toBe('2025-10-13');
    expect(vol1?.isbn13).toBe('9786347375063');

    // Verify series is attributed to Phoenix Gramedia Indonesia with 3+ volumes
    const series = dataService
      .getAllSeries()
      .find((s) => s.id === 'ser_tentang_suatu_tempat');
    expect(series).toBeDefined();
    expect(series?.publisherName).toBe('Phoenix Gramedia Indonesia');
    expect(series?.publisherId).toBe('pub_pgi');
    expect(series?.totalVolumes).toBeGreaterThanOrEqual(3);
  });

  it('Oshi no Ko has zero duplicate volumes in search', () => {
    const onkPubs = dataService
      .getAllPublications()
      .filter(
        (p) =>
          p.title.toLowerCase().includes('oshi no ko') ||
          p.slug.includes('oshi-no-ko')
      );

    // Check volume 12
    const vol12 = onkPubs.filter((p) => p.volume === 12);
    expect(vol12.length).toBe(1);
    expect(vol12[0].title).toBe('Akasha : Oshi No Ko: Anak Idola 12');
    expect(vol12[0].publisherName).toBe('m&c! Publishing');

    // Check volume 13, 14, 15, 16
    for (const v of [13, 14, 15, 16]) {
      const matches = onkPubs.filter((p) => p.volume === v);
      expect(matches.length).toBe(1);
    }
  });

  it('Shiboyugi has both Volume 1 and Volume 2 under Phoenix Gramedia Indonesia', () => {
    const shiboPubs = dataService
      .getAllPublications()
      .filter((p) => p.seriesId === 'ser_shiboyugi');

    expect(shiboPubs.length).toBe(2);
    const vols = shiboPubs.map((p) => p.volume).sort();
    expect(vols).toEqual([1, 2]);

    for (const p of shiboPubs) {
      expect(p.publisherName).toBe('Phoenix Gramedia Indonesia');
      expect(p.publisherId).toBe('pub_pgi');
    }
  });

  it('About a Place in the Kinki Region is correctly attributed to Water Lily Literary as an English Hardcover Import', () => {
    const importBook = dataService.getPublicationBySlug('about-a-place-in-the-kinki-region');
    expect(importBook).toBeDefined();
    expect(importBook?.publisherName).toBe('Water Lily Literary');
    expect(importBook?.publisherId).toBe('pub_water_lily_literary');
    expect(importBook?.language).toBe('en');
    expect(importBook?.country).toContain('Import');
    expect(importBook?.format).toBe('HARDCOVER');
    expect(importBook?.pageCount).toBe(354);
    expect(importBook?.isbn13).toBe('9798855409949');
  });

  it('Happiness series is present and searchable with accurate volumes', () => {
    const happinessPubs = dataService
      .getAllPublications()
      .filter((p) => p.title.toLowerCase().includes('happiness'));

    expect(happinessPubs.length).toBeGreaterThanOrEqual(10);

    // Verify Level Comic: Happiness
    const lcHappiness = happinessPubs.filter((p) =>
      p.title.toLowerCase().includes('level comic: happiness') || p.title.toLowerCase().includes('lc: happiness')
    );
    expect(lcHappiness.length).toBeGreaterThanOrEqual(7);

    // Verify Three Days of Happiness
    const threeDays = happinessPubs.find((p) => p.title.toLowerCase().includes('three days of happiness'));
    expect(threeDays).toBeDefined();
    expect(threeDays?.publisherName).toBe('m&c! Publishing');
  });
});

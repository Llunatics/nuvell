import { describe, it, expect } from 'vitest';
import { transcribeSocialPoster } from '@/crawler/social/poster-transcriber';

describe('Social Media Poster Transcriber', () => {
  it('transcribes Phoenix Gramedia Indonesia flyer correctly', () => {
    const rawPoster = `
      September 9th Releases
      Continue your collection! Find out what happens next!
      Hidup di Dalam Bathtub (Light Novel) [NEW]
      Phantom Busters Vol. 5 (Comic)
      Blue Lock Vol. 32 (Comic) [POST CARD]
      Witch Watch Vol. 10 (Comic)
      Drama Queen Vol. 3 (Comic)
    `;

    const result = transcribeSocialPoster(rawPoster, 'Phoenix Gramedia Indonesia', 2026);

    expect(result.detectedReleaseDate).toBe('2026-09-09');
    expect(result.items.length).toBe(5);

    // 1. Hidup di Dalam Bathtub (Light Novel)
    expect(result.items[0].seriesName).toContain('Hidup di Dalam Bathtub');
    expect(result.items[0].isNewSeries).toBe(true);

    // 2. Phantom Busters Vol. 5
    expect(result.items[1].seriesName).toContain('Phantom Busters');
    expect(result.items[1].volume).toBe(5);

    // 3. Blue Lock Vol. 32
    expect(result.items[2].seriesName).toContain('Blue Lock');
    expect(result.items[2].volume).toBe(32);
    expect(result.items[2].hasPostcard).toBe(true);

    // 4. Witch Watch Vol. 10
    expect(result.items[3].seriesName).toContain('Witch Watch');
    expect(result.items[3].volume).toBe(10);

    // 5. Drama Queen Vol. 3
    expect(result.items[4].seriesName).toContain('Drama Queen');
    expect(result.items[4].volume).toBe(3);
  });
});

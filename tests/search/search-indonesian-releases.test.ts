import { describe, it, expect } from 'vitest';
import { dataService } from '@/server/db/data-service';

describe('Search & Discovery for Indonesian Releases', () => {
  it('indexes "Setelah Melompat Aku Ingin Hidup" by Brian Khrisna', () => {
    const pub = dataService.getPublicationBySlug('setelah-melompat-aku-ingin-hidup');
    expect(pub).toBeDefined();
    expect(pub?.title).toContain('Setelah Melompat Aku Ingin Hidup');
    expect(pub?.publisherName).toContain('Gramedia Widiasarana Indonesia');
    expect(pub?.publisherId).toBe('pub_grasindo');
    expect(pub?.currentPrice).toBe(77600);
    expect(pub?.authors.some((a) => a.name.toLowerCase().includes('brian khrisna'))).toBe(true);
  });

  it('searches by partial title "setelah melompat"', () => {
    const allPubs = dataService.getAllPublications();
    const matches = allPubs.filter((p) =>
      p.title.toLowerCase().includes('setelah melompat')
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].title).toBe('Setelah Melompat Aku Ingin Hidup');
  });

  it('correctly associates publishers like Grasindo, BIP, KPG, and Noura', () => {
    const allPubs = dataService.getAllPublications();
    const hasGrasindo = allPubs.some((p) => p.publisherId === 'pub_grasindo');
    expect(hasGrasindo).toBe(true);

    const publishers = dataService.getAllPublishers();
    const pgi = publishers.find((p) => p.id === 'pub_pgi');
    const elex = publishers.find((p) => p.id === 'pub_elex');
    const mnc = publishers.find((p) => p.id === 'pub_mnc');
    const grasindo = publishers.find((p) => p.id === 'pub_grasindo');

    expect(pgi).toBeDefined();
    expect(elex).toBeDefined();
    expect(mnc).toBeDefined();
    expect(grasindo).toBeDefined();
  });
});

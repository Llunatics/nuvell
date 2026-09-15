import { describe, it, expect } from 'vitest';
import { dataService, isBookPublication } from '@/server/db/data-service';
import { Publication } from '@/types';

describe('Book-Only Filtering Logic', () => {
  it('should accurately reject stationery and non-book merchandise', () => {
    const fakeMerchItems: Partial<Publication>[] = [
      {
        id: 'merch_spidol',
        title: 'Bic Marking 2000 - Spidol Permanen Warna Biru',
        authors: [{ authorId: 'auth_1', name: 'Datascrip', slug: 'datascrip', role: 'AUTHOR' }],
      },
      {
        id: 'merch_eyemask',
        title: 'Eye Mask-Dandadan (Okarun Transformation)',
        authors: [{ authorId: 'auth_2', name: 'MUSE COMMUNICATION CO LTD', slug: 'muse', role: 'AUTHOR' }],
      },
      {
        id: 'merch_poker',
        title: "Poker-Frieren: Beyond Journey's End",
        authors: [{ authorId: 'auth_3', name: 'MUSE COMMUNICATION CO LTD', slug: 'muse', role: 'AUTHOR' }],
      },
      {
        id: 'merch_pen',
        title: 'Ballpen Zebra Sarasa Clip 0.5mm Conan3 Black1',
        authors: [{ authorId: 'auth_4', name: 'Zebra', slug: 'zebra', role: 'AUTHOR' }],
      },
      {
        id: 'merch_backpack',
        title: 'Large backpack - Jujutsu Kaisen - Graphic Graphic',
        authors: [{ authorId: 'auth_5', name: 'Dadi Prima', slug: 'dadi-prima', role: 'AUTHOR' }],
      },
      {
        id: 'merch_keychain',
        title: 'Demon Slayer Tanjiro Acrylic Keychain Gantungan Kunci',
        authors: [{ authorId: 'auth_6', name: 'Adinata Melodi Kreasi', slug: 'adinata', role: 'AUTHOR' }],
      },
      {
        id: 'merch_mousepad',
        title: 'Gaming Mouse Pad-Demon Slayer: Kimetsu No Yaiba',
        authors: [{ authorId: 'auth_7', name: 'MUSE COMMUNICATION CO LTD', slug: 'muse', role: 'AUTHOR' }],
      },
    ];

    fakeMerchItems.forEach((item) => {
      expect(isBookPublication(item as Publication)).toBe(false);
    });
  });

  it('should preserve legitimate books, manga, novels, and data books', () => {
    const legitimateBooks: Partial<Publication>[] = [
      {
        id: 'book_frieren_12',
        title: "Frieren: Beyond Journey's End Vol. 12",
        authors: [{ authorId: 'auth_yamada', name: 'Kanehito Yamada', slug: 'kanehito-yamada', role: 'AUTHOR' }],
      },
      {
        id: 'book_onepiece_108',
        title: 'One Piece 108',
        authors: [{ authorId: 'auth_oda', name: 'Eiichiro Oda', slug: 'eiichiro-oda', role: 'AUTHOR' }],
      },
      {
        id: 'book_naruto_databook',
        title: 'The Secret Scroll of Soldier: Naruto Character Official Data Book + Poster',
        authors: [{ authorId: 'auth_kishimoto', name: 'Masashi Kishimoto', slug: 'masashi-kishimoto', role: 'AUTHOR' }],
      },
      {
        id: 'book_novel',
        title: 'Kastel Terpencil di Dalam Cermin (Edisi Koleksi)',
        authors: [{ authorId: 'auth_tsujimura', name: 'Mizuki Tsujimura', slug: 'mizuki-tsujimura', role: 'AUTHOR' }],
      },
    ];

    legitimateBooks.forEach((book) => {
      expect(isBookPublication(book as Publication)).toBe(true);
    });
  });

  it('should ensure dataService contains zero merchandise and maintains legitimate publications', () => {
    const publications = dataService.getAllPublications();
    expect(publications.length).toBeGreaterThan(5000);

    const hasSpidol = publications.some((p) => /spidol|marker/i.test(p.title) && p.authors?.some(a => /datascrip|zebra/i.test(a.name)));
    const hasEyeMask = publications.some((p) => /eye mask/i.test(p.title));
    const hasPoker = publications.some((p) => /^poker[- ]/i.test(p.title));
    const hasZebraPen = publications.some((p) => /sarasa clip|mildliner/i.test(p.title));

    expect(hasSpidol).toBe(false);
    expect(hasEyeMask).toBe(false);
    expect(hasPoker).toBe(false);
    expect(hasZebraPen).toBe(false);
  });

  it('should ensure religious books like Yaasiin and light novels are not classified as Manga or Tankobon', () => {
    const publications = dataService.getAllPublications();

    const yaasin = publications.find((p) => p.title.toLowerCase().includes('yaasiin'));
    expect(yaasin).toBeDefined();
    expect(yaasin?.genres).not.toContain('Manga');
    expect(yaasin?.genres).toContain('Agama & Spiritualitas');
    expect(yaasin?.format).not.toBe('TANKOBON');

    const reliving = publications.find((p) => p.title.includes('Re-Living My Life'));
    expect(reliving).toBeDefined();
    expect(reliving?.genres).not.toContain('Manga');
    expect(reliving?.genres).toContain('Light Novel');
    expect(reliving?.format).not.toBe('TANKOBON');

    const hasPuzzle = publications.some((p) => /doraemon large puzzle/i.test(p.title));
    expect(hasPuzzle).toBe(false);
  });
});

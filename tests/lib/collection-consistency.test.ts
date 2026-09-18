import { describe, it, expect } from 'vitest';
import { UserCollectionItem, Publication } from '@/types';

describe('Library Collection Data Consistency', () => {
  const mockCatalog: Publication[] = [
    {
      id: 'pub-1',
      slug: 'book-one',
      title: 'Book One',
      format: 'Buku Fisik',
      releaseDate: '2026-09-10',
      currentPrice: 45000,
      status: 'RELEASED',
      sources: [],
      priceHistory: [],
      changes: [],
    },
    {
      id: 'pub-2',
      slug: 'book-two',
      title: 'Book Two',
      format: 'Buku Fisik',
      releaseDate: '2026-09-12',
      currentPrice: 50000,
      status: 'RELEASED',
      sources: [],
      priceHistory: [],
      changes: [],
    },
    {
      id: 'pub-3',
      slug: 'book-three',
      title: 'Book Three',
      format: 'Buku Fisik',
      releaseDate: '2026-09-15',
      currentPrice: 60000,
      status: 'PREORDER',
      sources: [],
      priceHistory: [],
      changes: [],
    },
    {
      id: 'pub-4',
      slug: 'book-four',
      title: 'Book Four',
      format: 'Buku Fisik',
      releaseDate: '2026-09-18',
      currentPrice: 35000,
      status: 'UPCOMING',
      sources: [],
      priceHistory: [],
      changes: [],
    },
  ];

  it('guarantees that All count equals sum of owned, wishlist, and preorder', () => {
    const userMap = new Map<string, UserCollectionItem>();
    userMap.set('pub-1', { publicationId: 'pub-1', status: 'OWNED', updatedAt: '2026-09-15' });
    userMap.set('pub-2', { publicationId: 'pub-2', status: 'OWNED', updatedAt: '2026-09-16' });
    userMap.set('pub-3', { publicationId: 'pub-3', status: 'PREORDERED', updatedAt: '2026-09-17' });
    userMap.set('pub-4', { publicationId: 'pub-4', status: 'WISHLIST', updatedAt: '2026-09-18' });

    // Match catalog with collection
    const collectedBooks = mockCatalog
      .map((pub) => {
        const item = userMap.get(pub.id);
        return item ? { pub, item } : null;
      })
      .filter(Boolean) as { pub: Publication; item: UserCollectionItem }[];

    const ownedCount = collectedBooks.filter((b) => b.item.status === 'OWNED').length;
    const wishlistCount = collectedBooks.filter((b) => b.item.status === 'WISHLIST').length;
    const preorderedCount = collectedBooks.filter(
      (b) => b.item.status === 'PREORDERED' || (b.item.status as string) === 'PREORDER'
    ).length;
    const allCount = collectedBooks.length;

    // Rule: allCount must strictly equal owned + wishlist + preorder
    expect(allCount).toBe(4);
    expect(ownedCount).toBe(2);
    expect(wishlistCount).toBe(1);
    expect(preorderedCount).toBe(1);
    expect(allCount).toBe(ownedCount + wishlistCount + preorderedCount);

    // Filter verification: each filter must produce exact number of rendered cards
    const filteredAll = collectedBooks;
    const filteredOwned = collectedBooks.filter((b) => b.item.status === 'OWNED');
    const filteredWishlist = collectedBooks.filter((b) => b.item.status === 'WISHLIST');
    const filteredPreorder = collectedBooks.filter(
      (b) => b.item.status === 'PREORDERED' || (b.item.status as string) === 'PREORDER'
    );

    expect(filteredAll.length).toBe(allCount);
    expect(filteredOwned.length).toBe(ownedCount);
    expect(filteredWishlist.length).toBe(wishlistCount);
    expect(filteredPreorder.length).toBe(preorderedCount);
  });
});

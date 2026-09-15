// RSS/Atom Feed Adapter for nuvelll

import { SourceAdapter, RawCrawlItem } from '../core/source-adapter';

export class FeedAdapter extends SourceAdapter {
  public readonly id = 'src_publisher_feed';
  public readonly name = 'Publisher RSS Feed';
  public readonly domain = 'feeds.publisher.id';
  public readonly baseUrl = 'https://feeds.publisher.id';
  public readonly crawlIntervalMin = 120; // 2 hours

  public async parse(rawContent: string, sourceUrl: string): Promise<RawCrawlItem[]> {
    const items: RawCrawlItem[] = [];

    // Parse RSS <item> tags
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(rawContent)) !== null) {
      const block = match[1];
      const title = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim();
      const link = block.match(/<link>(.*?)<\/link>/i)?.[1]?.trim() || sourceUrl;
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/i)?.[1]?.trim();
      const description = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim();

      if (title) {
        // Look for ISBN or price inside description
        const isbnMatch = description?.match(/ISBN[:\s]*([0-9X\-]{10,17})/i);
        const priceMatch = description?.match(/Rp\s*([0-9\.\,]+)/i);

        items.push({
          title,
          publisher: 'Penerbit Haru',
          releaseDate: pubDate,
          sourceUrl: link,
          description: description?.replace(/<[^>]+>/g, ' ').slice(0, 300),
          isbn: isbnMatch ? isbnMatch[1] : undefined,
          price: priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : undefined,
        });
      }
    }

    return items;
  }
}

export const feedAdapter = new FeedAdapter();

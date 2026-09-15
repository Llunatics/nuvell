// Elex Media Komputindo Adapter for nuvelll

import { SourceAdapter, RawCrawlItem } from '../core/source-adapter';

export class ElexAdapter extends SourceAdapter {
  public readonly id = 'src_elex_media';
  public readonly name = 'Elex Media Komputindo';
  public readonly domain = 'elexmedia.id';
  public readonly baseUrl = 'https://elexmedia.id';
  public readonly crawlIntervalMin = 180; // 3 hours

  /**
   * Parses HTML/structured JSON from Elex Media release schedule
   */
  public async parse(rawContent: string, sourceUrl: string): Promise<RawCrawlItem[]> {
    const items: RawCrawlItem[] = [];

    // Check for structured JSON-LD or data embedded in script tags first
    const jsonLdMatch = rawContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    if (jsonLdMatch && jsonLdMatch[1]) {
      try {
        const parsed = JSON.parse(jsonLdMatch[1]);
        if (Array.isArray(parsed)) {
          for (const entry of parsed) {
            if (entry['@type'] === 'Book' || entry['@type'] === 'Product') {
              items.push({
                title: entry.name || entry.title,
                author: entry.author?.name || entry.author,
                publisher: 'Elex Media Komputindo',
                isbn: entry.isbn,
                price: entry.offers?.price ? parseFloat(entry.offers.price) : undefined,
                releaseDate: entry.datePublished || entry.releaseDate,
                coverImage: entry.image,
                description: entry.description,
                sourceUrl: entry.url || sourceUrl,
              });
            }
          }
        }
      } catch {
        // Fallback to DOM regex extraction
      }
    }

    // HTML pattern extraction for release schedule articles/cards
    // Matches e.g. <div class="release-item">...<h4>Title</h4>...<span>Rp 45.000</span>...</div>
    const itemRegex = /<div class="[^"]*release-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let match;
    while ((match = itemRegex.exec(rawContent)) !== null) {
      const block = match[1];
      const titleMatch = block.match(/<h[34][^>]*>(.*?)<\/h[34]>/i);
      const priceMatch = block.match(/Rp\s*([0-9\.\,]+)/i);
      const isbnMatch = block.match(/ISBN[:\s]*([0-9X\-]{10,17})/i);
      const dateMatch = block.match(/([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/i);
      const linkMatch = block.match(/href="([^"]+)"/i);
      const imgMatch = block.match(/src="([^"]+)"/i);

      if (titleMatch && titleMatch[1]) {
        const cleanTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : undefined;
        const link = linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `${this.baseUrl}${linkMatch[1]}`) : sourceUrl;

        items.push({
          title: cleanTitle,
          publisher: 'Elex Media Komputindo',
          price,
          isbn: isbnMatch ? isbnMatch[1] : undefined,
          releaseDate: dateMatch ? dateMatch[1] : undefined,
          sourceUrl: link,
          coverImage: imgMatch ? imgMatch[1] : undefined,
        });
      }
    }

    return items;
  }
}

export const elexAdapter = new ElexAdapter();

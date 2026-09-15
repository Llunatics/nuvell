// m&c! Publishing & Akasha Imprint Adapter for nuvelll

import { SourceAdapter, RawCrawlItem } from '../core/source-adapter';

export class MncAdapter extends SourceAdapter {
  public readonly id = 'src_mnc_publishing';
  public readonly name = 'm&c! Publishing';
  public readonly domain = 'mncgramedia.id';
  public readonly baseUrl = 'https://mncgramedia.id';
  public readonly crawlIntervalMin = 240;

  public async parse(rawContent: string, sourceUrl: string): Promise<RawCrawlItem[]> {
    const items: RawCrawlItem[] = [];

    const itemRegex = /<article class="[^"]*comic-release[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
    let match;
    while ((match = itemRegex.exec(rawContent)) !== null) {
      const block = match[1];
      const titleMatch = block.match(/<h[234][^>]*>(.*?)<\/h[234]>/i);
      const authorMatch = block.match(/class="[^"]*author[^"]*"[^>]*>(.*?)<\//i);
      const imprintMatch = block.match(/class="[^"]*imprint[^"]*"[^>]*>(.*?)<\//i);
      const priceMatch = block.match(/Rp\s*([0-9\.\,]+)/i);
      const isbnMatch = block.match(/ISBN[:\s]*([0-9X\-]{10,17})/i);
      const linkMatch = block.match(/href="([^"]+)"/i);
      const imgMatch = block.match(/src="([^"]+)"/i);

      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        const imprint = imprintMatch ? imprintMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : undefined;

        items.push({
          title,
          author: authorMatch ? authorMatch[1].replace(/<[^>]+>/g, '').trim() : undefined,
          publisher: 'm&c!',
          imprint: imprint || (title.toLowerCase().includes('akasha') ? 'Akasha' : undefined),
          price,
          isbn: isbnMatch ? isbnMatch[1] : undefined,
          sourceUrl: linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `${this.baseUrl}${linkMatch[1]}`) : sourceUrl,
          coverImage: imgMatch ? imgMatch[1] : undefined,
        });
      }
    }

    return items;
  }
}

export const mncAdapter = new MncAdapter();

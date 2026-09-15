// Gramedia Catalog Adapter for nuvelll

import { SourceAdapter, RawCrawlItem } from '../core/source-adapter';

export class GramediaAdapter extends SourceAdapter {
  public readonly id = 'src_gramedia_catalog';
  public readonly name = 'Gramedia';
  public readonly domain = 'gramedia.com';
  public readonly baseUrl = 'https://www.gramedia.com';
  public readonly crawlIntervalMin = 240; // 4 hours

  public async parse(rawContent: string, sourceUrl: string): Promise<RawCrawlItem[]> {
    const items: RawCrawlItem[] = [];

    // 1. Direct JSON API parsing (from api-service.gramedia.com/api/v2/public/products)
    if (rawContent.trim().startsWith('{') || rawContent.trim().startsWith('[')) {
      try {
        const json = JSON.parse(rawContent);
        const dataList = Array.isArray(json) ? json : json.data || [];
        for (const item of dataList) {
          if (item.title) {
            items.push({
              title: item.title,
              author: item.author,
              publisher: item.publisher || 'Elex Media Komputindo',
              price: item.final_price || item.slice_price,
              coverImage: item.image,
              sourceUrl: item.slug ? `${this.baseUrl}/products/${item.slug}` : sourceUrl,
              format: /novel/i.test(item.title) ? 'PAPERBACK' : 'TANKOBON',
            });
          }
        }
        if (items.length > 0) return items;
      } catch {
        // Fallback to other checks
      }
    }

    // 2. Check for NEXT_DATA embedded hydration JSON
    const nextDataMatch = rawContent.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i);
    if (nextDataMatch && nextDataMatch[1]) {
      try {
        const parsed = JSON.parse(nextDataMatch[1]);
        const products =
          parsed?.props?.pageProps?.products ||
          parsed?.props?.pageProps?.initialState?.catalog?.products ||
          [];

        for (const p of products) {
          items.push({
            title: p.title || p.name,
            author: p.author || p.authors?.map((a: { name: string }) => a.name).join(', '),
            publisher: p.publisher || 'Gramedia Pustaka Utama',
            isbn: p.isbn,
            price: p.formats?.[0]?.price || p.basePrice || p.price,
            releaseDate: p.publishDate || p.releaseDate,
            coverImage: p.thumbnailUrl || p.images?.[0]?.url,
            description: p.description,
            sourceUrl: p.url ? (p.url.startsWith('http') ? p.url : `${this.baseUrl}${p.url}`) : sourceUrl,
            format: p.format || 'PAPERBACK',
          });
        }
        if (items.length > 0) return items;
      } catch {
        // Fallback to HTML matching
      }
    }

    // HTML fallback extraction
    const cardRegex = /<div class="[^"]*product-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    let match;
    while ((match = cardRegex.exec(rawContent)) !== null) {
      const card = match[1];
      const titleMatch = card.match(/class="[^"]*title[^"]*"[^>]*>(.*?)<\//i);
      const authorMatch = card.match(/class="[^"]*author[^"]*"[^>]*>(.*?)<\//i);
      const priceMatch = card.match(/Rp\s*([0-9\.\,]+)/i);
      const imgMatch = card.match(/src="([^"]+)"/i);
      const linkMatch = card.match(/href="([^"]+)"/i);

      if (titleMatch && titleMatch[1]) {
        items.push({
          title: titleMatch[1].replace(/<[^>]+>/g, '').trim(),
          author: authorMatch ? authorMatch[1].replace(/<[^>]+>/g, '').trim() : undefined,
          publisher: 'Gramedia Pustaka Utama',
          price: priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : undefined,
          coverImage: imgMatch ? imgMatch[1] : undefined,
          sourceUrl: linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `${this.baseUrl}${linkMatch[1]}`) : sourceUrl,
        });
      }
    }

    return items;
  }
}

export const gramediaAdapter = new GramediaAdapter();

import { describe, it, expect } from 'vitest';
import { elexAdapter } from '@/crawler/adapters/elex-adapter';
import { gramediaAdapter } from '@/crawler/adapters/gramedia-adapter';
import { mncAdapter } from '@/crawler/adapters/mnc-adapter';
import { feedAdapter } from '@/crawler/adapters/feed-adapter';

describe('Crawler Source Adapters with HTML Fixtures', () => {
  it('ElexAdapter parses release items and price accurately', async () => {
    const mockHtml = `
      <div class="release-item">
        <h4>Kagurabachi Vol. 01</h4>
        <span>Rp 48.000</span>
        <span>ISBN: 978-623-00-6101-1</span>
        <span>14 September 2026</span>
        <a href="/comic/detail/1234">Detail</a>
      </div>
    `;

    const items = await elexAdapter.parse(mockHtml, 'https://elexmedia.id/schedule');
    expect(items.length).toBe(1);
    expect(items[0].title).toBe('Kagurabachi Vol. 01');
    expect(items[0].price).toBe(48000);
    expect(items[0].isbn).toBe('978-623-00-6101-1');

    const normalized = elexAdapter.normalize(items[0]);
    expect(normalized.cleanTitle).toBe('kagurabachi vol 1');
    expect(normalized.volume).toBe(1);
    expect(elexAdapter.validate(normalized)).toBe(true);
  });

  it('GramediaAdapter extracts Next.js hydration payload', async () => {
    const mockHtml = `
      <script id="__NEXT_DATA__" type="application/json">
        {
          "props": {
            "pageProps": {
              "products": [
                {
                  "title": "Cantik Itu Luka (Edisi Khusus)",
                  "basePrice": 162000,
                  "isbn": "9786020669113",
                  "publisher": "Gramedia Pustaka Utama",
                  "url": "/products/cantik-itu-luka"
                }
              ]
            }
          }
        }
      </script>
    `;

    const items = await gramediaAdapter.parse(mockHtml, 'https://gramedia.com');
    expect(items.length).toBe(1);
    expect(items[0].title).toBe('Cantik Itu Luka (Edisi Khusus)');
    expect(items[0].price).toBe(162000);

    const norm = gramediaAdapter.normalize(items[0]);
    expect(norm.isSpecialEdition).toBe(true);
  });

  it('FeedAdapter parses RSS XML item nodes', async () => {
    const mockXml = `
      <rss version="2.0">
        <channel>
          <item>
            <title>Overlord Vol. 14: The Witch of the Falling Kingdom</title>
            <link>https://penerbitharu.com/overlord-14</link>
            <description><![CDATA[Telah terbit novel Overlord 14. Harga: Rp 110.000. ISBN: 978-623-7351-89-2]]></description>
            <pubDate>Mon, 14 Sep 2026 00:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>
    `;

    const items = await feedAdapter.parse(mockXml, 'https://penerbitharu.com/feed');
    expect(items.length).toBe(1);
    expect(items[0].title).toContain('Overlord Vol. 14');
    expect(items[0].price).toBe(110000);
  });
});

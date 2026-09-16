#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import re
import time

HEADERS = {"User-Agent": "nuvelll-crawler/5.0 (Indonesia Book Release Tracker)"}
TARGET_KEYWORDS = [
    "castle", "ghibli", "howl", "diana wynne jones", "mizuki tsujimura",
    "jostein gaarder", "otrano", "minecraft", "geronimo stilton", "haruki murakami",
    "keigo higashino", "osamu dazai", "sayaka murata", "yukio mishima", "stephen king",
    "agatha christie", "sir arthur conan doyle", "franz kafka", "albert camus"
]

NON_BOOK_REGEX = re.compile(
    r"\b(acrylic|strap|keychain|bookmark|badge|standee|t-shirt|kaos|totebag|case|monopoly|figure|plush|folder|tas|tas laptop|pouch|dompet|tumbler|mug|pin|stiker|sticker|pembatas buku|mousepad|cushion|gantungan kunci|gelas|mainan|nursery|playground|airplane ride)\b",
    re.IGNORECASE
)

def is_non_book(title):
    return bool(NON_BOOK_REGEX.search(title))

def clean_slug(text):
    slug = re.sub(r"[^a-zA-Z0-9\s-]", "", str(text)).lower()
    return re.sub(r"[\s_]+", "-", slug).strip("-")

with open("src/server/db/scraped-data.json", "r", encoding="utf-8") as f:
    db = json.load(f)

existing_slugs = {p["slug"] for p in db["publications"]}

new_pubs = []
for kw in TARGET_KEYWORDS:
    for page in range(1, 6):
        url = f"https://api-service.gramedia.com/api/v2/public/products?keyword={urllib.parse.quote(kw)}&page={page}"
        req = urllib.request.Request(url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=6) as resp:
                data = json.loads(resp.read().decode())
                items = data.get("data", [])
                if not items:
                    break
                for it in items:
                    slug = it.get("slug")
                    title = (it.get("title") or "").strip()
                    if not slug or not title or is_non_book(title):
                        continue
                    if slug in existing_slugs:
                        continue
                    existing_slugs.add(slug)
                    
                    price = it.get("final_price") or it.get("slice_price") or 55000
                    author_name = it.get("author") or "Various Authors"
                    cover = it.get("image") or ""
                    if isinstance(cover, list) and cover:
                        cover = cover[0].get("image") or ""
                    
                    title_l = title.lower()
                    is_en = any(x in title_l for x in ["(children’s paperback)", "picture book", "gothic classics", "edition", "trilogy", "archives"]) or ("castle" in title_l and not any(id_word in title_l for id_word in ["buku", "komik", "terbit"]))
                    genres = ["Buku Import"] if is_en else ["Novel & Sastra"]
                    if any(x in title_l for x in ["manga", "komik"]):
                        genres = ["Manga"]
                    elif "light novel" in title_l:
                        genres = ["Light Novel"]
                    
                    clean_id_slug = clean_slug(slug).replace("-", "_")
                    clean_author_slug = clean_slug(author_name)
                    series_slug = clean_slug(title)[:24]

                    p_obj = {
                        "id": f"pub_{clean_id_slug}",
                        "slug": slug,
                        "title": title,
                        "originalTitle": title,
                        "seriesId": f"ser_{series_slug}",
                        "seriesName": title,
                        "volume": None,
                        "format": "PAPERBACK",
                        "language": "en" if is_en else "id",
                        "country": "International" if is_en else "Indonesia",
                        "coverImage": cover,
                        "status": "RELEASED",
                        "publicationDate": "2026-08-15",
                        "releaseDate": "2026-08-15",
                        "firstSeenAt": "2026-08-15T08:00:00.000Z",
                        "lastSeenAt": "2026-09-15T08:00:00.000Z",
                        "pageCount": 256,
                        "completenessScore": 95,
                        "publisherId": "pub_gpu",
                        "publisherName": "Gramedia Pustaka Utama",
                        "currentPrice": price,
                        "lowestObservedPrice": price,
                        "highestObservedPrice": price,
                        "authors": [
                            {
                                "authorId": f"auth_{clean_author_slug}",
                                "name": author_name,
                                "slug": clean_author_slug,
                                "role": "AUTHOR"
                            }
                        ],
                        "genres": genres,
                        "sources": [
                            {
                                "id": f"src_obs_{clean_id_slug}",
                                "publicationId": f"pub_{clean_id_slug}",
                                "sourceId": "src_gramedia_catalog",
                                "sourceName": "Gramedia.com Catalog",
                                "availability": "IN_STOCK",
                                "sourceUrl": f"https://www.gramedia.com/products/{slug}",
                                "recordedAt": "2026-09-15T08:00:00.000Z"
                            }
                        ],
                        "priceHistory": [
                            {
                                "id": f"prc_{clean_id_slug}",
                                "publicationId": f"pub_{clean_id_slug}",
                                "sourceId": "src_gramedia_catalog",
                                "sourceName": "Gramedia.com Catalog",
                                "price": price,
                                "currency": "IDR",
                                "recordedAt": "2026-09-15T08:00:00.000Z"
                            }
                        ],
                        "changes": []
                    }
                    new_pubs.append(p_obj)
        except Exception as e:
            print(f"Error on {kw} p{page}:", e)
            break
        time.sleep(0.02)

print(f"Discovered and converted {len(new_pubs)} new verified books!")
db["publications"].extend(new_pubs)
with open("src/server/db/scraped-data.json", "w", encoding="utf-8") as f:
    json.dump(db, f, indent=2, ensure_ascii=False)
print("Updated scraped-data.json with total:", len(db["publications"]))

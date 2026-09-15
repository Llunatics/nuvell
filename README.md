# nuvelll — Indonesia Book Release Intelligence Platform

> **"indonesia book release tracker"**  
> *A living release tracker for books, manga, comics, light novels, novels, and other publications released in Indonesia.*

---

## 1. Product Vision

**nuvelll** is a single discovery layer and release intelligence platform for books, manga, manhwa, manhua, comics, light novels, novels, teen fiction, literary fiction, omnibus, art books, and collector editions in Indonesia.

Instead of an e-commerce catalog, **nuvelll** serves as a **Book Release Intelligence Platform** with a robust automated data pipeline:

```
SOURCE → CRAWLER → PARSER → NORMALIZER → DEDUPLICATOR → CLASSIFIER → CHANGE DETECTOR → DATABASE → SEARCH INDEX → USER EXPERIENCE
```

---

## 2. Core Features & Capabilities

- **Live Release Feed ("What's New in Indonesia")**:
  - Filter by timeframe: Today, Yesterday, This Week, This Month, Last 3 Months.
  - Sort by: Newest Release, Newest Discovered, Recently Updated, Most Sources, Price.
  - Formats: Manga & Komik, Light Novel, Novel Sastra, Edisi Kolektor.
  - Badges: `NEW RELEASE`, `UPDATED`, `PRICE DROP`, `DATE CHANGED`, `PREORDER`, `BACK IN STOCK`.
- **Global Search (`Cmd/Ctrl + K`)**:
  - Fast, debounced search across titles, series, publishers, authors, and ISBN with keyboard navigation.
- **Series Tracker (`/series` & `/series/[slug]`)**:
  - Visual volume matrix `[01][02][03]...[108]` tracking released, upcoming, and missing volumes.
- **Personal Collection Tracker (`/collection`)**:
  - Track owned items, wishlists, and pre-orders with completion progress percentages per series.
  - Export & import collection data via JSON without requiring account registration.
- **My Release Radar (`/radar`)**:
  - Personalized release radar filtering new releases, upcoming pre-orders, and price drops strictly for items in your Watchlist.
- **Interactive Release Calendar (`/calendar`)**:
  - Monthly calendar view with precise countdown labels relative to `Asia/Jakarta` (WIB) timezone: *"Releases today"*, *"Releases in 4 days"*, *"Released 3 days ago"*.
- **Multi-Source Price Comparison & Tracking (`/books/[slug]`)**:
  - Verified observed prices across Gramedia, official publishers, and bookstores.
  - Historical price tracking chart powered by Recharts.
  - Direct links to original sources.
- **Release Intelligence Hub (`/intelligence`)**:
  - Analytical activity stream showing newly discovered titles, price drops, status shifts, and publisher activity velocity.
- **Trends & Analytics (`/analytics`)**:
  - Market breakdown charts: releases by publisher, format shares, top genres, and price distribution.
- **Crawler Observability & Admin Panel (`/admin`)**:
  - Source health monitoring (`HEALTHY`, `DEGRADED`, `CIRCUIT_OPEN`), polite manual "Run Now" triggers, crawl logs, and ambiguous duplicate review queue.

---

## 3. Crawler Ethics & Safety Principles

**nuvelll** strictly adheres to ethical, respectful web crawling standards:
1. **Robots.txt Compliance**: Checks rules and adheres to `Disallow` and `Crawl-delay` directives.
2. **Polite Rate Limiting**: Per-domain request queues enforce a minimum 2,000 ms delay with exponential backoff on retries.
3. **Low Concurrency**: Maximum 2 concurrent requests per domain.
4. **Transparent User-Agent**: Every request identifies itself as:
   `nuvelll-bot/1.0 (+https://nuvelll.id/crawler-policy; contact@nuvelll.id)`
5. **No Stealth or Bypass**: Never attempts to bypass CAPTCHA, authentication, paywalls, or anti-bot protections.
6. **Circuit Breaker**: Automatically trips to `CIRCUIT_OPEN` if repeated consecutive failures occur, preventing unnecessary load on source servers.

---

## 4. Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Recharts.
- **Data & Backend**: PostgreSQL, Prisma ORM, BullMQ + Redis for background jobs with transparent in-memory queue fallback.
- **Normalization & Deduplication**: Custom Unicode NFKC title normalizer, ISBN-10/13 validator, Dice bigram title similarity.
- **Testing**: Vitest, React Testing Library, JSDOM.
- **Deployment**: Docker & Docker Compose.

---

## 5. Development Setup & Commands

### Prerequisites
- Node.js 20+
- npm 10+
- (Optional) Docker & Docker Compose for running PostgreSQL and Redis

### Installation
```bash
# Clone the repository and install dependencies
npm install

# Generate Prisma Client
npx prisma generate
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Running the Application
```bash
# Start Next.js development server
npm run dev

# Run background crawler worker (BullMQ / in-memory)
npm run worker

# Run scheduled cron runner
npm run scheduler

# Scrape authentic catalog data from Gramedia API
python3 scripts/scrape-gramedia.py

# Run test suites (unit & crawler adapter tests)
npm run test

# Run build verification
npm run build
```

---

## 6. Docker Deployment

To launch the full production environment with Next.js web application, BullMQ worker, cron scheduler, PostgreSQL, and Redis:

```bash
docker compose up --build -d
```

Services:
- **Web App**: `http://localhost:3000`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **Worker & Scheduler**: background microservices running inside Docker network.

---

## 7. Development Seed Data Notice

> [!NOTE]
> All fixture data located in `src/server/db/data-service.ts` is strictly for development and demonstration purposes. In production, records are populated exclusively via verified source adapters and polite crawlers.

---

## 8. License

MIT License. Developed with high-integrity data aggregation practices for the Indonesian book reading community.

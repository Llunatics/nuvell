// Prisma Database Seeder for nuvelll

import { PrismaClient } from '@prisma/client';
import { INITIAL_SOURCES, INITIAL_PUBLISHERS, INITIAL_SERIES, INITIAL_PUBLICATIONS } from '../src/server/db/data-service';

const prisma = new PrismaClient();

async function main() {
  console.log('[nuvelll:Seed] Seeding database fixtures...');

  // 1. Seed Sources
  for (const src of INITIAL_SOURCES) {
    await prisma.source.upsert({
      where: { domain: src.domain },
      update: {},
      create: {
        id: src.id,
        name: src.name,
        slug: src.slug,
        domain: src.domain,
        baseUrl: src.baseUrl,
        type: src.type as any,
        status: src.status as any,
        robotsStatus: src.robotsStatus,
        crawlIntervalMin: src.crawlIntervalMin,
        confidenceLevel: src.confidenceLevel as any,
        notes: src.notes,
      },
    });
  }

  // 2. Seed Publishers
  for (const pub of INITIAL_PUBLISHERS) {
    await prisma.publisher.upsert({
      where: { slug: pub.slug },
      update: {},
      create: {
        id: pub.id,
        name: pub.name,
        slug: pub.slug,
        logoUrl: pub.logoUrl,
        websiteUrl: pub.websiteUrl,
        country: pub.country,
        description: pub.description,
        isOfficial: pub.isOfficial,
      },
    });
  }

  console.log('[nuvelll:Seed] Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[nuvelll:Seed] Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { MetadataRoute } from 'next';
import { dataService } from '@/server/db/data-service';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvell.id';
  const publications = dataService.getAllPublications();
  const series = dataService.getAllSeries();
  const publishers = dataService.getAllPublishers();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/publishers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/intelligence`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sources`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const bookRoutes: MetadataRoute.Sitemap = publications.map((pub) => ({
    url: `${baseUrl}/books/${pub.slug}`,
    lastModified: new Date(pub.lastSeenAt),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  const seriesRoutes: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${baseUrl}/series/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const publisherRoutes: MetadataRoute.Sitemap = publishers.map((p) => ({
    url: `${baseUrl}/publishers/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...bookRoutes, ...seriesRoutes, ...publisherRoutes];
}

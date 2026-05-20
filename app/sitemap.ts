import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://basketplace.co';

  // Get active stores to include their storefronts
  const activeStores = await prisma.store.findMany({
    where: { isActive: true },
    select: { slug: true, createdAt: true },
    take: 50000,
  });

  const storeUrls = activeStores.map((store) => ({
    url: `${baseUrl}/stores/${store.slug}`,
    lastModified: store.createdAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/create-store`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...storeUrls,
  ];
}

import type { MetadataRoute } from 'next';

import { SITE } from '@config/site';
import { getBootstrapData, getProducts } from '@lib/storefront-client';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ categories }, productsRes] = await Promise.all([
    getBootstrapData(),
    getProducts({ pageSize: 48 }),
  ]);
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE.url}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...categories
      .flatMap((c) => [c, ...c.children])
      .map((c) => ({
        url: `${SITE.url}/products?category=${c.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ...productsRes.items.map((p) => ({
      url: `${SITE.url}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${SITE.url}/track-order`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/contact`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/return-policy`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}

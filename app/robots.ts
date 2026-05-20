import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://basketplace.co';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/api/',
        '/seller/',
        '/account/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

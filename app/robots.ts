import { siteURL } from '@/lib/site-url';
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteURL();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admintgadink/', '/api/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

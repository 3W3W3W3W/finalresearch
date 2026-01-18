import { Metadata } from 'next';

export const siteConfig = {
  title: process.env.SITE_TITLE || 'Studio Portfolio',
  domain: process.env.SITE_DOMAIN || 'example.com',
  description: 'Design studio portfolio showcasing creative work',
  keywords: ['design', 'studio', 'portfolio', 'creative'],
};

export function getMetadata(): Metadata {
  return {
    title: siteConfig.title,
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    openGraph: {
      title: siteConfig.title,
      description: siteConfig.description,
      url: `https://${siteConfig.domain}`,
      type: 'website',
    },
  };
}

import { Metadata } from 'next';

export const siteConfig = {
  title: process.env.SITE_TITLE || 'FINAL RESEARCH',
  domain: process.env.SITE_DOMAIN || 'finalresearch.org',
  description: 'FINAL RESEARCH is a design studio based between Toronto and Tokyo led by Eric L. Chen and Jeremiah Sacdalan.',
  keywords: ['design', 'studio', 'portfolio', 'creative'],
};

export function getMetadata(): Metadata {
  return {
    title: siteConfig.title,
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    themeColor: '#000000',
    openGraph: {
      title: siteConfig.title,
      description: siteConfig.description,
      url: `https://${siteConfig.domain}`,
      type: 'website',
    },
  };
}

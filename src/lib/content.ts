'use server';

import {
  fetchArenaChannel,
  filterBlocksByTitle,
  ArenaBlock,
} from './arena';

export interface MainContent {
  heroText: ArenaBlock | undefined;
  heroImage: ArenaBlock | undefined;
  idleImages: ArenaBlock[];
  contact: ArenaBlock | undefined;
}

export async function getMainContent(): Promise<MainContent> {
  const channel = await fetchArenaChannel(
    process.env.ARENA_MAIN_CHANNEL || 'studio_main'
  );

  return {
    heroText: channel.blocks.find((b) => b.title === 'hero_text'),
    heroImage: channel.blocks.find((b) => b.title === 'hero_image'),
    idleImages: channel.blocks.filter((b) => b.title === 'idle_images'),
    contact: channel.blocks.find((b) => b.title === 'contact'),
  };
}

export async function getIdleImage(): Promise<ArenaBlock | null> {
  const channel = await fetchArenaChannel(
    process.env.ARENA_MAIN_CHANNEL || 'studio_main'
  );

  const idleImages = channel.blocks.filter((b) => b.title === 'idle_images');

  if (idleImages.length === 0) {
    return null;
  }

  // Return a random idle image
  return idleImages[Math.floor(Math.random() * idleImages.length)];
}

export function parseHtmlContent(html: string | null): string {
  if (!html) return '';

  // Simple HTML to text conversion, preserving links
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

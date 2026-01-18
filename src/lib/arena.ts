'use server';

export interface ImageVariant {
  url: string;
  width: number;
  height: number;
}

export interface ArenaImage {
  original: ImageVariant;
  large: ImageVariant;
  display: ImageVariant;
  thumb: ImageVariant;
}

export interface ArenaBlock {
  id: string;
  title: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  class: string;
  content: string | null;
  image: ArenaImage | null;
  source: {
    url: string;
    title: string | null;
  } | null;
  user: {
    id: string;
    slug: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_image: {
      display: ImageVariant;
      thumb: ImageVariant;
    } | null;
  } | null;
}

export interface ArenaChannel {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_count: number;
  blocks_count: number;
  blocks: ArenaBlock[];
  owner: {
    id: string;
    slug: string;
    username: string;
  };
}

interface FetchOptions {
  cache?: RequestCache;
  tags?: string[];
}

async function fetchArena(
  endpoint: string,
  options: FetchOptions = {}
): Promise<any> {
  const token = process.env.ARENA_TOKEN;

  if (!token) {
    throw new Error('ARENA_TOKEN environment variable is not set');
  }

  const url = `https://api.are.na/v2${endpoint}`;

  const fetchOptions: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: options.cache || 'default',
  };

  if (options.tags) {
    (fetchOptions as any).tags = options.tags;
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `Are.na API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error(`Failed to fetch from Are.na: ${endpoint}`, error);
    throw error;
  }
}

export async function fetchArenaChannel(
  channelSlug: string
): Promise<ArenaChannel> {
  const data = await fetchArena(`/channels/${channelSlug}`, {
    cache: 'revalidate',
    tags: [`arena-channel-${channelSlug}`],
  });

  return data;
}

export async function fetchArenaBlock(blockId: string): Promise<ArenaBlock> {
  const data = await fetchArena(`/blocks/${blockId}`, {
    cache: 'revalidate',
    tags: [`arena-block-${blockId}`],
  });

  return data;
}

export function getImageUrl(
  image: ArenaImage,
  variant: 'original' | 'large' | 'display' | 'thumb' = 'display'
): string {
  return image[variant]?.url || image.display.url;
}

export function isTextBlock(block: ArenaBlock): boolean {
  return block.class === 'Text';
}

export function isImageBlock(block: ArenaBlock): boolean {
  return block.class === 'Image';
}

export function isLinkBlock(block: ArenaBlock): boolean {
  return block.class === 'Link';
}

export function isMediaBlock(block: ArenaBlock): boolean {
  return ['Image', 'Video', 'Audio'].includes(block.class);
}

export function filterBlocksByType(
  blocks: ArenaBlock[],
  type: string
): ArenaBlock[] {
  return blocks.filter((block) => block.class === type);
}

export function filterBlocksByTitle(
  blocks: ArenaBlock[],
  title: string
): ArenaBlock[] {
  return blocks.filter((block) => block.title === title);
}

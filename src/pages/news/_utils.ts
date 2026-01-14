import { parseFeed } from 'feedsmith';
import truncate from 'just-truncate';
import { sortBy } from 'lodash-es';
import { readingTime } from 'reading-time-estimator';
import striptags from 'striptags';
import { datocms } from '~/lib/datocms';
import { graphql } from '~/lib/datocms/graphql';

const query = graphql(/* GraphQL */ `
  query Feeds {
    sources: allRssFeeds(first: 500, orderBy: title_ASC) {
      id
      title
      feedUrl
      websiteUrl
    }
  }
`);

export type FeedItem = {
  sourceId: string;
  title: string;
  date: string;
  url: string;
  description: string;
  image?: string;
  readingTimeMinutes: number;
};

function extractFirstImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const url = match?.[1];
  if (url && url.startsWith('http')) {
    return url;
  }
  return undefined;
}

export type Source = {
  id: string;
  title: string;
  feedUrl: string;
  websiteUrl: string;
};

export type FetchFeedsResult = {
  sources: Source[];
  items: FeedItem[];
  erroredSources: Source[];
  generatedAt: Date;
};

// Memoization cache for development
let cachedResult: FetchFeedsResult | null = null;

export async function fetchFeeds(): Promise<FetchFeedsResult> {
  // In development, return cached result if available
  if (import.meta.env.DEV && cachedResult) {
    console.log('Using cached feeds');
    return cachedResult;
  }

  const { sources } = await datocms(query);
  const erroredSources: Source[] = [];

  const result = await Promise.all(
    sources.map(async (source) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(source.feedUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        const text = await response.text();
        const feed = parseFeed(text);

        console.log('Parsing', source.feedUrl);

        const items: FeedItem[] = [];

        if (feed.format === 'rss') {
          for (const item of feed.feed.items || []) {
            const title = item.title || 'Untitled';
            const date = item.pubDate;
            const url = item.link;
            const rawContent = item.description || item.content?.encoded || '';
            const strippedContent = striptags(rawContent);
            const description = truncate(strippedContent, 400);
            const image = extractFirstImage(rawContent);
            const readingTimeMinutes = readingTime(strippedContent).minutes;

            if (title && date && url) {
              items.push({
                sourceId: source.id,
                title,
                date,
                url,
                description,
                image,
                readingTimeMinutes,
              });
            }
          }
        } else if (feed.format === 'atom') {
          for (const item of feed.feed.entries || []) {
            const title = item.title;
            const date = item.published || item.updated;
            const url = item.links?.[0]?.href;
            const rawContent = item.content || item.summary || '';
            const strippedContent = striptags(rawContent);
            const description = truncate(strippedContent, 400);
            const image = extractFirstImage(rawContent);
            const readingTimeMinutes = readingTime(strippedContent).minutes;

            if (title && date && url) {
              items.push({
                sourceId: source.id,
                title,
                date,
                url,
                description,
                image,
                readingTimeMinutes,
              });
            }
          }
        }

        return items;
      } catch (e) {
        erroredSources.push(source);
        console.log(`Error with ${source.feedUrl}`, e);
        return undefined;
      }
    }),
  );

  const items = sortBy(
    result.filter((r): r is FeedItem[] => r !== undefined).flat(),
    (item) => new Date(item.date),
  )
    .reverse()
    .slice(0, 250);

  const fetchResult: FetchFeedsResult = {
    sources,
    items,
    erroredSources,
    generatedAt: new Date(),
  };

  // Cache result in development
  if (import.meta.env.DEV) {
    cachedResult = fetchResult;
  }

  return fetchResult;
}

export type GroupedItem = {
  main: FeedItem;
  additional: FeedItem[];
};

/**
 * Groups items by source, keeping the first (most recent) item expanded
 * and subsequent items from the same source grouped below it.
 */
export function groupItemsBySource(items: FeedItem[]): GroupedItem[] {
  const result: GroupedItem[] = [];
  const seenSources = new Map<string, number>(); // sourceId -> index in result

  for (const item of items) {
    const existingIndex = seenSources.get(item.sourceId);

    if (existingIndex === undefined) {
      // First time seeing this source - create a new group
      seenSources.set(item.sourceId, result.length);
      result.push({ main: item, additional: [] });
    } else {
      // We've seen this source before - add to its additional items
      result[existingIndex].additional.push(item);
    }
  }

  return result;
}

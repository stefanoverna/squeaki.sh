import type { APIRoute } from 'astro';
import { fetchFeeds, groupItemsBySource } from '../_sub/utils';

const KV_KEY = 'feed-items';
const CACHE_TTL_MS = 30 * 60 * 1000;

export const prerender = false;

type CachedData = {
  sources: any[];
  groupedItems: any[];
  erroredSources: any[];
  generatedAt: string;
};

export const GET: APIRoute = async ({ locals }) => {
  const { NEWS_KV } = locals.runtime.env;

  // Try to get cached data
  const cached = await NEWS_KV.get<CachedData>(KV_KEY, 'json');

  const isStale = cached && Date.now() - new Date(cached.generatedAt).getTime() > CACHE_TTL_MS;

  // If we have cached data (even if stale), return it immediately
  if (cached) {
    console.log(
      isStale ? 'Returning stale data, refreshing in background' : 'Returning fresh cached data',
    );

    // If stale, trigger background refresh
    if (isStale) {
      locals.runtime.ctx.waitUntil(
        (async () => {
          try {
            console.log('Background refresh started');
            const { sources, items, erroredSources, generatedAt } = await fetchFeeds();
            const groupedItems = groupItemsBySource(items);

            const cacheData: CachedData = {
              sources,
              groupedItems,
              erroredSources,
              generatedAt: generatedAt.toISOString(),
            };

            await NEWS_KV.put(KV_KEY, JSON.stringify(cacheData));
            console.log('Background refresh completed');
          } catch (error) {
            console.error('Background refresh failed:', error);
          }
        })(),
      );
    }

    return new Response(
      JSON.stringify(
        {
          sources: cached.sources,
          groupedItems: cached.groupedItems,
          erroredSources: cached.erroredSources,
          generatedAt: cached.generatedAt,
        },
        null,
        2,
      ),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': isStale ? 'STALE' : 'HIT',
        },
      },
    );
  }

  // No cache at all - must fetch
  console.log('No cache found, fetching fresh feed items');
  const { sources, items, erroredSources, generatedAt } = await fetchFeeds();
  const groupedItems = groupItemsBySource(items);

  const responseData = {
    sources,
    groupedItems,
    erroredSources,
    generatedAt: generatedAt.toISOString(),
  };

  // Cache the result
  const cacheData: CachedData = {
    ...responseData,
  };

  await NEWS_KV.put(KV_KEY, JSON.stringify(cacheData));

  return new Response(JSON.stringify(responseData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'X-Cache': 'MISS',
    },
  });
};

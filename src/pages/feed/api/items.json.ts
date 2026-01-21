import type { APIRoute } from 'astro';
import {
  fetchFeeds,
  fetchSources,
  groupItemsBySource,
  type FeedItem,
  type Source,
} from '../_sub/utils';

const KV_KEY = 'feed-items';
const CACHE_TTL_MS = 30 * 60 * 1000;
const BATCH_SIZE = 3; // Number of feeds to update per refresh

export const prerender = false;

type SourceMetadata = {
  lastUpdatedAt: string;
  errorCount: number;
};

type CachedData = {
  sources: Source[];
  items: FeedItem[];
  groupedItems: any[];
  erroredSources: Source[];
  sourceMetadata: Record<string, SourceMetadata>; // sourceId -> metadata
  generatedAt: string;
};

export const GET: APIRoute = async ({ locals }) => {
  const { NEWS_KV } = locals.runtime.env;

  // Get all sources from DatoCMS
  const allSources = await fetchSources();

  // Try to get cached data
  const cached = await NEWS_KV.get<CachedData>(KV_KEY, 'json');

  // Find sources that need updating based on CACHE_TTL_MS
  const now = Date.now();
  const sourcesNeedingUpdate = cached
    ? allSources.filter((source) => {
        const metadata = cached.sourceMetadata[source.id];
        const lastUpdatedAt = metadata?.lastUpdatedAt
          ? new Date(metadata.lastUpdatedAt).getTime()
          : 0;
        return now - lastUpdatedAt > CACHE_TTL_MS;
      })
    : [];

  const hasStaleData = sourcesNeedingUpdate.length > 0;

  // If we have cached data (even if stale), return it immediately
  if (cached) {
    console.log(
      hasStaleData
        ? `Returning data, refreshing ${sourcesNeedingUpdate.length} stale sources in background`
        : 'Returning fresh cached data',
    );

    // If any sources are stale, trigger incremental background refresh
    if (hasStaleData) {
      locals.runtime.ctx.waitUntil(
        (async () => {
          try {
            console.log('Background incremental refresh started');

            // Take up to BATCH_SIZE sources that need updating
            const sourcesToUpdate = sourcesNeedingUpdate.slice(0, BATCH_SIZE);

            console.log(
              `Updating ${sourcesToUpdate.length} feeds:`,
              sourcesToUpdate.map((s) => s.title),
            );

            // Fetch only the selected sources
            const { items: newItems, erroredSources: newErroredSources } =
              await fetchFeeds(sourcesToUpdate);

            // Remove old items from these sources
            const updatedSourceIds = new Set(sourcesToUpdate.map((s: Source) => s.id));
            const remainingItems = cached.items.filter(
              (item: FeedItem) => !updatedSourceIds.has(item.sourceId),
            );

            // Merge new items with remaining items and sort by date
            const mergedItems = [...remainingItems, ...newItems]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 250);

            // Update source metadata
            const updatedMetadata = { ...cached.sourceMetadata };
            const updateTime = new Date().toISOString();

            for (const source of sourcesToUpdate) {
              const wasErrored = newErroredSources.some((s) => s.id === source.id);
              const existing = updatedMetadata[source.id];

              updatedMetadata[source.id] = {
                lastUpdatedAt: updateTime,
                errorCount: wasErrored ? (existing?.errorCount || 0) + 1 : 0,
              };
            }

            // Update errored sources list
            const remainingErroredSources = cached.erroredSources.filter(
              (s: Source) => !updatedSourceIds.has(s.id),
            );
            const mergedErroredSources = [...remainingErroredSources, ...newErroredSources];

            const groupedItems = groupItemsBySource(mergedItems);

            const cacheData: CachedData = {
              sources: allSources,
              items: mergedItems,
              groupedItems,
              erroredSources: mergedErroredSources,
              sourceMetadata: updatedMetadata,
              generatedAt: updateTime,
            };

            await NEWS_KV.put(KV_KEY, JSON.stringify(cacheData));
            console.log('Background incremental refresh completed');
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
          'X-Cache': hasStaleData ? 'STALE' : 'HIT',
        },
      },
    );
  }

  // No cache at all - initial fetch (still do batch to avoid timeout)
  console.log('No cache found, starting initial incremental fetch');

  // For initial load, just fetch first BATCH_SIZE sources
  const initialSources = allSources.slice(0, BATCH_SIZE);
  console.log(
    `Initial fetch of ${initialSources.length} feeds:`,
    initialSources.map((s) => s.title),
  );

  const { items, erroredSources } = await fetchFeeds(initialSources);
  const groupedItems = groupItemsBySource(items);

  // Initialize metadata for fetched sources
  const sourceMetadata: Record<string, SourceMetadata> = {};
  const updateTime = new Date().toISOString();
  const erroredSourceIds = new Set(erroredSources.map((s) => s.id));

  for (const source of initialSources) {
    sourceMetadata[source.id] = {
      lastUpdatedAt: updateTime,
      errorCount: erroredSourceIds.has(source.id) ? 1 : 0,
    };
  }

  const responseData = {
    sources: allSources,
    groupedItems,
    erroredSources,
    generatedAt: updateTime,
  };

  // Cache the result
  const cacheData: CachedData = {
    sources: allSources,
    items,
    groupedItems,
    erroredSources,
    sourceMetadata,
    generatedAt: updateTime,
  };

  await NEWS_KV.put(KV_KEY, JSON.stringify(cacheData));

  return new Response(JSON.stringify(responseData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'X-Cache': 'MISS',
    },
  });
};

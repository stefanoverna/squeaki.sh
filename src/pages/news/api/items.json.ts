import type { APIRoute } from 'astro';
import { fetchFeeds, groupItemsBySource } from '../_sub/utils';

export const prerender = true;

export const GET: APIRoute = async () => {
  const { sources, items, erroredSources, generatedAt } = await fetchFeeds();
  const groupedItems = groupItemsBySource(items);

  return new Response(
    JSON.stringify(
      {
        sources,
        groupedItems,
        erroredSources,
        generatedAt: generatedAt.toISOString(),
      },
      null,
      2,
    ),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
};

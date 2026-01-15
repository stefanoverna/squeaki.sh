import type { APIRoute } from 'astro';
import { PRIVATE_NEWS_TOKEN } from 'astro:env/server';
import { ErrorWithStatus, handleErrors } from '~/lib/utils/apiResponses';

const MAX_READ_ITEMS = 5000;
const KV_KEY = 'read-items';

export const prerender = false;

function validateToken(request: Request): void {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (token !== PRIVATE_NEWS_TOKEN) {
    throw new ErrorWithStatus(401, 'Invalid token');
  }
}

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    validateToken(request);

    const { NEWS_KV } = locals.runtime.env;
    const readItems = await NEWS_KV.get<string[]>(KV_KEY, 'json');

    return new Response(JSON.stringify(readItems || []), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return handleErrors(e);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    validateToken(request);

    let body: { ids: string[] };

    try {
      body = await request.json();
    } catch {
      throw new ErrorWithStatus(422, 'Invalid JSON body');
    }

    if (!Array.isArray(body.ids)) {
      throw new ErrorWithStatus(422, 'Body must contain an "ids" array');
    }

    const { NEWS_KV } = locals.runtime.env;
    const existingItems = (await NEWS_KV.get<string[]>(KV_KEY, 'json')) || [];

    // Add new IDs, avoiding duplicates
    const newIds = body.ids.filter((id) => !existingItems.includes(id));
    const updatedItems = [...newIds, ...existingItems];

    // Trim to max size (keep most recent)
    const trimmedItems = updatedItems.slice(0, MAX_READ_ITEMS);

    await NEWS_KV.put(KV_KEY, JSON.stringify(trimmedItems));

    return new Response(JSON.stringify({ success: true, count: trimmedItems.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return handleErrors(e);
  }
};

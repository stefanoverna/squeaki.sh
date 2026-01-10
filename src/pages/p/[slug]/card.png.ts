import type { APIRoute } from 'astro';
import { generateCardImage } from './_sub/cardGenerator';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  if (!params.slug) {
    return new Response('slug is required', { status: 400 });
  }

  return generateCardImage(params.slug, 'en');
};

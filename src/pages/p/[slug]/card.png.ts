import type { APIRoute } from 'astro';
import { datocms } from '~/lib/datocms';
import { BlogPostEntriesQuery } from './_sub/BlogPostPage/_graphql';
import { generateCardImage } from './_sub/cardGenerator';

export const prerender = true;

export async function getStaticPaths() {
  const { entries } = await datocms(BlogPostEntriesQuery);

  return entries.map((entry) => ({
    params: { slug: entry.slug },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  if (!params.slug) {
    return new Response('slug is required', { status: 400 });
  }

  return generateCardImage(params.slug, 'en');
};

import type { APIRoute } from 'astro';
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';
import { Feed } from 'feed';
import truncate from 'just-truncate';
import { datocms } from '~/lib/datocms';
import { readFragment } from '~/lib/datocms/graphql';
import { FeedQuery } from './_rss_graphql';
import { BlogPostFragment } from './p/[slug]/_sub/BlogPostPage/_graphql';

export const prerender = true;

export const GET: APIRoute = async () => {
  const feed = new Feed({
    title: 'squeaki.sh',
    id: 'https://squeaki.sh',
    link: 'https://squeaki.sh',
    description: `Hey! I'm Stefano, the Founder and CEO at DatoCMS. Follow my thinking on business, society, programming, and whatever else is on my mind.`,
    copyright: 'All rights reserved, Stefano Verna',
  });

  const { blogPosts } = await datocms(FeedQuery);

  for (const blogPost of blogPosts) {
    const data = readFragment(BlogPostFragment, blogPost);
    const content = data.content.value as any;

    feed.addItem({
      id: data.id,
      title: data.title,
      description: truncate(toPlainText(content) || '', 400),
      date: new Date(data._firstPublishedAt!),
      link: `https://squeaki.sh/p/${data.slug}`,
    });
  }

  const rss = feed
    .rss2()
    .replace('?>', '?><?xml-stylesheet href="/pretty-feed-v3.xsl" type="text/xsl"?>');

  return new Response(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=60',
    },
  });
};

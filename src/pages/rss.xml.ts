import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import type { APIRoute } from 'astro';
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';
import truncate from 'just-truncate';
import { datocms } from '~/lib/datocms';
import { FeedQuery } from './_rss_graphql';

export const prerender = true;

function createElement(doc: XMLDocument, name: string, textContent?: string): Element {
  const el = doc.createElement(name);
  if (textContent !== undefined) {
    el.textContent = textContent;
  }
  return el;
}

export const GET: APIRoute = async () => {
  const { blogPosts } = await datocms(FeedQuery);

  const doc = new DOMParser().parseFromString(
    '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"></rss>',
    'application/xml',
  );

  const channel = doc.createElement('channel');
  channel.appendChild(createElement(doc, 'title', 'squeaki.sh'));
  channel.appendChild(createElement(doc, 'link', 'https://squeaki.sh'));
  channel.appendChild(
    createElement(
      doc,
      'description',
      "Hey! I'm Stefano, the Founder and CEO at DatoCMS. Follow my thinking on business, society, programming, and whatever else is on my mind.",
    ),
  );
  channel.appendChild(createElement(doc, 'copyright', 'All rights reserved, Stefano Verna'));

  for (const blogPost of blogPosts) {
    const content = blogPost.content.value as any;
    const description = truncate(toPlainText(content) || '', 400);
    const pubDate = new Date(blogPost._firstPublishedAt!).toUTCString();

    const item = doc.createElement('item');
    item.appendChild(createElement(doc, 'guid', blogPost.id));
    item.appendChild(createElement(doc, 'title', blogPost.title));
    item.appendChild(createElement(doc, 'description', description));
    item.appendChild(createElement(doc, 'pubDate', pubDate));
    item.appendChild(createElement(doc, 'link', `https://squeaki.sh/p/${blogPost.slug}/`));
    channel.appendChild(item);
  }

  doc.documentElement.appendChild(channel);

  const serializer = new XMLSerializer();
  let rss = serializer.serializeToString(doc);

  rss = rss.replace('?>', '?><?xml-stylesheet href="/pretty-feed-v3.xsl" type="text/xsl"?>');

  return new Response(rss, {
    status: 200,
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=60' },
  });
};

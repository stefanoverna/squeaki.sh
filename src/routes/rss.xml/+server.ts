import datocms from '$lib/datocms';
import { getFragmentData, graphql } from '$lib/gql';
import { unwindContent } from '$lib/utils/unwindContent';
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';
import { Feed } from 'feed';
import truncate from 'just-truncate';
import { BlogPostFragment } from '../p/[slug]/fragments';
import type { RequestHandler } from './$types';
import { toContentToHtml } from './utils';

export const prerender = true;

const query = graphql(/* GraphQL */ `
	query Feed {
		blogPosts: allBlogPosts(orderBy: _firstPublishedAt_DESC) {
			...BlogPostFragment
		}
	}
`);

export const GET: RequestHandler = async () => {
	const feed = new Feed({
		title: 'squeaki.sh',
		id: 'https://squeaki.sh',
		link: 'https://squeaki.sh',
		description: `Hey! I'm Stefano, the Founder and CEO at DatoCMS. Follow my thinking on business, society, programming, and whatever else is on my mind.`,
		copyright: 'All rights reserved, Stefano Verna',
	});

	const { blogPosts } = await datocms(query);

	for (const blogPost of blogPosts) {
		const data = getFragmentData(BlogPostFragment, blogPost);
		const content = unwindContent(data.content);

		feed.addItem({
			id: data.id,
			title: data.title,
			description: truncate(toPlainText(content) || '', 400),
			content: toContentToHtml(data) || undefined,
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

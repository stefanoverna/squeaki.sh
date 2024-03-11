import { read } from '$app/server';
import datocms from '$lib/datocms';
import boldFont from '$lib/fonts/Geist-Bold.otf';
import mediumFont from '$lib/fonts/Geist-Medium.otf';
import { graphql } from '$lib/gql';
import { Resvg } from '@resvg/resvg-js';
import { RequestHandler } from '@sveltejs/kit';
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';
import { Document } from 'datocms-structured-text-utils';
import { readingTime } from 'reading-time-estimator';
import satori from 'satori';
import { html } from 'satori-html';
import { EntryGenerator } from '../$types';

const fontsPromise = Promise.all([read(boldFont).arrayBuffer(), read(mediumFont).arrayBuffer()]);

export const prerender = true;

export const entries: EntryGenerator = async () => {
	const query = graphql(/* GraphQL */ `
		query BlogPostCardEntries {
			entries: allBlogPosts(orderBy: _firstPublishedAt_DESC) {
				slug
			}
		}
	`);

	const { entries } = await datocms(query);

	return entries;
};

export const GET: RequestHandler<{ slug: string }> = async ({ params }) => {
	const query = graphql(/* GraphQL */ `
		query BlogPostCard($slug: String!) {
			blogPost(filter: { slug: { eq: $slug } }) {
				title
				content {
					value
				}
			}
		}
	`);

	const { blogPost } = await datocms(query, { slug: params.slug });

	if (!blogPost) {
		return new Response('not found', { status: 404 });
	}

	const { text } = readingTime(toPlainText(blogPost.content.value as Document) || '');

	const markup = html`
		<div
			style="display: flex; flex-direction: column; padding: 30px 40px; background: white; height: 100%; border-bottom: 10px solid #0074e4;"
		>
			<div style="display: flex">
				<span
					style="background: #d6ebff; color: #344651; text-transform: uppercase; font-size: 13px; padding: 5px; border-radius: 5px;"
				>
					${text}
				</span>
			</div>
			<div
				style="font-size: 55px; flex-grow: 1; font-weight: 800; align-items: center; letter-spacing: -0.05em; line-height: 1;"
			>
				${blogPost.title}
			</div>
			<div style="font-size: 20px; font-weight: 600; color: #0074e4; letter-spacing: -0.04em;">
				squeaki.sh
			</div>
		</div>
	`;

	const [boldFontData, mediumFontData] = await fontsPromise;

	const svg = await satori(markup, {
		width: 600,
		height: 300,
		fonts: [
			{ name: 'Geist', data: boldFontData, weight: 800 },
			{ name: 'Geist', data: mediumFontData, weight: 600 },
		],
	});

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: 1200,
		},
	});

	const png = resvg.render();

	return new Response(png.asPng(), {
		headers: {
			'content-type': 'image/png',
		},
	});
};

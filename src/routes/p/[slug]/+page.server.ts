import datocms from '$lib/datocms';
import { getFragmentData, graphql } from '$lib/gql';
import { fetchMentions } from '$lib/utils/webmentions';
import { error } from '@sveltejs/kit';
import { omit, sortBy } from 'lodash-es';
import type { EntryGenerator, PageServerLoad } from './$types';
import { BlogPostFragment } from './fragments';

export const prerender = 'auto';

export const entries: EntryGenerator = async () => {
	const query = graphql(/* GraphQL */ `
		query BlogPostEntries {
			entries: allBlogPosts(orderBy: _firstPublishedAt_DESC) {
				slug
			}
		}
	`);

	const { entries } = await datocms(query);

	return entries;
};

export const load: PageServerLoad = async ({ params }) => {
	const query = graphql(/* GraphQL */ `
		query BlogPost($slug: String!) {
			blogPost(filter: { slug: { eq: $slug } }) {
				...BlogPostFragment

				mastodonUrl
			}
		}
	`);

	const [{ blogPost }, webmentions] = await Promise.all([
		datocms(query, { slug: params.slug }),
		fetchMentions(`https://squeaki.sh/p/${params.slug}`),
	]);

	if (!blogPost) {
		return error(404, { message: 'Not found!' });
	}
	return {
		blogPost: omit(getFragmentData(BlogPostFragment, blogPost), 'webmentions'),
		mastodonUrl: blogPost.mastodonUrl,
		likes: webmentions.filter((e) => e.activity.type === 'like'),
		reposts: webmentions.filter((e) => e.activity.type === 'repost'),
		comments: sortBy(
			webmentions.filter((e) => e.activity.type === 'reply' || e.activity.type === 'link'),
			'data.published',
		),
	};
};

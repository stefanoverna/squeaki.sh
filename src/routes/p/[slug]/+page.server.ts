import datocms from '$lib/datocms';
import { graphql } from '$lib/gql';
import type { EntryGenerator, PageServerLoad } from './$types';

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

export const load: PageServerLoad = ({ params }) => {
	const query = graphql(/* GraphQL */ `
		query BlogPost($slug: String!) {
			blogPost(filter: { slug: { eq: $slug } }) {
				...BlogPostFragment
			}
		}
	`);

	return datocms(query, { slug: params.slug });
};

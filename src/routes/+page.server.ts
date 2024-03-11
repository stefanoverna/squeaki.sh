import datocms from '$lib/datocms';
import { graphql } from '$lib/gql';
import type { PageServerLoad } from './$types';

export const csr = false;
export const prerender = true;

const query = graphql(/* GraphQL */ `
	query Home {
		blogPosts: allBlogPosts(first: 100, orderBy: _firstPublishedAt_DESC) {
			id
			...BlogPostExcerptFragment
		}
	}
`);

export const load: PageServerLoad = () => {
	return datocms(query);
};

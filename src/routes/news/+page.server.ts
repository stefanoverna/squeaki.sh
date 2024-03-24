import { FeedItem } from '$lib/components/FeedItem/types';
import datocms from '$lib/datocms';
import { graphql } from '$lib/gql';
import 'global-jsdom/register';
import truncate from 'just-truncate';
import { keyBy, sortBy } from 'lodash-es';
import { Parser } from 'pulse-feed-parser';
import striptags from 'striptags';
import type { PageServerLoad } from './$types';

// export const prerender = true;
export const csr = false;

export const load: PageServerLoad = async () => {
	const query = graphql(/* GraphQL */ `
		query Feeds {
			sources: allRssFeeds {
				id
				title
				feedUrl
				websiteUrl
			}
		}
	`);

	const { sources } = await datocms(query);

	const result = await Promise.all(
		sources.map(async (source) => {
			const feed = await new Parser().parseURL(source.feedUrl);

			return feed.items
				?.map<FeedItem | undefined>((item) =>
					item.title && (item.published || item.updated) && item.link
						? {
								sourceId: source.id,
								title: item.title,
								description: truncate(striptags(item.description || item.content || ''), 400),
								date: (item.published || item.updated) as string,
								url: item.link,
							}
						: undefined,
				)
				.filter(Boolean);
		}),
	);

	const items = sortBy(result.filter(Boolean).flat(), (item) => new Date(item.date)).reverse();

	return {
		sources: keyBy(sources, 'id'),
		items: items.slice(0, 40),
	};
};

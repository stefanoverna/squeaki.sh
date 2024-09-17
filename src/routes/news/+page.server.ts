import { FeedItem } from '$lib/components/FeedItem/types';
import datocms from '$lib/datocms';
import { graphql } from '$lib/gql';
import 'global-jsdom/register';
import truncate from 'just-truncate';
import { keyBy, sortBy } from 'lodash-es';
import { Parser } from 'pulse-feed-parser';
import striptags from 'striptags';
import type { PageServerLoad } from './$types';

export const prerender = true;
export const csr = false;

export const load: PageServerLoad = async () => {
	const query = graphql(/* GraphQL */ `
		query Feeds {
			sources: allRssFeeds(first: 100) {
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
			try {
				const feed = await new Parser().parseURL(source.feedUrl);

				const items = feed.items
					?.map<FeedItem | undefined>((item) => {
						const title = item.title || item.guid;
						const date = item.published || item.updated;
						const url = item.link;
						const description = truncate(striptags(item.description || item.content || ''), 400);

						if (!(title && date && url)) {
							return undefined;
						}

						return { sourceId: source.id, title, date, url, description };
					})
					.filter(Boolean);

				console.log(source.feedUrl, items?.length || 0);

				return items;
			} catch (e) {
				console.log(`Error with ${source.feedUrl}`, e);
				throw e;
			}
		}),
	);

	const items = sortBy(result.filter(Boolean).flat(), (item) => new Date(item.date)).reverse();

	return {
		generatedAt: new Date(),
		sources: keyBy(sources, 'id'),
		items: items.slice(0, 80),
	};
};

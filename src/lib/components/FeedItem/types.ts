export type FeedItem = {
	sourceId: string;
	title: string;
	description: Maybe<string>;
	date: string;
	url: string;
};

export type Source = {
	id: string;
	title: string;
	feedUrl: string;
	websiteUrl: string;
};

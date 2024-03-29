export type Mention = {
	source: string;
	verified: boolean;
	verified_date: string;
	id: number;
	private: boolean;
	data: {
		author: {
			name: string;
			url: string | null;
			photo: string | null;
		};
		url: string;
		name: string | null;
		content: string | null;
		published: string | null;
		published_ts: number | null;
		rsvp?: 'yes' | 'no' | 'maybe';
		swarm_coins?: number;
	};
	activity: {
		type: 'repost' | 'like' | 'reply' | 'bookmark' | 'rsvp' | 'invite' | 'link';
		sentence: string;
		sentence_html: string;
	};
	relcanonical?: string;
	target: string;
};

export type Mentions = {
	links: Mention[];
};

export async function fetchMentions(targetUrl: string) {
	const url = `https://webmention.io/api/mentions.json?${new URLSearchParams({ target: targetUrl, 'per-page': '100' }).toString()}`;
	const response = await fetch(url);
	const body = (await response.json()) as Mentions;
	const mentions = body.links.filter((mention) => Boolean(mention.data.author));
	return JSON.parse(JSON.stringify(mentions).replace(/\?{4}/g, '')) as Mention[];
}

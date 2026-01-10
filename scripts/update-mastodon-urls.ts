import { buildClient } from '@datocms/cma-client';
import 'dotenv/config';
import { uniq } from 'lodash-es';

type MastodonPost = {
  url: string;
  content: string;
};

async function fetchMastodonPosts() {
  const response = await fetch(
    'https://mastodon.social/api/v1/accounts/111986074552457300/statuses?limit=30',
  );
  return (await response.json()) as MastodonPost[];
}

function findSlugs(content: string) {
  const blogPostPermalink = /https:\/\/squeaki.sh\/p\/([a-z0-9\-_]*)/g;
  return uniq([...content.matchAll(blogPostPermalink)].map((matches) => matches[1]));
}

async function run() {
  const { DATOCMS_READWRITE_API_TOKEN } = process.env;

  if (!DATOCMS_READWRITE_API_TOKEN) {
    throw new Error('Missing DATOCMS_READWRITE_API_TOKEN!');
  }

  const datoClient = buildClient({
    apiToken: DATOCMS_READWRITE_API_TOKEN,
  });

  const mastodonPosts = await fetchMastodonPosts();
  const slugToMastodonUrl: Record<string, string> = {};

  for await (const mastodonPost of mastodonPosts) {
    const slugs = findSlugs(mastodonPost.content);
    if (slugs.length === 1) {
      slugToMastodonUrl[slugs[0]] = mastodonPost.url;
    }
  }

  const blogPostIdsToRepublish: string[] = [];

  for await (const item of datoClient.items.listPagedIterator({
    filter: {
      type: 'blog_post',
      fields: {
        mastodon_url: { is_blank: true },
        _status: { neq: 'draft' },
      },
    },
  })) {
    const slug = item.slug as string;
    const mastodonUrl = slugToMastodonUrl[slug];

    if (mastodonUrl) {
      await datoClient.items.update(item, { mastodon_url: mastodonUrl });
      blogPostIdsToRepublish.push(item.id);
    }
  }

  if (blogPostIdsToRepublish.length > 0) {
    await datoClient.items.bulkPublish({
      items: blogPostIdsToRepublish.map((id) => ({ id, type: 'item' })),
    });
  }

  console.log(`Found ${blogPostIdsToRepublish.length} new Mastodon posts`);
}

run();

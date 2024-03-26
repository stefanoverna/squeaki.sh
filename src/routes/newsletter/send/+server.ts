import {
	PRIVATE_DATOCMS_READWRITE_API_TOKEN,
	PRIVATE_NEWSLETTER_SEND_API_TOKEN,
	PRIVATE_POSTMARK_SERVER_TOKEN,
} from '$env/static/private';
import datocms from '$lib/datocms';
import { getFragmentData, graphql } from '$lib/gql';
import { unwindContent } from '$lib/utils/unwindBlogPostContent';
import { ApiError, buildClient } from '@datocms/cma-client';
import { fail, type RequestHandler } from '@sveltejs/kit';
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';
import type { Models } from 'postmark';
import { baseMessage } from '../../../lib/utils/newsletter';
import { BlogPostFragment } from '../../p/[slug]/fragments';
import { toContentToHtml } from '../../rss.xml/utils';

const datoClient = buildClient({
	apiToken: PRIVATE_DATOCMS_READWRITE_API_TOKEN,
});

const query = graphql(/* GraphQL */ `
	query NewsletterSend {
		blogPosts: allBlogPosts(
			orderBy: _firstPublishedAt_ASC
			filter: { sentToNewsletter: { eq: false } }
		) {
			id
			title
			slug
			...BlogPostFragment
		}
	}
`);

async function getSubscriberEmails() {
	const result: string[] = [];

	for await (const item of datoClient.items.listPagedIterator({
		filter: { type: 'newsletter_subscriber' },
	})) {
		result.push(item.email as string);
	}

	return result;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (request.headers.get('authorization') !== `Bearer ${PRIVATE_NEWSLETTER_SEND_API_TOKEN}`) {
			return Response.json({ status: 'error', message: 'Invalid request!' }, { status: 401 });
		}

		const [emails, { blogPosts }] = await Promise.all([getSubscriberEmails(), datocms(query)]);

		const messages = blogPosts.flatMap((blogPost) => {
			const data = getFragmentData(BlogPostFragment, blogPost);
			const content = unwindContent(data.content);
			const model = {
				post_title: blogPost.title,
				post_text_content: toPlainText(content),
				post_html_content: toContentToHtml(data),
				post_url: `https://squeaki.sh/p/${blogPost.slug}`,
			};

			return emails.map<Models.TemplatedMessage>((email) => ({
				...baseMessage,

				To: email,
				TemplateAlias: 'squeakish-newsletter',
				TemplateModel: model,
			}));
		});

		if (messages.length === 0) {
			return Response.json({ status: 'success' });
		}

		const response = await fetch('https://api.postmarkapp.com/email/batchWithTemplates', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Postmark-Server-Token': PRIVATE_POSTMARK_SERVER_TOKEN,
			},
			body: JSON.stringify({
				Messages: messages,
			}),
		});

		const sentStatuses = await response.json();

		for (const blogPostId of blogPosts.map((p) => p.id)) {
			await datoClient.items.update(blogPostId, { sent_to_newsletter: true });
		}

		await datoClient.items.bulkPublish({
			items: blogPosts.map((p) => ({ id: p.id, type: 'item' })),
		});

		return Response.json({ status: 'success', result: sentStatuses });
	} catch (e) {
		fail;
		return Response.json(
			{
				status: 'error',
				details:
					e instanceof ApiError
						? e.response.body
						: e instanceof Error
							? e.message
							: JSON.stringify(e),
			},
			{ status: 500 },
		);
	}
};

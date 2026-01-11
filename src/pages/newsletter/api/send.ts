import { buildClient } from '@datocms/cma-client';
import type { APIRoute } from 'astro';
import {
  PRIVATE_DATOCMS_READWRITE_API_TOKEN,
  PRIVATE_NEWSLETTER_SEND_API_TOKEN,
  PRIVATE_POSTMARK_SERVER_TOKEN,
} from 'astro:env/server';
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';
import type { Document } from 'datocms-structured-text-utils';
import type { Models } from 'postmark';
import { BlogPostContentFragment, blogPostToHtmlString } from '~/lib/blog-post-html';
import { datocms } from '~/lib/datocms';
import { graphql } from '~/lib/datocms/graphql';
import { baseMessage } from '~/lib/utils/newsletter';

const datoClient = buildClient({
  apiToken: PRIVATE_DATOCMS_READWRITE_API_TOKEN,
});

const query = graphql(
  /* GraphQL */ `
    query NewsletterSend {
      blogPosts: allBlogPosts(
        orderBy: _firstPublishedAt_ASC
        filter: { sentToNewsletter: { eq: false } }
      ) {
        id
        title
        slug
        _locales
        _firstPublishedAt
        content {
          value
          ...BlogPostContentFragment
        }
      }
    }
  `,
  [BlogPostContentFragment],
);

async function getSubscriberEmails() {
  const result: string[] = [];

  for await (const item of datoClient.items.listPagedIterator({
    filter: { type: 'newsletter_subscriber' },
  })) {
    result.push(item.email as string);
  }

  return result;
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.headers.get('authorization') !== `Bearer ${PRIVATE_NEWSLETTER_SEND_API_TOKEN}`) {
      return new Response(JSON.stringify({ status: 'error', message: 'Invalid request!' }), {
        status: 401,
      });
    }

    const [emails, { blogPosts }] = await Promise.all([getSubscriberEmails(), datocms(query)]);

    const messages = blogPosts.flatMap((blogPost) => {
      const model = {
        post_title: blogPost.title,
        post_text_content: toPlainText(blogPost.content.value as Document),
        post_html_content: blogPostToHtmlString(blogPost.content),
        post_url: `https://squeaki.sh/p/${blogPost.slug}/`,
      };

      return emails.map<Models.TemplatedMessage>((email) => ({
        ...baseMessage,
        To: email,
        TemplateAlias: 'squeakish-newsletter',
        TemplateModel: model,
      }));
    });

    if (messages.length === 0) {
      return new Response(JSON.stringify({ status: 'success' }));
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

    for (const blogPostId of blogPosts.map((p: any) => p.id)) {
      await datoClient.items.update(blogPostId, { sent_to_newsletter: true });
    }

    await datoClient.items.bulkPublish({
      items: blogPosts.map((p: any) => ({ id: p.id, type: 'item' })),
    });

    return new Response(JSON.stringify({ status: 'success', result: sentStatuses }));
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        status: 'error',
        details: e?.response?.body || e?.message || JSON.stringify(e),
      }),
      { status: 500 },
    );
  }
};

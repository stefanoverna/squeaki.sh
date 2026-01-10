import { buildClient } from '@datocms/cma-client';
import type { APIRoute } from 'astro';
import {
  PRIVATE_DATOCMS_READWRITE_API_TOKEN,
  PRIVATE_POSTMARK_WEBHOOK_API_TOKEN,
} from 'astro:env/server';
import { ErrorWithStatus, handleErrors } from '~/lib/utils/apiResponses';
import { SUBSCRIBER_MODEL_ID } from '~/lib/utils/constants';

const client = buildClient({ apiToken: PRIVATE_DATOCMS_READWRITE_API_TOKEN });

type WebhookResponse = {
  RecordType: 'SubscriptionChange';
  SuppressSending: boolean;
  MessageStream: string;
  Recipient: string;
  Origin: string;
  SuppressionReason: 'HardBounce' | 'SpamComplaint' | 'ManualSuppression';
};

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.headers.get('authorization') !== `Bearer ${PRIVATE_POSTMARK_WEBHOOK_API_TOKEN}`) {
      throw new ErrorWithStatus(401, 'Invalid request!');
    }

    let body: WebhookResponse;

    try {
      body = (await request.json()) as WebhookResponse;
    } catch (e) {
      throw new ErrorWithStatus(422, 'Invalid request!');
    }

    if (body.SuppressSending) {
      const recipients = await client.items.list({
        filter: {
          type: SUBSCRIBER_MODEL_ID,
          fields: { email: { eq: body.Recipient } },
        },
      });

      if (recipients.length > 0) {
        await client.items.destroy(recipients[0].id);
      }
    } else {
      await client.items.create({
        email: body.Recipient,
        item_type: { type: 'item_type', id: SUBSCRIBER_MODEL_ID },
      });
    }

    return new Response(JSON.stringify({ status: 'success' }));
  } catch (e) {
    return handleErrors(e);
  }
};

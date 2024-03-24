import {
	PRIVATE_DATOCMS_READWRITE_API_TOKEN,
	PRIVATE_POSTMARK_WEBHOOK_API_TOKEN,
} from '$env/static/private';
import { ApiError, buildClient } from '@datocms/cma-client';
import { RequestHandler } from '@sveltejs/kit';
import { SUBSCRIBER_MODEL_ID } from '../subscribe/utils';

const client = buildClient({ apiToken: PRIVATE_DATOCMS_READWRITE_API_TOKEN });

type WebhookResponse = {
	RecordType: 'SubscriptionChange';
	SuppressSending: boolean;
	MessageStream: string;
	Recipient: string;
	Origin: string;
	SuppressionReason: 'HardBounce' | 'SpamComplaint' | 'ManualSuppression';
};

export const POST: RequestHandler = async ({ request }) => {
	if (request.headers.get('authorization') !== `Bearer ${PRIVATE_POSTMARK_WEBHOOK_API_TOKEN}`) {
		return Response.json({ status: 'error', message: 'Invalid request!' }, { status: 401 });
	}

	// https://postmarkapp.com/developer/webhooks/subscription-change-webhook
	let body: WebhookResponse;

	try {
		body = (await request.json()) as WebhookResponse;
	} catch (e) {
		return Response.json({ status: 'error', message: 'Invalid request!' }, { status: 422 });
	}

	try {
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
	} catch (e) {
		if (e instanceof ApiError) {
			console.log(JSON.stringify(e.errors));
		}
	}

	return Response.json({ status: 'success' });
};

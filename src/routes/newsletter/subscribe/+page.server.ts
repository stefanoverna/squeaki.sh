import {
	PRIVATE_DATOCMS_READWRITE_API_TOKEN,
	PRIVATE_POSTMARK_SERVER_TOKEN,
	PRIVATE_TURNSTILE_SECRET_KEY,
} from '$env/static/private';
import { SUBSCRIBER_MODEL_ID } from '$lib/utils/constants';
import { baseMessage } from '$lib/utils/newsletter';
import { ApiError, buildClient } from '@datocms/cma-client';
import { fail } from '@sveltejs/kit';
import type { Models } from 'postmark';
import type { Actions } from './$types';

const client = buildClient({ apiToken: PRIVATE_DATOCMS_READWRITE_API_TOKEN });

async function deleteSuppression(email: string) {
	const response = await fetch(
		'https://api.postmarkapp.com/message-streams/broadcast/suppressions/delete',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Postmark-Server-Token': PRIVATE_POSTMARK_SERVER_TOKEN,
			},
			body: JSON.stringify({
				Suppressions: [
					{
						EmailAddress: email,
					},
				],
			}),
		},
	);

	return await response.json();
}

async function sendConfirmation(email: string) {
	const message: Models.TemplatedMessage = {
		...baseMessage,
		To: email,
		TemplateAlias: 'squeakish-confirmation',
	};

	const response = await fetch('https://api.postmarkapp.com/email/withTemplate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Postmark-Server-Token': PRIVATE_POSTMARK_SERVER_TOKEN,
		},
		body: JSON.stringify(message),
	});
	return await response.json();
}

async function verifyChallenge(challenge: string, ip: string) {
	const formData = new FormData();
	formData.append('secret', PRIVATE_TURNSTILE_SECRET_KEY);
	formData.append('response', challenge);
	formData.append('remoteip', ip);

	const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		body: formData,
		method: 'POST',
	});

	const outcome = (await result.json()) as { success: boolean };

	return outcome.success;
}

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const challenge = data.get('cf-turnstile-response');
		const ip = request.headers.get('cf-connecting-ip');

		if (!email || typeof email !== 'string') {
			return fail(422, { email: '', invalid: 'email' });
		}

		if (!challenge || typeof challenge !== 'string') {
			return fail(422, { email: '', invalid: 'challenge' });
		}

		if (!ip) {
			return fail(422, { email: '', invalid: 'ip' });
		}

		if (!(await verifyChallenge(challenge, ip))) {
			return fail(422, { email: '', invalid: 'challenge-verification' });
		}

		try {
			await client.items.create({
				email: email,
				item_type: { type: 'item_type', id: SUBSCRIBER_MODEL_ID },
			});
		} catch (e) {
			if (e instanceof ApiError) {
				if (e.findError('INVALID_FIELD', { code: 'VALIDATION_UNIQUE' })) {
					return { success: true };
				}

				if (e.findError('INVALID_FIELD')) {
					console.log(e.findError('INVALID_FIELD'));
					return fail(422, { email, invalid: true });
				}
			}
		}

		const deleteSuppressionStatus = await deleteSuppression(email);
		const sentStatus = await sendConfirmation(email);

		return { success: true, info: { deleteSuppressionStatus, sentStatus } };
	},
};

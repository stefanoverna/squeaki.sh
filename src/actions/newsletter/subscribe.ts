import { ApiError, buildClient } from '@datocms/cma-client';
import { z } from 'astro/zod';
import { ActionError, defineAction } from 'astro:actions';
import {
  PRIVATE_DATOCMS_READWRITE_API_TOKEN,
  PRIVATE_POSTMARK_SERVER_TOKEN,
  PRIVATE_TURNSTILE_SECRET_KEY,
} from 'astro:env/server';
import type { Models } from 'postmark';
import { SUBSCRIBER_MODEL_ID } from '~/lib/utils/constants';
import { baseMessage } from '~/lib/utils/newsletter';

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

export const subscribe = defineAction({
  accept: 'form',
  input: z.object({
    email: z.string().email(),
    'cf-turnstile-response': z.string(),
  }),
  handler: async (input, context) => {
    const ip = context.request.headers.get('cf-connecting-ip') || context.clientAddress;

    if (!ip) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: 'Invalid IP',
      });
    }

    if (!(await verifyChallenge(input['cf-turnstile-response'], ip))) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: 'Invalid captcha',
      });
    }

    try {
      console.log(PRIVATE_DATOCMS_READWRITE_API_TOKEN);
      await client.items.create({
        email: input.email,
        item_type: { type: 'item_type', id: SUBSCRIBER_MODEL_ID },
      });
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.findError('INVALID_FIELD', { code: 'VALIDATION_UNIQUE' })) {
          // Already subscribed, but return success anyway
          return { success: true, alreadySubscribed: true };
        }

        if (e.findError('INVALID_FIELD')) {
          console.log(e.findError('INVALID_FIELD'));
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Invalid email',
          });
        }

        console.log(JSON.stringify(e.response.body, null, 2));
      }
      throw e;
    }

    const deleteSuppressionStatus = await deleteSuppression(input.email);
    const sentStatus = await sendConfirmation(input.email);

    return {
      success: true,
      info: { deleteSuppressionStatus, sentStatus },
    };
  },
});

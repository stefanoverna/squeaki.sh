import { dev } from '$app/environment';
import { PRIVATE_DATOCMS_READONLY_API_TOKEN } from '$env/static/private';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { print } from 'graphql';

type GraphQLResponse<TResult = unknown> = { errors: unknown[] } | { data: TResult };

function isValidResponse<TResult = unknown>(body: unknown): body is GraphQLResponse<TResult> {
	if (typeof body !== 'object' || !body) {
		return false;
	}

	return 'error' in body || 'data' in body;
}

export default async function datocms<TResult = unknown, TVariables = Record<string, unknown>>(
	document: TypedDocumentNode<TResult, TVariables>,
	variables?: TVariables,
): Promise<TResult> {
	const query = print(document);

	const response = await fetch('https://graphql.datocms.com/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'X-Exclude-Invalid': 'true',
			Authorization: `Bearer ${PRIVATE_DATOCMS_READONLY_API_TOKEN}`,
			...(dev ? { 'X-Include-Drafts': 'true' } : {}),
		},
		body: JSON.stringify({ query, variables }),
	});

	const body = await response.json();

	const debugStatus = `Query: ${JSON.stringify(query)}, Variables: ${JSON.stringify(
		variables,
	)}, Preview: ${dev}, Response: ${JSON.stringify(body)}`;

	if (!isValidResponse<TResult>(body)) {
		throw new Error(`Invalid response! ${debugStatus}`);
	}

	if ('errors' in body) {
		console.log(body.errors);

		throw new Error(`Response has errors! ${debugStatus}`);
	}

	return body.data;
}

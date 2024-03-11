import { dev } from '$app/environment';
import { PRIVATE_DATOCMS_READONLY_API_TOKEN } from '$env/static/private';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { print } from 'graphql';

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

	if (body.errors) {
		console.log(body.errors);

		throw `Invalid GraphQL response! Query: ${JSON.stringify(query)}, Variables: ${JSON.stringify(
			variables,
		)}, Preview: ${dev}, Response: ${JSON.stringify(body)}`;
	}

	return body.data;
}

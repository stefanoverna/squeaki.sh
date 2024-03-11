import { getFragmentData } from '$lib/gql';
import { BlogPostFragmentFragment } from '$lib/gql/graphql';
import { Document } from 'datocms-structured-text-utils';
import { BlockFragment } from '../../routes/p/[slug]/fragments';

export function unwindContent(content: BlogPostFragmentFragment['content']) {
	const contentBlocks = content.blocks.map((b) => getFragmentData(BlockFragment, b));

	return {
		value: content.value as Document,
		blocks: contentBlocks,
	};
}

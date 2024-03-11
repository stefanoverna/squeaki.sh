<script lang="ts">
	import { isBlock, type Block } from 'datocms-structured-text-utils';
	import { VideoPlayer, Image } from '@datocms/svelte';
	import { type BlockFragmentFragment } from '$lib/gql/graphql';

	export let node: Block;
	export let block: BlockFragmentFragment;

	function toNonNull<T>(x: T | undefined | null): T {
		return x!;
	}
</script>

{#if block.__typename == 'VideoRecord' && isBlock(node)}
	<div class="spacer"><VideoPlayer data={toNonNull(block.video.video)} /></div>
{:else if block.__typename == 'ImageRecord' && isBlock(node)}
	{#if block.image.responsiveImage.height / block.image.responsiveImage.width > 1}
		<div
			class="spacer"
			style:aspect-ratio={block.image.responsiveImage.width / block.image.responsiveImage.height}
			style:height="500px"
			style:position="relative"
		>
			<Image data={block.image.responsiveImage} layout="fill" />
		</div>
	{:else}
		<div class="spacer"><Image data={block.image.responsiveImage} /></div>
	{/if}
{:else}
	<div class="spacer">{block.__typename}</div>
{/if}

<style>
	.spacer {
		margin: var(--double-space) 0;
	}
</style>

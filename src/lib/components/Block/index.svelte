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
			class="spacer compact-media-preview"
			style:background-image={`url(${block.image.responsiveImage.base64})`}
		>
			<div
				class="compact-media-preview__spacer"
				style:aspect-ratio={block.image.responsiveImage.width / block.image.responsiveImage.height}
			>
				<Image data={block.image.responsiveImage} layout="fill" />
			</div>
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

	.compact-media-preview {
		background-size: cover;
		background-position: center;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10px;
		border-radius: 5px;
	}

	.compact-media-preview__spacer {
		height: 500px;
		max-height: 55vh;
		position: relative;
		box-shadow:
			0px 0px 1.8px rgba(0, 0, 0, 0.07),
			0px 0px 4.3px rgba(0, 0, 0, 0.101),
			0px 0px 8px rgba(0, 0, 0, 0.125),
			0px 0px 14.3px rgba(0, 0, 0, 0.149),
			0px 0px 26.7px rgba(0, 0, 0, 0.18),
			0px 0px 64px rgba(0, 0, 0, 0.25);
	}
</style>

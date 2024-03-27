<script lang="ts">
	import type { Mention } from '$lib/utils/webmentions';
	import MentionAuthorAvatar from '$lib/components/MentionAuthorAvatar/index.svelte';
	import { format } from 'date-fns/format';
	import striptags from 'striptags';
	import truncate from 'just-truncate';

	export let mention: Mention;

	/* eslint svelte/no-at-html-tags: "off" */
</script>

<q>
	<div>
		{@html truncate(striptags(mention.data.content || '', ['strong', 'b', 'em', 'i', 'code']), 200)}
	</div>

	<div class="footer">
		<a
			href={mention.data.url}
			rel="noopener noreferrer"
			title={mention.data.author.name}
			target="_blank"
		>
			<cite>
				<MentionAuthorAvatar author={mention.data.author} width="20" height="20" />
				{mention.data.author.name}</cite
			>
			{#if mention.data.published}
				— <time datetime={mention.data.published}>{format(mention.data.published, 'PPP')}</time>
			{/if}
		</a>
	</div>
</q>

<style>
	q {
		display: block;
		font-size: var(--font-size-small);
		margin: var(--base-space) 0;
		padding-left: 3rem;
		position: relative;
		font-weight: 300;

		&:after {
			display: none;
		}

		&:before {
			position: absolute;
			left: 0;
			top: -1rem;
			color: #ccc;
			content: '\201C';
			font-size: 6rem;
			line-height: 1;
		}
	}

	.footer {
		color: var(--color-txt--subtle);
		font-size: var(--font-size-x-small);
		margin-top: var(--half-space);
	}

	cite {
		font-style: normal;
		display: flex;
		gap: 3px;
		align-items: center;
	}

	a {
		display: flex;
		text-decoration: none;
		color: inherit;
		align-items: center;
		gap: 10px;
	}
</style>

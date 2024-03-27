<script lang="ts">
	import Bio from '$lib/components/Bio/index.svelte';
	import Block from '$lib/components/Block/index.svelte';
	import Comment from '$lib/components/Comment/index.svelte';
	import Form from '$lib/components/Form/index.svelte';
	import LikeOrRepost from '$lib/components/LikeOrRepost/index.svelte';
	import Logo from '$lib/components/Logo/index.svelte';
	import { StructuredText } from '@datocms/svelte';
	import { format } from 'date-fns/format';
	import { render as toPlainText } from 'datocms-structured-text-to-plain-text';
	import { isBlock, type Document } from 'datocms-structured-text-utils';
	import truncate from 'just-truncate';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ blogPost, mastodonUrl, likes, reposts, comments } = data);
	$: description = truncate(toPlainText(blogPost.content.value as Document) || '', 200).replace(
		/\n/g,
		'',
	);
</script>

<svelte:head>
	<title>{blogPost.title}</title>
	<meta name="description" content={description} />

	<meta property="og:title" content={blogPost.title} />
	<meta property="og:image" content="https://squeaki.sh/p/{blogPost.slug}/card.png" />
	<meta property="og:site_name" content="squeaki.sh" />
	<meta property="og:url" content="https://squeaki.sh/p/{blogPost.slug}" />
	<meta property="og:description" content={description} />

	<meta name="twitter:title" content={blogPost.title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="https://squeaki.sh/p/{blogPost.slug}/card.png" />
	<meta name="twitter:url" content="https://squeaki.sh/p/{blogPost.slug}" />
</svelte:head>

<header>
	<Logo />
</header>

<div class="h-entry">
	<article>
		<header>
			{#if blogPost._firstPublishedAt}
				<time class="dt-published" datetime={blogPost._firstPublishedAt}
					>{format(blogPost._firstPublishedAt, 'PPP')}</time
				>
			{/if}
			<h1 class="p-name">
				{blogPost.title}
			</h1>
		</header>
		<div class="post-content e-content">
			<StructuredText data={blogPost.content} components={[[isBlock, Block]]} />
		</div>
		<span style="display: none" class="p-author h-card">
			<a class="p-name u-url" href="https://squeaki.sh">Stefano Verna</a>
			<span class="p-nickname">steffoz</span>
			<img class="u-photo" src="https://squeaki.sh/photo.png" alt="Avatar" />
			<p class="p-note">
				<a href="https://www.datocms.com">DatoCMS</a> CEO
			</p>
		</span>
		<a style="display: none" class="u-url" href="https://squeaki.sh/p/{blogPost.slug}">#</a>
	</article>

	{#if mastodonUrl}
		<!-- svelte-ignore a11y-missing-content -->
		<a id="reactions" />

		<hr class="larger" />

		<div class="join">
			Join the conversation with a <a
				href={mastodonUrl}
				target="_blank"
				class="u-syndication"
				rel="syndication"
			>
				like, boost or comment on Mastodon
			</a>
		</div>
	{/if}
</div>

{#if likes.length > 0}
	<div class="reactions">
		<h5 class="reactions-title">Likes:</h5>
		{#each likes as mention}
			<LikeOrRepost {mention} />
		{/each}
	</div>
{/if}

{#if reposts.length > 0}
	<div class="reactions">
		<h5 class="reactions-title">Reposts:</h5>
		{#each reposts as mention}
			<LikeOrRepost {mention} />
		{/each}
	</div>
{/if}

{#if comments.length > 0}
	<h5 class="comments-title">Comments</h5>
	{#each comments as mention}
		<Comment {mention} />
	{/each}
{/if}

<footer>
	<hr class="larger" />
	<Bio />
	<hr />
	<Form />
</footer>

<style>
	article {
		margin-bottom: var(--double-space);
	}
	header {
		margin-bottom: var(--double-space);
		text-align: center;
	}

	time {
		display: block;
		color: var(--color-txt--subtle);
		font-size: var(--font-size-x-small);
		margin-bottom: var(--half-space);
	}

	h1 {
		font-size: var(--font-size-xx-large);
		margin: 0;
		text-wrap: balance;
	}

	footer {
		margin-top: var(--double-space);
	}

	hr.larger {
		max-width: 300px;
	}

	.join {
		text-align: center;
		margin-top: var(--double-space);
		margin-bottom: var(--double-space);
		color: var(--color-txt--subtle);
		font-size: var(--font-size-x-small);
	}

	.join a {
		color: inherit;

		&:hover {
			color: var(--color-txt);
		}
	}

	.reactions {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 3px;
		margin-bottom: var(--half-space);
	}

	.reactions-title {
		margin: 0;
		margin-right: var(--base-space);
	}

	.comments-title {
		font-size: var(--font-size-large);
		margin-top: var(--double-space);
		margin-bottom: var(--base-space);
	}
</style>

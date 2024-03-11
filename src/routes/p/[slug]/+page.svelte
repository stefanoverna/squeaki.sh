<script lang="ts">
	import type { PageServerLoad } from './$types';
	import { format } from 'date-fns/format';
	import { StructuredText } from '@datocms/svelte';
	import Block from '$lib/components/Block/index.svelte';
	import { isBlock } from 'datocms-structured-text-utils';
	import truncate from 'just-truncate';
	import { render as toPlainText } from 'datocms-structured-text-to-plain-text';
	import Form from '$lib/components/Form/index.svelte';
	import Bio from '$lib/components/Bio/index.svelte';
	import Logo from '$lib/components/Logo/index.svelte';

	export let data: PageServerLoad;

	$: ({ blogPost } = data);
	$: description = truncate(toPlainText(blogPost.content) || '', 200).replace(/\n/g, '');
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

<article>
	<header>
		{#if blogPost._firstPublishedAt}
			<time datetime={blogPost._firstPublishedAt}>{format(blogPost._firstPublishedAt, 'PPP')}</time>
		{/if}
		<h1>{blogPost.title}</h1>
	</header>
	<div class="post-content">
		<StructuredText data={blogPost.content} components={[[isBlock, Block]]} />
	</div>
</article>

<footer>
	<hr class="larger" />
	<Bio />
	<hr />
	<Form />
</footer>

<style>
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
</style>

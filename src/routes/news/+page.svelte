<script lang="ts">
	import type { PageData } from './$types';
	import FeedItem from '$lib/components/FeedItem/index.svelte';
	import { format } from 'date-fns/format';
	import { isBefore } from 'date-fns/isBefore';
	import { subHours } from 'date-fns/subHours';

	export let data: PageData;
</script>

<svelte:head>
	<title>News</title>
	<meta name="description" content="News from my favourite websites" />

	<meta property="og:title" content="News" />
	<meta property="og:site_name" content="squeaki.sh" />
	<meta property="og:description" content="News from my favourite websites" />

	<meta name="twitter:title" content="News" />
	<meta name="twitter:description" content="News from my favourite websites" />
	<meta name="twitter:card" content="summary_large_image" />

	<script type="module" src="https://unpkg.com/@joinbox/relative-time@latest"></script>
</svelte:head>

<div style={isBefore(new Date(), subHours(new Date(), 1)) ? 'color: red;' : undefined}>
	updated <relative-time data-time={data.generatedAt.toISOString()}
		>at {format(data.generatedAt, 'p')}</relative-time
	>
</div>

{#each data.items as item}
	<FeedItem source={data.sources[item.sourceId]} {item} />
{/each}

<style>
	div {
		text-align: center;
		font-size: var(--font-size-xx-small);
		color: var(--color-txt--subtle);
	}
</style>

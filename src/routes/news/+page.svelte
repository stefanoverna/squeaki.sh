<script lang="ts">
	import type { PageData } from './$types';
	import Logo from '$lib/components/Logo/index.svelte';
	import FeedItem from '$lib/components/FeedItem/index.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Feeds</title>
	<meta name="description" content="News from my favourite websites" />

	<meta property="og:title" content="Feeds" />
	<meta property="og:site_name" content="squeaki.sh" />
	<meta property="og:description" content="News from my favourite websites" />

	<meta name="twitter:title" content="Feeds" />
	<meta name="twitter:description" content="News from my favourite websites" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<header>
	<Logo text="News" />
</header>

{#each data.items as item}
	<FeedItem source={data.sources[item.sourceId]} {item} />
{/each}

<script lang="ts">
	import { differenceInDays } from 'date-fns/differenceInDays';

	import { format } from 'date-fns/format';
	import { formatRelative } from 'date-fns/formatRelative';
	import { upperFirst } from 'lodash-es';
	import { FeedItem, Source } from './types';

	export let item: FeedItem;
	export let source: Source;

	$: faviconUrl = `https://s2.googleusercontent.com/s2/favicons?${new URLSearchParams({ domain: source.websiteUrl, sz: '16' }).toString()}`;
</script>

<article>
	<header>
		<img src={faviconUrl} alt="favicon" />
		{source.title}
	</header>
	<h3>{item.title}</h3>
	{#if item.description}
		<div class="description">{item.description}</div>
	{/if}
	<time datetime={item.date}
		>{differenceInDays(new Date(), item.date) > 6
			? format(item.date, 'PPP')
			: upperFirst(formatRelative(item.date, new Date()))}</time
	>
	<a href={item.url} target="_blank">Read article</a>
</article>

<style>
	article {
		margin: var(--half-space) 0;
		padding: var(--base-space);
		border-radius: 5px;
		position: relative;
		transition: all 0.2s ease-in-out;
		overflow: hidden;

		&:hover {
			box-shadow:
				0px 0px 3.6px rgba(0, 0, 0, 0.014),
				0px 0px 10px rgba(0, 0, 0, 0.02),
				0px 0px 24.1px rgba(0, 0, 0, 0.026),
				0px 0px 80px rgba(0, 0, 0, 0.04);
		}
	}

	header {
		font-size: var(--font-size-small);
		margin: 0 0 var(--quarter-space);
		color: var(--color-txt--subtle);
	}

	h3 {
		font-size: var(--font-size-large);
		margin: 0 0 var(--quarter-space);
	}

	a {
		position: absolute;
		inset: 0;
		text-indent: -9999px;
		z-index: 1;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: 5px;

		&:visited {
			border-color: white;
		}
	}

	.description {
		font-family: var(--font-family--mono);
		font-size: var(--font-size-xx-small);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
	}

	time {
		display: block;
		color: var(--color-txt--subtle);
		font-size: var(--font-size-x-small);
		margin-top: var(--half-space);
	}
</style>

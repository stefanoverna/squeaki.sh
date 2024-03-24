<script lang="ts">
	import { differenceInDays } from 'date-fns/differenceInDays';

	import { format } from 'date-fns/format';
	import { formatRelative } from 'date-fns/formatRelative';
	import { upperFirst } from 'lodash-es';
	import type { FeedItem, Source } from './types';

	export let item: FeedItem;
	export let source: Source;

	$: faviconUrl = `https://s2.googleusercontent.com/s2/favicons?${new URLSearchParams({ domain: source.websiteUrl, sz: '16' }).toString()}`;

	/* eslint svelte/no-at-html-tags: "warn" */
</script>

<article>
	<div class="overlay" style={`background-image: url(${faviconUrl})`} />
	<div class="inner">
		<header>
			<img src={faviconUrl} alt="favicon" width="16" />
			{source.title}
		</header>
		<h3>{item.title}</h3>
		{#if item.description}
			<div class="description">{@html item.description}</div>
		{/if}
		<time datetime={item.date}
			>{differenceInDays(new Date(), item.date) > 6
				? format(item.date, 'PPP')
				: upperFirst(formatRelative(item.date, new Date()))}</time
		>
	</div>
	<a class="borders" href={item.url} target="_blank">Read article</a>
</article>

<style>
	article {
		margin: var(--base-space) 0;
		border-radius: 5px;
		transition: all 0.2s ease-in-out;
		overflow: hidden;
		position: relative;

		&:hover {
			box-shadow:
				0px 0px 3.6px rgba(var(--rgb-ink), 0.014),
				0px 0px 10px rgba(var(--rgb-ink), 0.02),
				0px 0px 24.1px rgba(var(--rgb-ink), 0.026),
				0px 0px 80px rgba(var(--rgb-ink), 0.04);
		}

		@media (min-width: 64rem) {
			margin: var(--half-space) 0;
		}
	}

	a.borders {
		position: absolute;
		inset: 0;
		border: 3px solid var(--color-txt--subtle);
		border-radius: 5px;
		text-decoration: none;
		color: inherit;
		display: block;
		text-indent: -9999px;

		&:visited {
			border-color: rgb(var(--rgb-background));
		}
	}

	.overlay {
		position: absolute;
		inset: 0;
		z-index: -1;
		opacity: 0.1;
		background-position: 50% 50%;
		background-size: cover;
	}

	.inner {
		padding: var(--base-space);
		backdrop-filter: blur(20px);
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

	.description {
		font-size: var(--font-size-x-small);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 5;
		overflow: hidden;

		@media (min-width: 40rem) {
			-webkit-line-clamp: 3;
		}
	}

	time {
		display: block;
		color: var(--color-txt--subtle);
		font-size: var(--font-size-x-small);
		margin-top: var(--half-space);
	}
</style>

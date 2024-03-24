<script lang="ts">
	import { type FragmentType, getFragmentData } from '$lib/gql';
	import { render as toPlainText } from 'datocms-structured-text-to-plain-text';
	import truncate from 'just-truncate';
	import { format } from 'date-fns/format';
	import { BlogPostExcerptFragment } from './fragments';
	import type { Document } from 'datocms-structured-text-utils';

	export let blogPost: FragmentType<typeof BlogPostExcerptFragment>;

	$: data = getFragmentData(BlogPostExcerptFragment, blogPost);
	$: content = toPlainText(data.content.value as Document) || '';
</script>

<article>
	<header>
		{#if data._firstPublishedAt}
			<time datetime={data._firstPublishedAt}>{format(data._firstPublishedAt, 'PPP')}</time>
		{/if}
		<h2>{data.title}</h2>
	</header>
	<div>{truncate(content, 400)}</div>
	<a href="/p/{data.slug}">Read more</a>
</article>

<style>
	article {
		padding: var(--base-space);
		position: relative;
		border-radius: 5px;
		top: 0;
		box-shadow:
			0px 0.5px 1.3px rgba(0, 0, 0, 0.024),
			0px 1.5px 3.6px rgba(0, 0, 0, 0.035),
			0px 3.6px 8.7px rgba(0, 0, 0, 0.046),
			0px 12px 29px rgba(0, 0, 0, 0.07);
		transition: all 0.2s ease-in-out;

		&:hover {
			top: -5px;
			box-shadow:
				0px 1.4px 1.3px rgba(0, 0, 0, 0.021),
				0px 3.8px 3.6px rgba(0, 0, 0, 0.03),
				0px 9px 8.7px rgba(0, 0, 0, 0.039),
				0px 30px 29px rgba(0, 0, 0, 0.06);
		}
	}

	@media (prefers-color-scheme: dark) {
		article {
			border: 1px solid var(--color-border);
		}
	}

	@media (min-width: 40em) {
		article {
			padding: var(--double-space);
		}
	}

	header {
		margin-bottom: var(--base-space);
		text-align: center;
	}

	time {
		display: block;
		color: var(--color-txt--subtle);
		font-size: var(--font-size-x-small);
		margin-bottom: var(--half-space);
	}

	h2 {
		font-size: var(--font-size-x-large);
		margin: 0;
		text-wrap: balance;
	}

	div {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 5; /* number of lines to show */
		line-clamp: 5;
		-webkit-box-orient: vertical;
	}

	a {
		position: absolute;
		inset: 0;
		text-indent: -9999px;
		z-index: 1;
	}
</style>

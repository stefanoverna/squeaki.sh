<script lang="ts">
	import type { PageServerLoad } from './$types';
	import Form from '$lib/components/Form/index.svelte';
	import Logo from '$lib/components/Logo/index.svelte';
	import Bio from '$lib/components/Bio/index.svelte';
	import BlogPostExcerpt from '$lib/components/BlogPostExcerpt/index.svelte';

	export let data: PageServerLoad;
</script>

<header>
	<Logo />
	<Bio />
	<hr />
	<Form />
</header>

{#each data.blogPosts as blogPost}
	<div class="blogpost-spacer">
		<BlogPostExcerpt {blogPost} />
	</div>
{/each}

<style>
	header {
		margin-bottom: var(--double-space);
	}

	.blogpost-spacer {
		margin: var(--double-space) 0;
	}
</style>

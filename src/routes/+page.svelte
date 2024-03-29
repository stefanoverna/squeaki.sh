<script lang="ts">
	import type { PageData } from './$types';
	import Form from '$lib/components/Form/index.svelte';
	import Logo from '$lib/components/Logo/index.svelte';
	import Bio from '$lib/components/Bio/index.svelte';
	import BlogPostExcerpt from '$lib/components/BlogPostExcerpt/index.svelte';

	export let data: PageData;
</script>

<header>
	<Logo />
	<Bio />
	<hr />
	<Form />
</header>

<div class="h-feed">
	<span class="p-name" style="display: none">squeaki.sh</span>

	{#each data.blogPosts as blogPost}
		<div class="blogpost-spacer">
			<BlogPostExcerpt {blogPost} />
		</div>
	{/each}

	<span class="p-author h-card" style="display: none">
		<a class="p-name u-url" href="https://squeaki.sh">Stefano Verna</a>
		<img class="u-photo" src="https://squeaki.sh/photo.png" alt="Avatar" />
		<p class="p-note">
			<a href="https://www.datocms.com">DatoCMS</a> CEO
		</p>
	</span>
</div>

<style>
	header {
		margin-bottom: var(--double-space);
	}

	.blogpost-spacer {
		margin: var(--double-space) 0;
	}
</style>

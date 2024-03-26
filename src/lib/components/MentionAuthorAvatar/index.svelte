<script lang="ts">
	import type { Mention } from '$lib/utils/webmentions';

	export let author: Mention['data']['author'];
	export let width: number | string | undefined = undefined;
	export let height: number | string | undefined = undefined;

	$: url =
		author.photo ||
		`https://ui-avatars.com/api/?${new URLSearchParams({ name: author.name, background: 'random', format: 'svg' }).toString()}`;
</script>

<img src={url} alt={author.name} {width} {height} loading="lazy" />

<style>
	img {
		display: block;
		border-radius: 100px;
	}
</style>

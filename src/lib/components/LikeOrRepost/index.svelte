<script lang="ts">
	import type { Mention } from '$lib/utils/webmentions';
	import MentionAuthorAvatar from '$lib/components/MentionAuthorAvatar/index.svelte';

	export let mention: Mention;
</script>

<a
	href={mention.data.url}
	rel="noopener noreferrer"
	title={mention.data.author.name}
	target="_blank"
>
	<MentionAuthorAvatar author={mention.data.author} width="24" height="24" />
</a>

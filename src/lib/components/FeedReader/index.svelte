<script lang="ts">
	import { type FeedsQuery } from '$lib/gql/graphql';

	export let feeds: FeedsQuery['entries'];
</script>

{JSON.stringify(feeds)}

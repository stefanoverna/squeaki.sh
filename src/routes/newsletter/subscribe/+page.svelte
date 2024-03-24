<script lang="ts">
	import Logo from '$lib/components/Logo/index.svelte';
	import Form from '$lib/components/Form/index.svelte';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<Logo />

<main>
	{#if form?.success}
		<article class="card" data-status={JSON.stringify(form?.info)}>
			<h1>Subscribed!</h1>
			<p>
				Check your email for a confirmation link. If you don't receive an email, you might already
				be a subscriber.
			</p>
		</article>
	{:else if form?.invalid}
		<h3>Please, insert a valid email!</h3>
		<Form email={form.email || undefined} />
	{:else}
		<Form />
	{/if}
</main>

<style>
	main {
		text-align: center;
		margin: 10vh 0;
	}

	.card {
		margin: 0 auto;
		overflow: initial;
		transform: rotate(-1deg);
		max-width: 45rem;
		border-radius: 5px;
		color: var(--color-txt) !important;
		box-shadow: 5px 5px 7px var(--color-shadow);
		padding: var(--base-space);
		text-align: center;
		box-shadow:
			1.2px 1.7px 4px rgba(var(--rgb-ink), 0.014),
			2.8px 4.1px 9.6px rgba(var(--rgb-ink), 0.02),
			5.3px 7.8px 18.2px rgba(var(--rgb-ink), 0.025),
			9.4px 13.8px 32.4px rgba(var(--rgb-ink), 0.03),
			17.5px 25.9px 60.6px rgba(var(--rgb-ink), 0.036),
			42px 62px 145px rgba(var(--rgb-ink), 0.05);
	}

	@media (prefers-color-scheme: dark) {
		.card {
			border: 1px solid var(--color-border);
		}
	}
</style>

<script lang="ts">
	export let email: string | undefined = undefined;
</script>

<form method="POST" action="/newsletter/subscribe">
	<div class="cf-turnstile" data-sitekey="0x4AAAAAAAy5UqG_yRwKOsY8" data-size="compact"></div>
	<label for="email">
		Subscribe to get future posts via email (or grab the <a href="/rss.xml" target="_blank"
			>RSS feed</a
		>)
	</label>
	<div class="flex">
		<input
			type="email"
			name="email"
			id="email"
			placeholder="Type your email…"
			required={true}
			value={email || ''}
		/>
		<button type="submit">Subscribe</button>
	</div>
</form>

<style>
	label {
		display: block;
		color: var(--color-txt--subtle);
		font-size: var(--font-size-x-small);
		text-align: center;
		margin: 0;
	}

	.flex {
		display: flex;
		font-size: var(--font-size-x-small);
		max-width: 40ch;
		margin-left: auto;
		margin-right: auto;
		margin-top: var(--half-space);
	}

	input {
		padding: 0.65em 1em;
		margin: 0;
		background: transparent;
		border: 1px solid var(--color-border);
		border-right-color: rgba(0, 0, 0, 0);
		border-radius: 1.5em 0 0 1.5em;
		font-size: inherit;
		color: inherit;

		&:focus {
			border: 1px solid rgba(var(--rgb-blue), 0.6);
			outline: none;
		}
	}

	button {
		all: unset;
		cursor: pointer;
		padding: 0.5em 1em;
		background: rgba(var(--rgb-blue), 0.1);
		border: 1px solid var(--color-border);
		border-left-color: rgba(0, 0, 0, 0);
		border-radius: 0 1.5em 1.5em 0;
		color: var(--color-txt--subtle);

		&:hover {
			background: rgba(var(--rgb-blue), 0.2);
		}

		&:focus {
			border: 1px solid rgba(var(--rgb-blue), 0.6);
			outline: none;
		}
	}

	a {
		color: inherit;
	}
</style>

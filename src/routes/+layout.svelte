<script lang="ts">
	import './global.css';
</script>

<svelte:head>
	<title>squeaki.sh</title>
	<meta
		name="description"
		content="I'm Stefano Verna, the Founder and CEO of DatoCMS. Here I pen down my thoughts on business, society, programming, and whatever else is on my mind."
	/>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="RSS Feed for squeaki.sh"
		href="/rss.xml"
	/>
	<link rel="me" href="https://mastodon.social/@steffoz" />
	<link rel="me" href="https://github.com/stefanoverna" />

	<link rel="webmention" href="https://webmention.io/squeaki.sh/webmention" />
	<link rel="pingback" href="https://webmention.io/squeaki.sh/xmlrpc" />
</svelte:head>

<slot />

<span class="h-card" style="display: none">
	<a class="p-name u-url" href="https://squeaki.sh">Stefano Verna</a>
	<img class="u-photo" src="https://squeaki.sh/photo.png" alt="Avatar" />
	<p class="p-note">
		<a href="https://www.datocms.com">DatoCMS</a> CEO
	</p>
</span>

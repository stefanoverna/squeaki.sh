<script lang="ts">
	import type { Code } from 'datocms-structured-text-utils';
	import { type ShjLanguage, highlightElement } from '@speed-highlight/core';
	import { onMount } from 'svelte';

	export let node: Code;

	let codeBlock: HTMLDivElement;

	onMount(() => {
		highlightElement(codeBlock, node.language as ShjLanguage, 'multiline', {
			hideLineNumbers: node.code.split(/\n/).length < 10,
		});
	});
</script>

<pre bind:this={codeBlock} class={`shj-lang-${node.language}`}><div>{node.code}</div></pre>

<style>
	/* https://github.com/speed-highlight/core/blob/main/src/themes/atom-dark.css */

	:global([class*='shj-lang-']) {
		white-space: pre;
		margin: var(--base-space) 0 var(--double-space);
		border-radius: 5px;
		padding: var(--base-space);
		padding-bottom: 0;
		color: #112;
		box-sizing: border-box;
		max-width: min(100%, 100vw);
		font-family: var(--font-family--mono);
		font-size: 0.8em;
		overflow: hidden;
	}

	:global([class*='shj-lang-']::selection, [class*='shj-lang-']::selection) {
		background: #bdf5;
	}

	:global([class*='shj-lang-'] > div) {
		display: flex;
		overflow: auto;
		padding-bottom: var(--base-space);
		scrollbar-color: #5e6979 transparent;
		scrollbar-width: thin;
	}

	:global([class*='shj-lang-'] > div :last-child) {
		flex: 1;
		outline: none;
	}

	:global(.shj-numbers) {
		padding-left: 5px;
		counter-reset: line;
	}

	:global(.shj-numbers div) {
		padding-right: 5px;
	}

	:global(.shj-numbers div:before) {
		color: #999;
		display: block;
		content: counter(line);
		opacity: 0.5;
		text-align: right;
		margin-right: 5px;
		counter-increment: line;
	}

	:global(.shj-syn-cmnt) {
		font-style: italic;
	}

	:global(.shj-syn-err, .shj-syn-kwd) {
		color: #e16;
	}

	:global(.shj-syn-num, .shj-syn-class) {
		color: #f60;
	}

	:global(.shj-numbers, .shj-syn-cmnt) {
		color: #999;
	}

	:global(.shj-syn-insert, .shj-syn-str) {
		color: #7d8;
	}

	:global(.shj-syn-bool) {
		color: #3bf;
	}

	:global(.shj-syn-type, .shj-syn-oper) {
		color: #5af;
	}

	:global(.shj-syn-section, .shj-syn-func) {
		color: #84f;
	}

	:global(.shj-syn-deleted, .shj-syn-var) {
		color: #f44;
	}

	:global(.shj-lang-http.shj-oneline .shj-syn-kwd) {
		background: #25f;
		color: #fff;
		padding: 5px 7px;
		border-radius: 5px;
	}

	:global([class*='shj-lang-']) {
		color: #abb2bf;
		background: #161b22;
	}

	:global([class*='shj-lang-']:before) {
		color: #6f9aff;
	}

	:global(.shj-syn-deleted, .shj-syn-err, .shj-syn-var) {
		color: #e06c75;
	}

	:global(.shj-syn-section, .shj-syn-oper, .shj-syn-kwd) {
		color: #c678dd;
	}

	:global(.shj-syn-class) {
		color: #e5c07b;
	}

	:global(.shj-numbers, .shj-syn-cmnt) {
		color: #76839a;
	}

	:global(.shj-syn-insert) {
		color: #98c379;
	}

	:global(.shj-syn-type) {
		color: #56b6c2;
	}

	:global(.shj-syn-num, .shj-syn-bool) {
		color: #d19a66;
	}

	:global(.shj-syn-str, .shj-syn-func) {
		color: #61afef;
	}
</style>

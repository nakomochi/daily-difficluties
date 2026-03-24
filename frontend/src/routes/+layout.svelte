<script lang="ts">
import "../app.css";
let { children } = $props();
</script>

<svelte:head>
	<title>Daily Difficulties</title>
</svelte:head>

<div class="layout">
	{@render children()}
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		width: 100dvw;
		height: 100dvh;
		background: #000;
		overflow: hidden;
	}
</style>

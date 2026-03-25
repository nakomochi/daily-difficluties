<script lang="ts">
import "../app.css";
import Toast from "$lib/Toast.svelte";

let { children } = $props();
</script>

<svelte:head>
	<title>Daily Difficulties</title>
</svelte:head>

<div class="layout">
	{@render children()}
</div>
<Toast />

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

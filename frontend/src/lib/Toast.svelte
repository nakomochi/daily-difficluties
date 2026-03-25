<script lang="ts">
import { toasts } from "./toast.svelte";
</script>

{#if toasts.length > 0}
	<div class="toast-container">
		{#each toasts as t (t.id)}
			<div class="alert alert-{t.type} alert-sm shadow">
				<span>{t.message}</span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		pointer-events: none;
	}

	.toast-container :global(.alert) {
		pointer-events: auto;
		min-width: 12rem;
	}
</style>

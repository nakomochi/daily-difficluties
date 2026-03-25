<script lang="ts">
import Game from "$lib/game/Game.svelte";

let { data } = $props();
</script>

{#if data.stage}
	<Game stageData={data.stage.data} />
{:else}
	<div class="no-stage">
		<p>本日のステージはまだ設定されていません</p>
	</div>
{/if}

<style>
	.no-stage {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		color: white;
		font-size: 1.25rem;
	}
</style>

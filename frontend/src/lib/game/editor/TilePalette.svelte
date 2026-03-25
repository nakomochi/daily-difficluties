<script lang="ts">
import { onMount } from "svelte";
import { COLOR_BG, drawTile } from "../renderer";
import { TILE_SIZE, Tile } from "../types";
import type { EditorState } from "./editor-state.svelte";
import { PALETTE_TILES } from "./tile-palette-data";

let { editorState }: { editorState: EditorState } = $props();

let previewElements: HTMLCanvasElement[] = $state([]);

onMount(() => {
	for (let i = 0; i < PALETTE_TILES.length; i++) {
		const { tile } = PALETTE_TILES[i];
		const el = previewElements[i];
		if (!el) continue;
		el.width = TILE_SIZE;
		el.height = TILE_SIZE;
		const ctx = el.getContext("2d");
		if (!ctx) continue;

		if (tile === Tile.Empty) {
			ctx.fillStyle = COLOR_BG;
			ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
			ctx.strokeStyle = "#ff4444";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(4, 4);
			ctx.lineTo(TILE_SIZE - 4, TILE_SIZE - 4);
			ctx.moveTo(TILE_SIZE - 4, 4);
			ctx.lineTo(4, TILE_SIZE - 4);
			ctx.stroke();
		} else {
			ctx.fillStyle = COLOR_BG;
			ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
			drawTile(ctx, tile, 0, 0);
		}
	}
});
</script>

<div class="tile-palette">
	<h3 class="text-xs font-bold text-base-content/70 mb-1 uppercase">Tiles</h3>
	<div class="grid grid-cols-3 gap-1">
		{#each PALETTE_TILES as { tile, label, key }, i}
			<button
				type="button"
				class="btn btn-sm btn-ghost p-1 flex flex-col items-center gap-0.5"
				class:btn-active={editorState.selectedTile === tile}
				onclick={() => (editorState.selectedTile = tile)}
				title="{label} ({key})"
			>
				<canvas
					bind:this={previewElements[i]}
					class="w-6 h-6"
					style="image-rendering: pixelated;"
				></canvas>
				<span class="text-[10px] leading-tight">{key}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.tile-palette {
		padding: 0.5rem;
	}
</style>

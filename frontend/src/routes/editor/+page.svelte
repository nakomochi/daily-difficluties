<script lang="ts">
import { onMount } from "svelte";
import EditorCanvas from "$lib/game/editor/EditorCanvas.svelte";
import EditorToolbar from "$lib/game/editor/EditorToolbar.svelte";
import { EditorState } from "$lib/game/editor/editor-state.svelte";
import TilePalette from "$lib/game/editor/TilePalette.svelte";
import { TILE_BY_KEY } from "$lib/game/editor/tile-palette-data";
import Game from "$lib/game/Game.svelte";

let { data } = $props();
let mode: "edit" | "playtest" = $state("edit");
const editorState = new EditorState();

function startPlaytest() {
	mode = "playtest";
}

function backToEditor() {
	mode = "edit";
}

function onKeydown(e: KeyboardEvent) {
	if (mode === "playtest") {
		if (e.key === "Escape") {
			e.preventDefault();
			backToEditor();
		}
		return;
	}

	if (e.ctrlKey || e.metaKey) {
		if (e.key === "z" && !e.shiftKey) {
			e.preventDefault();
			editorState.undo();
		} else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
			e.preventDefault();
			editorState.redo();
		}
		return;
	}

	if (e.key in TILE_BY_KEY) {
		editorState.selectedTile = TILE_BY_KEY[e.key];
	}
}

onMount(() => {
	window.addEventListener("keydown", onKeydown);
	return () => window.removeEventListener("keydown", onKeydown);
});
</script>

{#if mode === "edit"}
	<div class="editor-layout">
		<EditorToolbar {editorState} onPlaytest={startPlaytest} dbStages={data.dbStages} schedule={data.schedule} />
		<div class="editor-main">
			<aside class="editor-sidebar">
				<TilePalette {editorState} />
			</aside>
			<div class="editor-canvas-area">
				<EditorCanvas {editorState} />
			</div>
		</div>
	</div>
{:else}
	<div class="playtest-layout">
		<div class="playtest-bar">
			<button type="button" class="btn btn-sm btn-warning" onclick={backToEditor}>
				Back to Editor (ESC)
			</button>
		</div>
		<Game stageData={editorState.tiles} />
	</div>
{/if}

<style>
	.editor-layout {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	.editor-main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.editor-sidebar {
		width: 8rem;
		background: oklch(var(--b2));
		overflow-y: auto;
		flex-shrink: 0;
	}

	.editor-canvas-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000;
		overflow: hidden;
	}

	.playtest-layout {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	.playtest-bar {
		padding: 0.5rem;
		background: oklch(var(--b2));
	}
</style>

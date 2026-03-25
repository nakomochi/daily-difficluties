<script lang="ts">
import { onMount } from "svelte";
import { SCREEN_HEIGHT, SCREEN_WIDTH, TILE_SIZE } from "../types";
import { renderEditor } from "./editor-renderer";
import type { EditorState } from "./editor-state.svelte";

let { editorState }: { editorState: EditorState } = $props();

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null = null;
let rafId = 0;

function getGridPos(e: MouseEvent): { col: number; row: number } {
	const rect = canvas.getBoundingClientRect();
	const scaleX = SCREEN_WIDTH / rect.width;
	const scaleY = SCREEN_HEIGHT / rect.height;
	const col = Math.floor((e.clientX - rect.left) * scaleX / TILE_SIZE);
	const row = Math.floor((e.clientY - rect.top) * scaleY / TILE_SIZE);
	return { col, row };
}

function onMouseMove(e: MouseEvent) {
	const { col, row } = getGridPos(e);
	editorState.hoverCol = col;
	editorState.hoverRow = row;

	if (editorState.isDragging) {
		editorState.placeTile(col, row);
	}
}

function onMouseDown(e: MouseEvent) {
	if (e.button !== 0) return;
	const { col, row } = getGridPos(e);
	editorState.startDrag();
	editorState.placeTile(col, row);
}

function onMouseUp() {
	if (editorState.isDragging) {
		editorState.endDrag();
	}
}

function onMouseLeave() {
	editorState.hoverCol = -1;
	editorState.hoverRow = -1;
	if (editorState.isDragging) {
		editorState.endDrag();
	}
}

function loop() {
	if (ctx) {
		renderEditor(ctx, editorState);
	}
	rafId = requestAnimationFrame(loop);
}

onMount(() => {
	canvas.width = SCREEN_WIDTH;
	canvas.height = SCREEN_HEIGHT;
	ctx = canvas.getContext("2d");
	rafId = requestAnimationFrame(loop);

	window.addEventListener("mouseup", onMouseUp);
	return () => {
		cancelAnimationFrame(rafId);
		window.removeEventListener("mouseup", onMouseUp);
	};
});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<canvas
	bind:this={canvas}
	class="editor-canvas"
	onmousemove={onMouseMove}
	onmousedown={onMouseDown}
	onmouseleave={onMouseLeave}
	ondragstart={(e) => e.preventDefault()}
	oncontextmenu={(e) => e.preventDefault()}
></canvas>

<style>
	.editor-canvas {
		image-rendering: pixelated;
		cursor: crosshair;
		max-width: 100%;
		max-height: 100%;
	}
</style>

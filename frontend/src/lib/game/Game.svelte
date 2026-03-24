<script lang="ts">
import { onMount } from "svelte";
import { Engine } from "./engine";
import type { StageData } from "./types";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./types";

let { stageData }: { stageData: StageData } = $props();

let canvas: HTMLCanvasElement;
let container: HTMLDivElement;
let engine: Engine | null = null;

function updateScale() {
	if (!container || !canvas) return;
	const parent = container;
	const scaleX = parent.clientWidth / SCREEN_WIDTH;
	const scaleY = parent.clientHeight / SCREEN_HEIGHT;
	const scale = Math.min(scaleX, scaleY);
	canvas.style.width = `${SCREEN_WIDTH * scale}px`;
	canvas.style.height = `${SCREEN_HEIGHT * scale}px`;
}

function toggleFullscreen() {
	if (!document.fullscreenElement) {
		container.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
}

onMount(() => {
	engine = new Engine(canvas, stageData);
	engine.start();
	updateScale();

	const observer = new ResizeObserver(updateScale);
	observer.observe(container);

	function onKeydown(e: KeyboardEvent) {
		if (e.key === "F11") {
			e.preventDefault();
			toggleFullscreen();
		}
	}
	window.addEventListener("keydown", onKeydown);

	return () => {
		engine?.stop();
		observer.disconnect();
		window.removeEventListener("keydown", onKeydown);
	};
});
</script>

<div
	bind:this={container}
	class="game-container"
>
	<canvas
		bind:this={canvas}
		class="game-canvas"
	></canvas>
</div>

<style>
	.game-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000;
		flex: 1;
	}

	.game-canvas {
		image-rendering: pixelated;
	}
</style>

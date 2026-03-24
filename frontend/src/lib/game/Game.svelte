<script lang="ts">
import { onMount } from "svelte";
import { Engine } from "./engine";
import { SCREEN_HEIGHT, SCREEN_WIDTH, type StageData } from "./types";

let { stageData }: { stageData: StageData } = $props();

let canvas: HTMLCanvasElement;
let container: HTMLDivElement;

function updateScale() {
	if (!container || !canvas) return;
	const scaleX = container.clientWidth / SCREEN_WIDTH;
	const scaleY = container.clientHeight / SCREEN_HEIGHT;
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
		observer.disconnect();
		window.removeEventListener("keydown", onKeydown);
	};
});

$effect(() => {
	if (!canvas) return;
	const e = new Engine(canvas, stageData);
	e.start();
	return () => e.stop();
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

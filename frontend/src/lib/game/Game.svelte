<script lang="ts">
import { browser } from "$app/environment";
import { onMount } from "svelte";
import { Engine, type EngineOptions, type FrameInfo } from "./engine";
import { getRecord, saveRecord, type DayRecord } from "./records";
import ResultOverlay from "./ResultOverlay.svelte";
import SidePanel from "./SidePanel.svelte";
import StartOverlay from "./StartOverlay.svelte";
import { SCREEN_HEIGHT, SCREEN_WIDTH, type StageData } from "./types";

let {
	stageData,
	date = "",
}: {
	stageData: StageData;
	date?: string;
} = $props();

let canvas: HTMLCanvasElement;
let container: HTMLDivElement;
let canvasArea: HTMLDivElement;

const showStartScreen = $derived(!!date);
let started = $state(false);
let clearResult: { time: number; deaths: number; isNewBest: boolean } | null = $state(null);
let gameKey = $state(0);
let frameInfo: FrameInfo = $state({ deaths: 0, elapsedMs: 0, cleared: false });
let lastFrameSnapshot = { deaths: 0, elapsedMs: 0, cleared: false };
let record: DayRecord | null = $state(initRecord());

function initRecord(): DayRecord | null {
	return browser && date ? getRecord(date) : null;
}

function updateScale() {
	if (!canvasArea || !canvas) return;
	const scaleX = canvasArea.clientWidth / SCREEN_WIDTH;
	const scaleY = canvasArea.clientHeight / SCREEN_HEIGHT;
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

function handleClear(result: { time: number; deaths: number }) {
	if (date) {
		const { isNewBest } = saveRecord(date, result.time, result.deaths);
		clearResult = { ...result, isNewBest };
		record = getRecord(date);
	} else {
		clearResult = { ...result, isNewBest: false };
	}
}

function handleRestart() {
	clearResult = null;
	gameKey++;
}

onMount(() => {
	const observer = new ResizeObserver(updateScale);
	observer.observe(canvasArea);

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
	void gameKey;
	const options: EngineOptions = {
		onClear: handleClear,
		onFrame: (info) => {
			const rounded = Math.floor(info.elapsedMs / 100) * 100;
			if (rounded !== lastFrameSnapshot.elapsedMs || info.deaths !== lastFrameSnapshot.deaths || info.cleared !== lastFrameSnapshot.cleared) {
				lastFrameSnapshot = { deaths: info.deaths, elapsedMs: rounded, cleared: info.cleared };
				frameInfo = lastFrameSnapshot;
			}
		},
	};
	const e = new Engine(canvas, stageData, options);
	updateScale();
	if (started || !showStartScreen) {
		e.start();
	} else {
		e.renderOnce();
	}
	return () => e.stop();
});
</script>

<div
	bind:this={container}
	class="game-container"
>
	{#if showStartScreen}
		<SidePanel {date} {frameInfo} {record} />
	{/if}
	<div bind:this={canvasArea} class="canvas-area">
		<canvas
			bind:this={canvas}
			class="game-canvas"
			class:blur-sm={showStartScreen && !started}
		></canvas>
		{#if showStartScreen && !started}
			<StartOverlay {date} onStart={() => (started = true)} />
		{/if}
		{#if clearResult}
			<ResultOverlay
				time={clearResult.time}
				deaths={clearResult.deaths}
				isNewBest={clearResult.isNewBest}
				onRestart={handleRestart}
			/>
		{/if}
	</div>
</div>

<style>
	.game-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: stretch;
		background: #000;
		flex: 1;
	}

	.canvas-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		position: relative;
	}

	.game-canvas {
		width: 0;
		height: 0;
		image-rendering: pixelated;
	}
</style>

<script lang="ts">
import type { FrameInfo } from "./engine";
import { type DayRecord, formatTime } from "./records";
import { shareResult } from "./share";

let {
	date,
	frameInfo,
	record,
}: {
	date: string;
	frameInfo: FrameInfo;
	record: DayRecord | null;
} = $props();
</script>

<div class="side-panel hidden w-56 shrink-0 select-none flex-col gap-4 p-4 lg:flex">
	<div>
		<h2 class="text-base-content/40 text-xs font-bold uppercase tracking-wider">Daily Difficulties</h2>
		<p class="text-base-content/60 font-mono text-sm">{date}</p>
	</div>

	<div class="space-y-1">
		<div class="text-base-content/40 text-xs font-bold uppercase tracking-wider">Current</div>
		<div class="flex justify-between font-mono text-sm">
			<span class="text-base-content/60">Time</span>
			<span>{formatTime(frameInfo.elapsedMs)}</span>
		</div>
		<div class="flex justify-between font-mono text-sm">
			<span class="text-base-content/60">Deaths</span>
			<span>{frameInfo.deaths}</span>
		</div>
	</div>

	<div class="space-y-1">
		<div class="text-base-content/40 text-xs font-bold uppercase tracking-wider">Best</div>
		<div class="flex justify-between font-mono text-sm">
			<span class="text-base-content/60">Time</span>
			<span class="text-success">{record?.best ? formatTime(record.best.time) : "—"}</span>
		</div>
	</div>

	<button type="button" class="btn btn-outline btn-sm w-full" disabled={!record?.first} onclick={() => shareResult(date, record!.first!.time, record!.first!.deaths)}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
		Share
	</button>

	<div class="mt-auto space-y-1">
		<div class="text-base-content/40 text-xs font-bold uppercase tracking-wider">Controls</div>
		<div class="text-base-content/60 space-y-0.5 font-mono text-xs">
			<p>←→ / A D : Move</p>
			<p>↑ / Space / W / Z : Jump</p>
			<p class="text-base-content/40 ml-4">double jump OK</p>
			<p>R : Restart</p>
			<p>F11 : Fullscreen</p>
		</div>
	</div>
</div>

<style>
	.side-panel {
		color: #ccc;
	}
</style>

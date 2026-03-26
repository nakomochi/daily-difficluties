<script lang="ts">
import { formatTime } from "./records";
import ShareButton from "./ShareButton.svelte";
import { shareResult } from "./share";

let {
	date,
	time,
	deaths,
	isNewBest,
	onRestart,
}: {
	date: string;
	time: number;
	deaths: number;
	isNewBest: boolean;
	onRestart: () => void;
} = $props();
</script>

<div class="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
	<div class="card bg-base-200 w-96 shadow-xl">
		<div class="card-body items-center text-center">
			<h1 class="text-success text-3xl font-bold">CLEAR!</h1>

			{#if isNewBest}
				<div class="badge badge-warning badge-lg mt-1">NEW BEST!</div>
			{/if}

			<div class="mt-3 w-full space-y-2 text-lg">
				<div class="flex justify-between">
					<span class="text-base-content/60">Time</span>
					<span class="font-mono font-bold">{formatTime(time)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-base-content/60">Deaths</span>
					<span class="font-mono font-bold">{deaths}</span>
				</div>
			</div>

			<div class="mt-4 flex w-full gap-2">
				<button class="btn btn-primary flex-1" onclick={onRestart}>
					RESTART
				</button>
				<ShareButton onclick={() => shareResult(date, time, deaths)} disabled={!date} />
			</div>
		</div>
	</div>
</div>

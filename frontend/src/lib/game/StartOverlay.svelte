<script lang="ts">
import { browser } from "$app/environment";
import { type DayRecord, formatTime, getRecord } from "./records";
import ShareButton from "./ShareButton.svelte";
import { shareResult } from "./share";

let { date, onStart }: { date: string; onStart: () => void } = $props();

let record: DayRecord | null = $derived(browser ? getRecord(date) : null);
</script>

<div class="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
	<div class="card bg-base-200 w-96 shadow-xl">
		<div class="card-body items-center text-center">
			<h1 class="card-title text-2xl font-bold">Daily Difficulties</h1>
			<p class="text-base-content/60 font-mono text-sm">{date}</p>

			<div class="mt-2 w-full space-y-1 text-sm">
				<div class="flex justify-between">
					<span class="text-base-content/60">First clear</span>
					<span>{record?.first ? `${formatTime(record.first.time)} / ${record.first.deaths} deaths` : "—"}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-base-content/60">Best time</span>
					<span class="text-success">{record?.best ? formatTime(record.best.time) : "—"}</span>
				</div>
			</div>

			<div class="bg-base-300 mt-4 w-full rounded-lg p-3 text-left font-mono text-xs">
				<p>←→ / A D : Move</p>
				<p>↑ / Space / W / Z : Jump</p>
				<p class="text-base-content/60 ml-4">double jump OK</p>
				<p>R : Restart</p>
			</div>

			<div class="mt-4 flex w-full gap-2">
				<button type="button" class="btn btn-primary flex-1" onclick={onStart}>
					START
				</button>
				<ShareButton onclick={() => shareResult(date, record!.first!.time, record!.first!.deaths)} disabled={!record?.first} />
			</div>
		</div>
	</div>
</div>

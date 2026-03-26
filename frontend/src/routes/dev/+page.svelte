<script lang="ts">
import Game from "$lib/game/Game.svelte";
import { STAGES } from "$lib/game/stages";
import type { StageData } from "$lib/game/types";

let { data } = $props();

type Source = { kind: "local"; index: number } | { kind: "db"; id: number };

let source: Source = $state({ kind: "local", index: 0 });
let dbStageData: StageData | null = $state(null);
let loading = $state(false);

let currentStageData: StageData | undefined = $derived.by(() => {
	if (source.kind === "local") {
		return STAGES[source.index]?.data;
	}
	return dbStageData ?? undefined;
});

async function selectDbStage(id: number) {
	source = { kind: "db", id };
	loading = true;
	dbStageData = null;
	try {
		const res = await fetch(`/api/stages/${id}`);
		if (!res.ok) throw new Error("failed to fetch");
		const stage = await res.json();
		dbStageData = stage.data;
	} catch {
		dbStageData = null;
	} finally {
		loading = false;
	}
}

function selectLocalStage(index: number) {
	source = { kind: "local", index };
	dbStageData = null;
}

function currentLabel(): string {
	if (source.kind === "local") {
		const s = STAGES[source.index];
		return s?.name ?? s?.id ?? "Local";
	}
	const dbId = source.id;
	const db = data.dbStages.find((s: { id: number }) => s.id === dbId);
	return db?.name || `DB #${dbId}`;
}
</script>

<div class="stage-selector">
	<div class="dropdown">
		<div tabindex="-1" role="button" class="btn btn-sm btn-ghost">
			{currentLabel()}
		</div>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div tabindex="0" class="dropdown-content bg-base-200 rounded-box z-10 p-2 shadow dropdown-panel">
			<div class="panel-columns">
				<div class="panel-column">
					<div class="panel-title">Local</div>
					<ul class="menu menu-sm">
						{#each STAGES as stage, i}
							<li>
								<button
									type="button"
									class:active={source.kind === "local" && source.index === i}
									onclick={(e) => { selectLocalStage(i); (e.currentTarget as HTMLElement).blur(); }}
								>
									{stage.name ?? stage.id}
								</button>
							</li>
						{/each}
					</ul>
				</div>

				{#if data.dbStages.length > 0}
					<div class="panel-column">
						<div class="panel-title">DB</div>
						<ul class="menu menu-sm">
							{#each data.dbStages as stage}
								<li>
									<button
										type="button"
										class:active={source.kind === "db" && source.id === stage.id}
										onclick={(e) => { selectDbStage(stage.id); (e.currentTarget as HTMLElement).blur(); }}
									>
										{stage.name || `#${stage.id}`}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if loading}
	<div class="loading-overlay">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if currentStageData}
	<Game stageData={currentStageData} />
{:else}
	<div class="error-message">
		<p>Failed to load stage data.</p>
	</div>
{/if}

<style>
	.stage-selector {
		position: fixed;
		top: 0.5rem;
		left: 0.5rem;
		z-index: 50;
	}

	.dropdown-panel {
		max-height: 80vh;
		overflow: hidden;
	}

	.panel-columns {
		display: flex;
		gap: 0.5rem;
	}

	.panel-column {
		min-width: 10rem;
		max-height: 70vh;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.panel-title {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		opacity: 0.5;
		padding: 0.25rem 0.5rem;
	}

	.loading-overlay {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	.error-message {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		color: white;
	}
</style>

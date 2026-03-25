<script lang="ts">
import type { ScheduleEntry } from "$lib/server/api";
import { toast } from "$lib/toast.svelte";
import { STAGES } from "../stages";
import type { DbStageSummary, EditorState } from "./editor-state.svelte";

let {
	editorState,
	onPlaytest,
	dbStages = [],
	schedule = [],
}: {
	editorState: EditorState;
	onPlaytest: () => void;
	dbStages?: DbStageSummary[];
	schedule?: ScheduleEntry[];
} = $props();

let saving = $state(false);
let assignDate = $state("");
let showSchedule = $state(false);

async function handleSave() {
	saving = true;
	const result = await editorState.saveToServer();
	saving = false;
	if (result) {
		toast("Saved", "success");
	} else {
		toast("Failed to save", "error");
	}
}

async function handleSaveAs() {
	saving = true;
	const result = await editorState.saveAsNew();
	saving = false;
	if (result) {
		dbStages = [...dbStages, { id: result.id, name: editorState.currentName }];
		toast(`Saved as "${editorState.currentName || `#${result.id}`}"`, "success");
	} else {
		toast("Failed to save", "error");
	}
}

function handlePlaytest() {
	if (!editorState.hasPlayerStart()) {
		toast("PlayerStart tile is required", "error");
		return;
	}
	onPlaytest();
}

async function handleAssign() {
	if (!assignDate || !editorState.currentDbId) {
		toast("Save the stage first and select a date", "error");
		return;
	}
	const stageId = editorState.currentDbId;
	const date = assignDate;
	const name = editorState.currentName;

	const existing = schedule.findIndex((e) => e.date === date);
	const prev = existing >= 0 ? { ...schedule[existing] } : null;
	if (existing >= 0) {
		schedule[existing] = { date, stage_id: stageId, name };
	} else {
		schedule = [...schedule, { date, stage_id: stageId, name }].sort(
			(a, b) => a.date.localeCompare(b.date),
		);
	}
	toast(`Assigned to ${date}`, "success");

	const res = await fetch(`/api/schedule/${date}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ stage_id: stageId }),
	});
	if (!res.ok) {
		if (prev) {
			const idx = schedule.findIndex((e) => e.date === date);
			if (idx >= 0) schedule[idx] = prev;
		} else {
			schedule = schedule.filter((e) => e.date !== date);
		}
		toast("Failed to assign", "error");
	}
}

async function handleUnassign(index: number) {
	const entry = schedule[index];
	schedule = schedule.filter((_, j) => j !== index);
	toast(`Removed ${entry.date}`, "success");

	const res = await fetch(`/api/schedule/${entry.date}`, { method: "DELETE" });
	if (!res.ok) {
		schedule = [...schedule, entry].sort((a, b) => a.date.localeCompare(b.date));
		toast("Failed to remove", "error");
	}
}

function closeDropdown(e: MouseEvent) {
	const target = e.currentTarget as HTMLElement | null;
	target?.closest(".dropdown")
		?.querySelector<HTMLElement>('[role="button"]')
		?.blur();
}
</script>

<div class="toolbar">
	<button type="button" class="btn btn-sm" onclick={() => editorState.createNew()}>
		New
	</button>

	<div class="dropdown">
		<div tabindex="-1" role="button" class="btn btn-sm">Load</div>
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
									onclick={(e) => { editorState.loadStage(i); closeDropdown(e); }}
								>
									{stage.name ?? stage.id}
								</button>
							</li>
						{/each}
					</ul>
				</div>

				{#if dbStages.length > 0}
					<div class="panel-column">
						<div class="panel-title">DB</div>
						<div class="db-list">
							{#each dbStages as stage, i}
								<div class="db-row">
									<button
										type="button"
										class="db-stage-load"
										onclick={(e) => { closeDropdown(e); editorState.loadFromServer(stage.id); }}
									>
										{stage.name || `#${stage.id}`}
									</button>
									<button
										type="button"
										class="db-stage-delete"
										onclick={async () => {
											if (!confirm(`Delete "${stage.name || `#${stage.id}`}"?`)) return;
											const res = await fetch(`/api/stages/${stage.id}`, { method: "DELETE" });
											if (res.ok) {
												dbStages = dbStages.filter((_, j) => j !== i);
												if (editorState.currentDbId === stage.id) editorState.currentDbId = null;
												toast(`Deleted "${stage.name || `#${stage.id}`}"`, "success");
											} else {
												toast("Failed to delete (may be in schedule)", "error");
											}
										}}
									>
										x
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="divider divider-horizontal mx-1"></div>

	<button
		type="button"
		class="btn btn-sm"
		disabled={!editorState.canUndo}
		onclick={() => editorState.undo()}
	>
		Undo
	</button>
	<button
		type="button"
		class="btn btn-sm"
		disabled={!editorState.canRedo}
		onclick={() => editorState.redo()}
	>
		Redo
	</button>

	<div class="divider divider-horizontal mx-1"></div>

	<label class="label cursor-pointer gap-1">
		<input
			type="checkbox"
			class="checkbox checkbox-sm"
			bind:checked={editorState.showGrid}
		/>
		<span class="text-xs">Grid</span>
	</label>

	<div class="divider divider-horizontal mx-1"></div>

	<input
		type="text"
		class="input input-sm w-36"
		placeholder="Stage name"
		bind:value={editorState.currentName}
	/>
	<button type="button" class="btn btn-sm btn-info" onclick={handleSave} disabled={saving}>
		Save
	</button>
	<button type="button" class="btn btn-sm btn-info btn-outline" onclick={handleSaveAs} disabled={saving}>
		Save As
	</button>
	<button type="button" class="btn btn-sm btn-success" onclick={handlePlaytest}>
		Playtest
	</button>

	<div class="divider divider-horizontal mx-1"></div>

	<input type="date" class="input input-sm w-36" bind:value={assignDate} />
	<button
		type="button"
		class="btn btn-sm btn-warning"
		onclick={handleAssign}
		disabled={!editorState.currentDbId}
	>
		Assign
	</button>

	<div class="schedule-wrapper">
		<button
			type="button"
			class="btn btn-sm btn-ghost"
			onclick={() => (showSchedule = !showSchedule)}
		>
			Schedule
		</button>

		{#if showSchedule}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="schedule-backdrop" onclick={() => (showSchedule = false)} onkeydown={() => {}}></div>
			<div class="schedule-overlay">
				<table class="table table-xs">
					<thead>
						<tr>
							<th>Date</th>
							<th>Stage</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each schedule as entry, i}
							<tr>
								<td>{entry.date}</td>
								<td>{entry.name || `#${entry.stage_id}`}</td>
								<td>
									<button
										type="button"
										class="btn btn-xs btn-ghost text-error"
										onclick={() => handleUnassign(i)}
									>
										x
									</button>
								</td>
							</tr>
						{:else}
							<tr><td colspan="3" class="text-center opacity-50">No schedule</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		flex-wrap: wrap;
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

	.db-list {
		display: flex;
		flex-direction: column;
	}

	.db-row {
		display: flex;
		align-items: center;
	}

	.db-stage-load {
		flex: 1;
		text-align: left;
		padding: 0.25rem 0.5rem;
		border: none;
		background: none;
		color: inherit;
		cursor: pointer;
		border-radius: 0.25rem;
		font-size: 0.8rem;
	}

	.db-stage-load:hover {
		background: oklch(var(--b3));
	}

	.db-stage-delete {
		flex-shrink: 0;
		padding: 0.25rem 0.375rem;
		border: none;
		background: none;
		color: inherit;
		cursor: pointer;
		border-radius: 0.25rem;
		font-size: 0.7rem;
		opacity: 0.3;
	}

	.db-stage-delete:hover {
		opacity: 1;
		color: oklch(var(--er));
	}

	.panel-title {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		opacity: 0.5;
		padding: 0.25rem 0.5rem;
	}

	.schedule-wrapper {
		position: relative;
	}

	.schedule-backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
	}

	.schedule-overlay {
		position: absolute;
		top: 100%;
		right: 0;
		z-index: 50;
		background: #2a303c;
		border: 1px solid #3d4451;
		border-radius: 0.5rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
		padding: 0.75rem;
		max-height: 24rem;
		overflow-y: auto;
		min-width: 24rem;
	}

	.schedule-overlay :global(th),
	.schedule-overlay :global(td) {
		font-size: 0.875rem;
		padding: 0.4rem 0.75rem;
		white-space: nowrap;
	}
</style>

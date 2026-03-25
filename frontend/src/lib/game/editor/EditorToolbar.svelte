<script lang="ts">
import { STAGES } from "../stages";
import type { EditorState } from "./editor-state.svelte";

let {
	editorState,
	onPlaytest,
}: {
	editorState: EditorState;
	onPlaytest: () => void;
} = $props();

function handleExport() {
	editorState.exportToConsole();
}

function handlePlaytest() {
	if (!editorState.hasPlayerStart()) {
		alert("PlayerStart tile is required for playtest.");
		return;
	}
	onPlaytest();
}
</script>

<div class="toolbar">
	<button type="button" class="btn btn-sm" onclick={() => editorState.createNew()}>
		New
	</button>

	<div class="dropdown">
		<div tabindex="-1" role="button" class="btn btn-sm">Load</div>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<ul tabindex="0" class="dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow">
			{#each STAGES as stage, i}
				<li>
					<button
						type="button"
						onclick={(e) => {
							editorState.loadStage(i);
							(e.currentTarget as HTMLElement).closest('.dropdown')?.querySelector<HTMLElement>('[role="button"]')?.blur();
						}}
					>
						{stage.name ?? stage.id}
					</button>
				</li>
			{/each}
		</ul>
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

	<button type="button" class="btn btn-sm btn-info" onclick={handleExport}>
		Export
	</button>
	<button type="button" class="btn btn-sm btn-success" onclick={handlePlaytest}>
		Playtest
	</button>
</div>

<style>
	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		flex-wrap: wrap;
	}
</style>

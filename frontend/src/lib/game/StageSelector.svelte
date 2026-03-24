<script lang="ts">
import type { StageDef } from "./types";

let {
	stages,
	selectedIndex,
	onSelect,
}: {
	stages: StageDef[];
	selectedIndex: number;
	onSelect: (index: number) => void;
} = $props();

function handleSelect(index: number, event: MouseEvent) {
	onSelect(index);
	(event.currentTarget as HTMLElement).blur();
}
</script>

<div class="stage-selector">
	<div class="dropdown">
		<div tabindex="-1" role="button" class="btn btn-sm btn-ghost">
			{stages[selectedIndex].name}
		</div>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<ul tabindex="0" class="dropdown-content menu bg-base-200 rounded-box z-10 w-56 p-2 shadow">
			{#each stages as stage, i}
				<li>
					<button
						type="button"
						class:active={i === selectedIndex}
						onclick={(e) => handleSelect(i, e)}
					>
						{stage.name}
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.stage-selector {
		position: fixed;
		top: 0.5rem;
		left: 0.5rem;
		z-index: 50;
	}
</style>

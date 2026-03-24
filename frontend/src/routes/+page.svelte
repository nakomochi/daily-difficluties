<script lang="ts">
import Game from "$lib/game/Game.svelte";
import StageSelector from "$lib/game/StageSelector.svelte";
import { STAGES } from "$lib/game/stages";

let selectedIndex = $state(0);
</script>

{#if import.meta.env.DEV}
	<StageSelector stages={STAGES} {selectedIndex} onSelect={(i) => (selectedIndex = i)} />
{/if}
<Game stageData={STAGES[selectedIndex].data} />

<script lang="ts">
import type { Input, InputState } from "./input";

let { input }: { input: Input | null } = $props();

function press(...keys: (keyof InputState)[]) {
	return () => {
		for (const k of keys) input?.setVirtualKey(k, true);
	};
}

function release(...keys: (keyof InputState)[]) {
	return () => {
		for (const k of keys) input?.setVirtualKey(k, false);
	};
}
</script>

<div class="touch-overlay">
	<button
		class="touch-btn restart-btn"
		aria-label="Restart"
		ontouchstart={press("restart")}
		ontouchend={release("restart")}
		ontouchcancel={release("restart")}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
			<path d="M3 12a9 9 0 1 1 3 6.7" />
			<path d="M3 7v5h5" />
		</svg>
	</button>

	<div class="move-group">
		<button
			class="touch-btn"
			aria-label="Move left"
			ontouchstart={press("left")}
			ontouchend={release("left")}
			ontouchcancel={release("left")}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
				<path d="M15 6l-6 6 6 6" />
			</svg>
		</button>
		<button
			class="touch-btn"
			aria-label="Move right"
			ontouchstart={press("right")}
			ontouchend={release("right")}
			ontouchcancel={release("right")}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
				<path d="M9 6l6 6-6 6" />
			</svg>
		</button>
	</div>

	<button
		class="touch-btn jump-btn"
		aria-label="Jump"
		ontouchstart={press("jump", "jumpPressed")}
		ontouchend={release("jump")}
		ontouchcancel={release("jump")}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
			<path d="M6 15l6-6 6 6" />
		</svg>
	</button>
</div>

<style>
	.touch-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 10;
	}

	.touch-btn {
		pointer-events: auto;
		position: absolute;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.12);
		color: rgba(255, 255, 255, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		touch-action: none;
		-webkit-tap-highlight-color: transparent;
		user-select: none;
	}

	.touch-btn:active {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.8);
	}

	.touch-btn svg {
		width: 28px;
		height: 28px;
	}

	.restart-btn {
		top: 12px;
		left: 12px;
		width: 44px;
		height: 44px;
	}

	.restart-btn svg {
		width: 22px;
		height: 22px;
	}

	.move-group {
		position: absolute;
		bottom: 20px;
		left: 20px;
		display: flex;
		gap: 12px;
		pointer-events: none;
	}

	.move-group .touch-btn {
		position: static;
		pointer-events: auto;
	}

	.jump-btn {
		bottom: 20px;
		right: 20px;
		width: 68px;
		height: 68px;
	}

	.jump-btn svg {
		width: 34px;
		height: 34px;
	}
</style>

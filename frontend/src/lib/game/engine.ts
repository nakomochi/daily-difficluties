import { Input } from "./input";
import { Level } from "./level";
import { createPlayer, respawnPlayer, updatePlayer } from "./player";
import { render } from "./renderer";
import type { GameState, StageData } from "./types";
import { FRAME_TIME, SCREEN_HEIGHT, SCREEN_WIDTH } from "./types";

export class Engine {
	private ctx: CanvasRenderingContext2D;
	private input: Input;
	private level: Level;
	private state: GameState;
	private accumulator = 0;
	private lastTime = 0;
	private running = false;
	private rafId = 0;

	constructor(canvas: HTMLCanvasElement, stageData: StageData) {
		canvas.width = SCREEN_WIDTH;
		canvas.height = SCREEN_HEIGHT;

		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Failed to get 2d context");
		this.ctx = ctx;

		this.input = new Input();
		this.level = new Level(stageData);
		this.state = this.createInitialState();
	}

	private createInitialState(): GameState {
		const start = this.level.playerStart;
		return {
			player: createPlayer(start.x, start.y),
			savePoint: this.level.getDefaultSave(),
			deaths: 0,
			startTime: Date.now(),
			cleared: false,
			clearTime: 0,
			activeSaves: new Set(),
		};
	}

	start(): void {
		this.running = true;
		this.lastTime = performance.now();
		this.loop(this.lastTime);
	}

	stop(): void {
		this.running = false;
		cancelAnimationFrame(this.rafId);
		this.input.destroy();
	}

	private loop = (now: number): void => {
		if (!this.running) return;

		const delta = now - this.lastTime;
		this.lastTime = now;
		this.accumulator += delta;

		// Cap accumulator to prevent spiral of death
		if (this.accumulator > FRAME_TIME * 10) {
			this.accumulator = FRAME_TIME * 10;
		}

		while (this.accumulator >= FRAME_TIME) {
			this.update();
			this.accumulator -= FRAME_TIME;
		}

		render(this.ctx, this.state, this.level);
		this.rafId = requestAnimationFrame(this.loop);
	};

	private update(): void {
		const inputState = this.input.getState();

		// Restart
		if (inputState.restart) {
			this.state = this.createInitialState();
			this.input.consumeFrame();
			return;
		}

		// Respawn after death
		if (this.state.player.dead) {
			respawnPlayer(this.state);
			this.input.consumeFrame();
			return;
		}

		updatePlayer(this.state, inputState, this.level);
		this.input.consumeFrame();
	}
}

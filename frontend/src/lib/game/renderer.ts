import type { Level } from "./level";
import {
	type GameState,
	GRID_COLS,
	GRID_ROWS,
	PLAYER_HEIGHT,
	PLAYER_WIDTH,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
	TILE_SIZE,
	Tile,
} from "./types";

const COLOR_BG = "#1a1a2e";
const COLOR_BLOCK = "#555568";
const COLOR_SPIKE = "#e23636";
const COLOR_PLAYER = "#e23636";
const COLOR_SAVE_INACTIVE = "#666633";
const COLOR_SAVE_ACTIVE = "#ffdd33";
const COLOR_GOAL = "#33ff66";
const COLOR_HUD = "#ffffff";

export function render(ctx: CanvasRenderingContext2D, state: GameState, level: Level): void {
	// Clear
	ctx.fillStyle = COLOR_BG;
	ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	// Draw tiles
	for (let row = 0; row < GRID_ROWS; row++) {
		for (let col = 0; col < GRID_COLS; col++) {
			const tile = level.tiles[row][col];
			const x = col * TILE_SIZE;
			const y = row * TILE_SIZE;

			switch (tile) {
				case Tile.Block:
					ctx.fillStyle = COLOR_BLOCK;
					ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
					// Border for visual clarity
					ctx.strokeStyle = "#44445a";
					ctx.lineWidth = 1;
					ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
					break;

				case Tile.SpikeUp:
					drawSpike(ctx, x, y, "up");
					break;
				case Tile.SpikeDown:
					drawSpike(ctx, x, y, "down");
					break;
				case Tile.SpikeLeft:
					drawSpike(ctx, x, y, "left");
					break;
				case Tile.SpikeRight:
					drawSpike(ctx, x, y, "right");
					break;

				case Tile.Save: {
					const key = `${col},${row}`;
					const active = state.activeSaves.has(key);
					ctx.fillStyle = active ? COLOR_SAVE_ACTIVE : COLOR_SAVE_INACTIVE;
					const pad = 8;
					ctx.fillRect(x + pad, y + pad, TILE_SIZE - pad * 2, TILE_SIZE - pad * 2);
					break;
				}

				case Tile.Goal:
					ctx.fillStyle = COLOR_GOAL;
					ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
					break;
			}
		}
	}

	// Draw player
	if (!state.player.dead) {
		ctx.fillStyle = COLOR_PLAYER;
		const px = state.player.x - PLAYER_WIDTH / 2;
		const py = state.player.y - PLAYER_HEIGHT;
		ctx.fillRect(px, py, PLAYER_WIDTH, PLAYER_HEIGHT);
	}

	// HUD
	drawHud(ctx, state);

	// Clear screen overlay
	if (state.cleared) {
		drawClearOverlay(ctx, state);
	}
}

function drawSpike(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	dir: "up" | "down" | "left" | "right",
): void {
	ctx.fillStyle = COLOR_SPIKE;
	ctx.beginPath();
	switch (dir) {
		case "up":
			ctx.moveTo(x, y + TILE_SIZE);
			ctx.lineTo(x + TILE_SIZE / 2, y);
			ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
			break;
		case "down":
			ctx.moveTo(x, y);
			ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE);
			ctx.lineTo(x + TILE_SIZE, y);
			break;
		case "left":
			ctx.moveTo(x + TILE_SIZE, y);
			ctx.lineTo(x, y + TILE_SIZE / 2);
			ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
			break;
		case "right":
			ctx.moveTo(x, y);
			ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE / 2);
			ctx.lineTo(x, y + TILE_SIZE);
			break;
	}
	ctx.closePath();
	ctx.fill();
}

function drawHud(ctx: CanvasRenderingContext2D, state: GameState): void {
	ctx.fillStyle = COLOR_HUD;
	ctx.font = "14px monospace";
	ctx.textAlign = "left";

	const elapsed = state.cleared ? state.clearTime : Date.now() - state.startTime;
	const seconds = (elapsed / 1000).toFixed(1);

	ctx.fillText(`Deaths: ${state.deaths}`, 8, 16);
	ctx.fillText(`Time: ${seconds}s`, 8, 32);
}

function drawClearOverlay(ctx: CanvasRenderingContext2D, state: GameState): void {
	ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
	ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	ctx.fillStyle = COLOR_GOAL;
	ctx.font = "bold 48px monospace";
	ctx.textAlign = "center";
	ctx.fillText("CLEAR!", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 40);

	ctx.fillStyle = COLOR_HUD;
	ctx.font = "24px monospace";
	const time = (state.clearTime / 1000).toFixed(1);
	ctx.fillText(`Deaths: ${state.deaths}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 10);
	ctx.fillText(`Time: ${time}s`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 40);

	ctx.font = "16px monospace";
	ctx.fillText("Press R to restart", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 80);
}

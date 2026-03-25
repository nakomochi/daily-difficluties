import { COLOR_BG, drawTile } from "../renderer";
import { GRID_COLS, GRID_ROWS, SCREEN_HEIGHT, SCREEN_WIDTH, TILE_SIZE, Tile } from "../types";
import type { EditorState } from "./editor-state.svelte";

export function renderEditor(ctx: CanvasRenderingContext2D, state: EditorState): void {
	ctx.fillStyle = COLOR_BG;
	ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	for (let row = 0; row < GRID_ROWS; row++) {
		for (let col = 0; col < GRID_COLS; col++) {
			const tile = state.tiles[row][col];
			drawTile(ctx, tile, col * TILE_SIZE, row * TILE_SIZE);
		}
	}

	if (state.showGrid) {
		drawGrid(ctx);
	}

	drawHover(ctx, state);
}

function drawGrid(ctx: CanvasRenderingContext2D): void {
	ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
	ctx.lineWidth = 1;
	ctx.beginPath();

	for (let col = 1; col < GRID_COLS; col++) {
		const x = col * TILE_SIZE + 0.5;
		ctx.moveTo(x, 0);
		ctx.lineTo(x, SCREEN_HEIGHT);
	}
	for (let row = 1; row < GRID_ROWS; row++) {
		const y = row * TILE_SIZE + 0.5;
		ctx.moveTo(0, y);
		ctx.lineTo(SCREEN_WIDTH, y);
	}

	ctx.stroke();
}

function drawHover(ctx: CanvasRenderingContext2D, state: EditorState): void {
	const { hoverCol, hoverRow, selectedTile } = state;
	if (hoverCol < 0 || hoverRow < 0) return;
	if (hoverCol >= GRID_COLS || hoverRow >= GRID_ROWS) return;

	const x = hoverCol * TILE_SIZE;
	const y = hoverRow * TILE_SIZE;

	ctx.globalAlpha = 0.4;
	if (selectedTile === Tile.Empty) {
		ctx.strokeStyle = "#ff4444";
		ctx.lineWidth = 2;
		ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
	} else {
		drawTile(ctx, selectedTile, x, y);
	}
	ctx.globalAlpha = 1;
}

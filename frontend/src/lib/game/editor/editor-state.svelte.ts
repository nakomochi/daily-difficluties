import { STAGES } from "../stages";
import { GRID_COLS, GRID_ROWS, type StageData, Tile } from "../types";
import { cloneGrid, History } from "./history.svelte";
import { EXPORT_NAME_BY_TILE } from "./tile-palette-data";

function isBorder(col: number, row: number): boolean {
	return row === 0 || row === GRID_ROWS - 1 || col === 0 || col === GRID_COLS - 1;
}

function createEmptyStage(): StageData {
	const grid: StageData = [];
	for (let row = 0; row < GRID_ROWS; row++) {
		const r: number[] = [];
		for (let col = 0; col < GRID_COLS; col++) {
			r.push(isBorder(col, row) ? Tile.Block : Tile.Empty);
		}
		grid.push(r);
	}
	return grid;
}

export class EditorState {
	tiles: StageData = $state(createEmptyStage());
	selectedTile: Tile = $state(Tile.Block);
	hoverCol: number = $state(-1);
	hoverRow: number = $state(-1);
	isDragging: boolean = $state(false);
	showGrid: boolean = $state(true);

	private history = new History();
	private dragSnapshot: StageData | null = null;

	createNew(): void {
		this.history.pushSnapshot(this.tiles);
		this.tiles = createEmptyStage();
	}

	loadStage(index: number): void {
		const stage = STAGES[index];
		if (!stage) return;
		this.history.pushSnapshot(this.tiles);
		this.tiles = cloneGrid(stage.data);
	}

	placeTile(col: number, row: number): void {
		if (!this.isEditable(col, row)) return;

		const tile = this.selectedTile;

		if (tile === Tile.PlayerStart) {
			this.clearAllOfType(Tile.PlayerStart);
		}

		this.tiles[row][col] = tile;
	}

	private isEditable(col: number, row: number): boolean {
		if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
		return !isBorder(col, row);
	}

	private clearAllOfType(type: Tile): void {
		for (let r = 0; r < GRID_ROWS; r++) {
			for (let c = 0; c < GRID_COLS; c++) {
				if (this.tiles[r][c] === type) {
					this.tiles[r][c] = Tile.Empty;
				}
			}
		}
	}

	startDrag(): void {
		this.isDragging = true;
		this.dragSnapshot = cloneGrid(this.tiles);
	}

	endDrag(): void {
		if (this.isDragging && this.dragSnapshot) {
			this.history.pushSnapshot(this.dragSnapshot);
			this.dragSnapshot = null;
		}
		this.isDragging = false;
	}

	undo(): void {
		const prev = this.history.undo(this.tiles);
		if (prev) this.tiles = prev;
	}

	redo(): void {
		const next = this.history.redo(this.tiles);
		if (next) this.tiles = next;
	}

	get canUndo(): boolean {
		return this.history.canUndo;
	}

	get canRedo(): boolean {
		return this.history.canRedo;
	}

	hasPlayerStart(): boolean {
		for (let r = 0; r < GRID_ROWS; r++) {
			for (let c = 0; c < GRID_COLS; c++) {
				if (this.tiles[r][c] === Tile.PlayerStart) return true;
			}
		}
		return false;
	}

	exportToConsole(): void {
		const lines = this.tiles.map((row) => {
			const cells = row.map((t) => EXPORT_NAME_BY_TILE[t] ?? "_");
			return `\t\t\t[${cells.join(", ")}],`;
		});

		const output = `{\n\t\tid: "custom-stage",\n\t\tdata: [\n${lines.join("\n")}\n\t\t],\n\t},`;
		console.log(output);
	}
}

import { GRID_COLS, GRID_ROWS, type SavePoint, type StageData, TILE_SIZE, Tile } from "./types";

export class Level {
	readonly tiles: StageData;
	readonly playerStart: { x: number; y: number };

	constructor(tiles: StageData) {
		if (tiles.length !== GRID_ROWS || tiles.some((row) => row.length !== GRID_COLS)) {
			throw new Error(`Stage must be ${GRID_ROWS} rows x ${GRID_COLS} cols`);
		}
		this.tiles = tiles;
		this.playerStart = this.findTile(Tile.PlayerStart);
	}

	private findTile(type: Tile): { x: number; y: number } {
		for (let row = 0; row < GRID_ROWS; row++) {
			for (let col = 0; col < GRID_COLS; col++) {
				if (this.tiles[row][col] === type) {
					return {
						x: col * TILE_SIZE + TILE_SIZE / 2,
						y: (row + 1) * TILE_SIZE,
					};
				}
			}
		}
		throw new Error(`Tile type ${type} not found in stage`);
	}

	getTile(col: number, row: number): Tile {
		if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) {
			return Tile.Block;
		}
		return this.tiles[row][col];
	}

	isSolid(col: number, row: number): boolean {
		return this.getTile(col, row) === Tile.Block;
	}

	isSpike(col: number, row: number): boolean {
		const t = this.getTile(col, row);
		return (
			t === Tile.SpikeUp || t === Tile.SpikeDown || t === Tile.SpikeLeft || t === Tile.SpikeRight
		);
	}

	isSave(col: number, row: number): boolean {
		return this.getTile(col, row) === Tile.Save;
	}

	isGoal(col: number, row: number): boolean {
		return this.getTile(col, row) === Tile.Goal;
	}

	getDefaultSave(): SavePoint {
		return { ...this.playerStart };
	}
}

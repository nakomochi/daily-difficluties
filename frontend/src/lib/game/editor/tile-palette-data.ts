import { Tile } from "../types";

export interface PaletteTile {
	tile: Tile;
	label: string;
	key: string;
	exportName: string;
}

export const PALETTE_TILES: PaletteTile[] = [
	{ tile: Tile.Empty, label: "Eraser", key: "0", exportName: "_" },
	{ tile: Tile.Block, label: "Block", key: "1", exportName: "B" },
	{ tile: Tile.SpikeUp, label: "Spike Up", key: "2", exportName: "U" },
	{ tile: Tile.SpikeDown, label: "Spike Down", key: "3", exportName: "D" },
	{ tile: Tile.SpikeLeft, label: "Spike Left", key: "4", exportName: "L" },
	{ tile: Tile.SpikeRight, label: "Spike Right", key: "5", exportName: "R" },
	{ tile: Tile.PlayerStart, label: "Player Start", key: "6", exportName: "P" },
	{ tile: Tile.Save, label: "Save", key: "7", exportName: "S" },
	{ tile: Tile.Goal, label: "Goal", key: "8", exportName: "G" },
];

export const TILE_BY_KEY: Record<string, Tile> = Object.fromEntries(
	PALETTE_TILES.map((p) => [p.key, p.tile]),
);

export const EXPORT_NAME_BY_TILE: Record<number, string> = Object.fromEntries(
	PALETTE_TILES.map((p) => [p.tile, p.exportName]),
);

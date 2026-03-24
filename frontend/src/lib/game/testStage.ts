import type { StageData } from "./types";
import { Tile } from "./types";

const _ = Tile.Empty;
const B = Tile.Block;
const U = Tile.SpikeUp;
const P = Tile.PlayerStart;
const S = Tile.Save;
const G = Tile.Goal;

// 19 rows x 25 cols test stage
// A needle-style platformer stage with spikes, platforms, and a path to the goal
export const TEST_STAGE: StageData = [
	// Row 0: top wall
	[B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
	// Row 1
	[B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 2
	[B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 3
	[B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, G, _, B],
	// Row 4
	[B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B, B, B, B],
	// Row 5
	[B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 6
	[B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 7
	[B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B, _, _, _, _, _, B],
	// Row 8
	[B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 9
	[B, _, _, _, _, _, _, _, _, _, _, _, _, U, _, _, _, _, _, _, _, _, _, _, B],
	// Row 10
	[B, _, _, _, _, _, _, _, _, _, _, _, B, B, B, _, _, _, _, _, _, _, _, _, B],
	// Row 11
	[B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 12
	[B, _, _, _, _, _, _, _, U, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 13
	[B, _, _, _, _, _, _, B, B, B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 14
	[B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 15
	[B, _, _, U, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 16
	[B, _, B, B, B, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 17
	[B, P, _, _, _, S, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, B],
	// Row 18: bottom wall with spikes
	[B, B, U, U, U, B, U, U, U, U, U, U, U, U, U, U, U, U, U, U, U, U, U, U, B],
];

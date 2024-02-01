export enum Tile {
	Empty = 0,
	Background = 1,
	Wall1 = 2,
	Wall2 = 3,
	Wall3 = 4,
	Wall4 = 5,
	Wall5 = 6,
	Light1 = 7,
	Light2 = 8,
	Light3 = 9,
}

export interface TileConfig {
	offset: number;
	texture: string;
}

export const wallTileOffset = -20;

export function getTileTexture(tile: Tile) {
	switch (tile) {
		case Tile.Wall1:
			return 'wall1';
		case Tile.Wall2:
			return 'wall2';
		case Tile.Wall3:
			return 'wall3';
		case Tile.Wall4:
			return 'wall4';
		case Tile.Wall5:
			return 'wall5';
		case Tile.Light1:
			return 'light1';
		case Tile.Light2:
			return 'light2';
		case Tile.Light3:
			return 'light3';
		case Tile.Background:
			return 'bg';
		default:
			return 'error';
	}
}

export const fallbackTileConfig: TileConfig = {
	offset: 0,
	texture: 'error',
};

const walls = new Set([
	Tile.Wall1,
	Tile.Wall2,
	Tile.Wall3,
	Tile.Wall4,
	Tile.Wall5,
]);

export function isWall(tile: Tile) {
	return walls.has(tile);
}

const lights = new Set([
	Tile.Light1,
	Tile.Light2,
	Tile.Light3,
]);

export function isLight(tile: Tile) {
	return lights.has(tile);
}

export function getLightStrength(tile: Tile): number {
	switch (tile) {
		case Tile.Light1:
			return 2;
		case Tile.Light2:
			return 4;
		case Tile.Light3:
			return 6;
		default:
			return 0;
	}
}

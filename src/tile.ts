export enum Tile {
	Empty = 0,
	Background1 = 1,
	Background2 = 2,
	Background3 = 3,
	Background4 = 4,
	Wall1 = 10,
	Wall2 = 11,
	Wall3 = 12,
	Wall4 = 13,
	Wall5 = 14,
	Wall6 = 15,
	Wall7 = 16,
	Wall8 = 17,
	Wall9 = 18,
	Wall10 = 19,
	Wall11 = 20,
	Wall12 = 21,
	Light1 = 100,
	Light2 = 101,
	Light3 = 102,
	Light1Cage = 110,
	Light2Cage = 111,
	Light3Cage = 112,
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
		case Tile.Wall6:
			return 'wall6';
		case Tile.Wall7:
			return 'wall7';
		case Tile.Wall8:
			return 'wall8';
		case Tile.Wall9:
			return 'wall9';
		case Tile.Wall10:
			return 'wall10';
		case Tile.Wall11:
			return 'wall11';
		case Tile.Wall12:
			return 'wall12';
		case Tile.Light1:
			return 'light1';
		case Tile.Light2:
			return 'light2';
		case Tile.Light3:
			return 'light3';
		case Tile.Light1Cage:
			return 'light1cage';
		case Tile.Light2Cage:
			return 'light2cage';
		case Tile.Light3Cage:
			return 'light3cage';
		case Tile.Background1:
			return 'bg1';
		case Tile.Background2:
			return 'bg2';
		case Tile.Background3:
			return 'bg3';
		case Tile.Background4:
			return 'bg4';
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
	Tile.Wall6,
	Tile.Wall7,
	Tile.Wall8,
	Tile.Wall9,
	Tile.Wall10,
	Tile.Wall11,
	Tile.Wall12,
]);

export function isWall(tile: Tile) {
	return walls.has(tile);
}

const lights = new Set([
	Tile.Light1,
	Tile.Light2,
	Tile.Light3,
	Tile.Light1Cage,
	Tile.Light2Cage,
	Tile.Light3Cage,
]);

export function isLight(tile: Tile) {
	return lights.has(tile);
}

const movableLights = new Set([
	Tile.Light1,
	Tile.Light2,
	Tile.Light3,
]);

export function isMovableLight(tile: Tile) {
	return movableLights.has(tile);
}

export function getLightStrength(tile: Tile): number {
	switch (tile) {
		case Tile.Light1:
		case Tile.Light1Cage:
			return 2;
		case Tile.Light2:
		case Tile.Light2Cage:
			return 4;
		case Tile.Light3:
		case Tile.Light3Cage:
			return 6;
		default:
			return 0;
	}
}

const backgrounds = new Set([
	Tile.Background1,
	Tile.Background2,
	Tile.Background3,
	Tile.Background4,
]);

export function isBackground(tile: Tile) {
	return backgrounds.has(tile);
}

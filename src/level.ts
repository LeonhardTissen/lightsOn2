import { Container, Sprite } from 'pixi.js';
import { getTexture } from './pixi/assets';
import { app, setCursor } from './pixi/app';
import { Level, levels } from './levels';
import { Tile, getLightStrength, getTileTexture, isLight, isWall, wallTileOffset } from './tile';
import { mouseButtons, mousePosition } from './mouse';
import { pressedKeys } from './keyboard';

export let currentLevel = 0;
let currentEditorTile = Tile.Wall1;

const tileLookup: Record<string, Sprite> = {};
const lightLookup: Record<string, Light> = {};
const lightBgLookup: Record<string, Light> = {};

let tilesToLight: number = 0;

type Light = {
	x: number;
	y: number;
	strength: number;
	sprite: Sprite;
	texture: string;
};

let grabbedLight: Light | undefined;

export function nextLevel() {
	currentLevel++;
}

export function goToLevel(levelNumber: number) {
	currentLevel = levelNumber;
}

export let level: Level;

export function loadLevel() {
	level = levels[currentLevel];
}

const tileWidth = 64;

let levelCon: Container;

let cursorSprite: Sprite | undefined;

function getTopLeftOfLevel() {
	return {
		x: Math.round((app.view.width - level[0].length * tileWidth) / 2),
		y: Math.round((app.view.height - level.length * tileWidth) / 2),
	};
}

export function centerLevel() {
	if (!levelCon) return;
	const { x, y } = getTopLeftOfLevel();
	levelCon.position.x = x;
	levelCon.position.y = y;
}

function createTileSprite(tile: Tile, x: number, y: number) {
	const texture = getTileTexture(tile);
	const offset = isWall(tile) ? wallTileOffset : 0;
	const sprite = new Sprite();
	sprite.texture = getTexture(texture);
	sprite.x = x * tileWidth + offset;
	sprite.y = y * tileWidth + offset;
	sprite.zIndex = getZIndex(x, y, 0);
	tileLookup[`${x},${y}`] = sprite;
	levelCon.addChild(sprite);
	return sprite;
}

function deleteTileSprite(x: number, y: number) {
	level[y][x] = Tile.Empty;
	const sprite = tileLookup[`${x},${y}`];
	if (sprite) {
		levelCon.removeChild(sprite);
	}
}

function getZIndex(x: number, y: number, additive: number) {
	return (x + y) * 10 + additive;
}

export function initLevel() {
	if (levelCon) {
		levelCon.destroy({ children: true });
		app.stage.removeChild(levelCon);
	}
	levelCon = new Container();
	levelCon.sortableChildren = true;
	centerLevel();
	tilesToLight = 0;
	for (let y = 0; y < level.length; y++) {
		for (let x = 0; x < level[y].length; x++) {
			const tile = level[y][x];
			if (isLight(tile)) {
				const sprite = new Sprite();
				const texture = getTileTexture(tile);
				sprite.texture = getTexture(texture);
				sprite.x = x * tileWidth;
				sprite.y = y * tileWidth;
				sprite.zIndex = getZIndex(x, y, 5);
				levelCon.addChild(sprite);
				lightLookup[`${x},${y}`] = {
					x,
					y,
					strength: getLightStrength(tile),
					sprite,
					texture,
				};
				createTileSprite(Tile.Background, x, y);
			} else if (tile !== Tile.Empty) {
				createTileSprite(tile, x, y);
			}
			if (tile !== Tile.Empty && !isWall(tile)) {
				tilesToLight++;
			}
		}
	}
	app.stage.addChild(levelCon);
	addCursorSprite();
	updateLightBgSprites();
}



function createLightSprite(x: number, y: number, strength: number) {
	const sprite = new Sprite();
	const texture = 'lightbg';
	sprite.texture = getTexture(texture);
	sprite.x = x * tileWidth;
	sprite.y = y * tileWidth;
	sprite.zIndex = getZIndex(x, y, 2);
	sprite.alpha = strength / 10 + 0.1;
	levelCon.addChild(sprite);
	lightBgLookup[`${x},${y}`] = {
		x,
		y,
		strength,
		sprite,
		texture,
	};
	return sprite;
}

function deleteLightSprite(x: number, y: number) {
	const { sprite } = lightBgLookup[`${x},${y}`];
	if (sprite) {
		levelCon.removeChild(sprite);
		sprite.destroy();
		delete lightBgLookup[`${x},${y}`];
	}
}

function deleteAllLightSprites() {
	for (const key in lightBgLookup) {
		const [x, y] = key.split(',');
		deleteLightSprite(+x, +y);
	}
}

function updateLightBgSprites() {
	deleteAllLightSprites();
	for (const key in lightLookup) {
		const [x, y] = key.split(',');
		const light = lightLookup[key];
		lightBgIteration(+x, +y, light.strength);
	}
	const tilesLit = Object.keys(lightBgLookup).length;
	console.log(tilesLit, tilesToLight);
	if (tilesLit === tilesToLight) {
		console.log('Level Complete!');
	}
}

function lightBgIteration(x: number, y: number, strength: number) {
	// Check if the light can be placed
	const tile = level[y][x];
	if (isWall(tile)) return;
	// Check if there is already a light there that is stronger
	if (lightBgLookup[`${x},${y}`]) {
		const light = lightBgLookup[`${x},${y}`];
		if (light.strength >= strength) return;
		deleteLightSprite(x, y);
	}

	// Place the light
	createLightSprite(x, y, strength);

	// Spawn new iterations
	if (strength <= 1) return;
	lightBgIteration(x - 1, y, strength - 1);
	lightBgIteration(x + 1, y, strength - 1);
	lightBgIteration(x, y - 1, strength - 1);
	lightBgIteration(x, y + 1, strength - 1);
}


function addCursorSprite() {
	if (cursorSprite) {
		levelCon.destroy({ children: true });
	}
	cursorSprite = new Sprite();
	cursorSprite.texture = getTexture('cursor');
	cursorSprite.zIndex = 1000;
	levelCon.addChild(cursorSprite);
}

function setCursorSpriteAlpha(alpha: number) {
	if (!cursorSprite) return;
	cursorSprite.alpha = alpha;
}

function updateCursorSprite() {
	if (!cursorSprite) return;
	const relativeMousePosition = {
		x: mousePosition.x - levelCon.x,
		y: mousePosition.y - levelCon.y,
	};
	const tileMousePosition = {
		x: Math.floor(relativeMousePosition.x / tileWidth),
		y: Math.floor(relativeMousePosition.y / tileWidth),
	};
	if (tileMousePosition.x < 0 || tileMousePosition.y < 0 || tileMousePosition.x >= level[0].length || tileMousePosition.y >= level.length) {
		setCursorSpriteAlpha(0);
		return;
	}
	const tile = level[tileMousePosition.y][tileMousePosition.x];
	if (!isWall(tile)) {
		setCursorSpriteAlpha(1);
		cursorSprite.x = tileMousePosition.x * tileWidth;
		cursorSprite.y = tileMousePosition.y * tileWidth;
	} else {
		setCursorSpriteAlpha(0.3);
		cursorSprite.x = tileMousePosition.x * tileWidth + wallTileOffset;
		cursorSprite.y = tileMousePosition.y * tileWidth + wallTileOffset;
	}
}

function updateGrabbedLight() {
	if (!grabbedLight) return;
	grabbedLight.sprite.x = mousePosition.x - tileWidth / 2;
	grabbedLight.sprite.y = mousePosition.y - tileWidth / 2;
}



const editorMode = false;
export function handleMouseLevel() {
	if (!levelCon) return;
	updateGrabbedLight();
	updateCursorSprite();

	const relativeMousePosition = {
		x: mousePosition.x - levelCon.x,
		y: mousePosition.y - levelCon.y,
	};
	const tileMousePosition = {
		x: Math.floor(relativeMousePosition.x / tileWidth),
		y: Math.floor(relativeMousePosition.y / tileWidth),
	};
	if (tileMousePosition.x < 0 || tileMousePosition.y < 0 || tileMousePosition.x >= level[0].length || tileMousePosition.y >= level.length) {
		return;
	}
	if (editorMode) {
		if (mouseButtons.has(0)) {
			deleteTileSprite(tileMousePosition.x, tileMousePosition.y);
			level[tileMousePosition.y][tileMousePosition.x] = currentEditorTile;
			const sprite = createTileSprite(currentEditorTile, tileMousePosition.x, tileMousePosition.y);
			levelCon.addChild(sprite);
		} else if (mouseButtons.has(2)) {
			deleteTileSprite(tileMousePosition.x, tileMousePosition.y);
		}
	} else {
		if (grabbedLight) {
			setCursor('move');

			if (mouseButtons.has(0)) {
				mouseButtons.delete(0);

				// Check if the light can be placed
				const { x, y } = tileMousePosition;
				if (level[y][x] !== Tile.Background) return;

				// Place the light
				const light = grabbedLight;
				levelCon.addChild(light.sprite);
				app.stage.removeChild(light.sprite);
				light.sprite.alpha = 1;
				light.sprite.x = x * tileWidth;
				light.sprite.y = y * tileWidth;
				light.sprite.zIndex = getZIndex(x, y, 5);
				light.x = x;
				light.y = y;
				lightLookup[`${x},${y}`] = light;
				level[y][x] = Tile.Light2;
				grabbedLight = undefined;

				// Update the light bg sprites
				updateLightBgSprites();
			}
			return;
		}

		// See if there is a light to grab
		const light = lightLookup[`${tileMousePosition.x},${tileMousePosition.y}`];
		if (light === undefined) {
			setCursor('default');
			return;
		}

		setCursor('grab');
		if (mouseButtons.has(0)) {
			const { x, y } = tileMousePosition;
			mouseButtons.delete(0);
			// Grab the light
			level[y][x] = Tile.Background;
			delete lightLookup[`${x},${y}`];
			grabbedLight = light;
			levelCon.removeChild(light.sprite);
			app.stage.addChild(light.sprite);
			light.sprite.alpha = 0.5;
			updateGrabbedLight();

			// Update the light bg sprites
			updateLightBgSprites();
		}
	}
}

export function handleKeyboardLevel() {
	if (editorMode) {
		for (let i = 0; i < 10; i++) {
			if (pressedKeys.has(`${i}`)) {
				currentEditorTile = i;
			}
		}
	}
}

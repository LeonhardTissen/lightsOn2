import { Container, Point, Sprite } from 'pixi.js';
import { getTexture } from './pixi/assets';
import { app, setBackgroundColor, setCursor } from './pixi/app';
import { LevelData, levels } from './levels';
import { Tile, getLightStrength, getTileTexture, isBackground, isLight, isMovableLight, isWall, wallTileOffset } from './tile';
import { mouseButtons, mousePosition } from './mouse';
import { blockerControl, causeLevelTextAnimation, levelMenuControl, setLevelInfo, setLevelName, setLevelNumber, setTilesLit, winScreenControl } from './ui';
import { sound } from './audio';
import './keyboard';

export let currentLevel = 0;

const lsiKey = 'lightson2-maxlevel';
const storedLevel = localStorage.getItem(lsiKey);
if (storedLevel) {
	currentLevel = +storedLevel;
}

let currentEditorTile = Tile.Wall1;

let tileLookup: Record<string, Sprite> = {};
let lightLookup: Record<string, Light> = {};
let lightBgLookup: Record<string, Light> = {};

let tilesToLight: number = 0;

let editorMode = false;

export function toggleEditorMode() {
	editorMode = !editorMode;
	editorTiles.style.display = editorMode ? 'flex' : 'none';
}
window.toggleEditorMode = toggleEditorMode;

type Light = {
	x: number;
	y: number;
	strength: number;
	sprite: Sprite;
	texture: string;
	tile?: Tile;
};

let grabbedLight: Light | undefined;

export function nextLevel() {
	causeLevelTextAnimation();
	currentLevel++;
	updateLevelButtons();
	const oldSave = localStorage.getItem(lsiKey);
	// Only save the level if it is higher than the old save or if there is no old save
	if ((oldSave !== null && currentLevel > +oldSave) || oldSave === null) {
		localStorage.setItem(lsiKey, `${currentLevel}`);
	}
}

export function goToLevel(levelNumber: number) {
	currentLevel = levelNumber;
}

document.getElementById('reset')!.addEventListener('click', () => {
	blockerControl(false);
	winScreenControl(false);
	goToLevel(0);
	loadLevel();
	initLevel();
});

export let level: LevelData;

export function loadLevel() {
	const { data, name, theme } = levels[currentLevel];
	setLevelInfo(name, currentLevel);
	level = JSON.parse(JSON.stringify(data));
	if (theme === 0) { // Dungeon
		setBackgroundColor(0x111111);
	} else if (theme === 1) { // Dungeon 2
		setBackgroundColor(0x111811);
	} else if (theme === 2) { // Tomb
		setBackgroundColor(0x211F11);
	} else if (theme === 3) { // Tomb 2
		setBackgroundColor(0x14120F);
	} else if (theme === 4) { // Quartz
		setBackgroundColor(0x382F31);
	} else if (theme === 5) { // Quartz 2
		setBackgroundColor(0x4A3737);
	}
}

export function winGame() {
	sound.play('next');
	winScreenControl(true);
}

export function goToNextLevel() {
	// Check if there is a next level
	sound.play('win');
	blockerControl(true);
	if (levels[currentLevel + 1] === undefined) {
		setTimeout(winGame, 1500);
		return;
	}
	setTimeout(() => {
		sound.play('next');
		nextLevel();
		loadLevel();
		initLevel();
	}, 1500);

	setTimeout(() => {
		blockerControl(false);
	}, 2000);
}

export function exportLevel() {
	console.log(JSON.stringify(level));
}
window.exportLevel = exportLevel;

function loadEmptyLevel(width: number, height: number): void {
	level = [];
	for (let y = 0; y < height; y++) {
		level.push([]);
		for (let x = 0; x < width; x++) {
			const isEdge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
			level[y].push(isEdge ? Tile.Wall1 : getBgTile());
		}
	}
	initLevel();
}
window.loadEmptyLevel = loadEmptyLevel;

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

function getBgTile(): Tile {
	if (currentLevel <= 10) {
		return Tile.Background1;
	}
	return Tile.Background2;
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
		cursorSprite = undefined;
		lightBgLookup = {};
		lightLookup = {};
		tileLookup = {};
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
					tile,
				};
				createTileSprite(getBgTile(), x, y);
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
	const isWallAbove = y > 0 && isWall(level[y - 1][x]);
	const isWallLeft = x > 0 && isWall(level[y][x - 1]);
	const sprite = new Sprite();
	const texture = `lightbg${isWallLeft ? 'l' : ''}${isWallAbove ? 't' : ''}`;
	sprite.texture = getTexture(texture);
	sprite.x = x * tileWidth + wallTileOffset;
	sprite.y = y * tileWidth + wallTileOffset;
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
	if (editorMode) return;
	const tilesLit = Object.keys(lightBgLookup).length;
	setTilesLit(tilesLit, tilesToLight);
	if (tilesLit === tilesToLight) {
		goToNextLevel();
	}
}

function lightBgIteration(x: number, y: number, strength: number) {
	if (strength <= 0) return;
	if (x < 0 || y < 0 || x >= level[0].length || y >= level.length) return;
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
	cursorSprite.alpha = 0;
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

let levelHeld = false;
let levelHeldPosition: null | Point = null;

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
	if (!levelHeld && (
		tileMousePosition.x < 0 ||
		tileMousePosition.y < 0 ||
		tileMousePosition.x >= level[0].length ||
		tileMousePosition.y >= level.length
	)) {
		return;
	}
	if (editorMode) {
		if (mouseButtons.has(0)) {
			const { x, y } = tileMousePosition;
			deleteTileSprite(x, y);
			level[y][x] = currentEditorTile;
			if (isLight(currentEditorTile)) {
				const light = lightLookup[`${x},${y}`];
				if (light) {
					levelCon.removeChild(light.sprite);
					light.sprite.destroy();
				}
				const sprite = createTileSprite(currentEditorTile, x, y);
				levelCon.addChild(sprite);
				lightLookup[`${x},${y}`] = {
					x,
					y,
					strength: getLightStrength(currentEditorTile),
					sprite,
					texture: getTileTexture(currentEditorTile),
					tile: currentEditorTile,
				};
				updateLightBgSprites();
			} else {
				const sprite = createTileSprite(currentEditorTile, x, y);
				levelCon.addChild(sprite);
				updateLightBgSprites();
			}
		} else if (mouseButtons.has(2)) {
			const { x, y } = tileMousePosition;
			deleteTileSprite(x, y);
			// Delete light
			const light = lightLookup[`${x},${y}`];
			if (light) {
				level[y][x] = getBgTile();
				delete lightLookup[`${x},${y}`];
				levelCon.removeChild(light.sprite);
				light.sprite.destroy();
			}
			updateLightBgSprites();
		}
	} else {
		if (grabbedLight) {
			setCursor('move');

			if (!mouseButtons.has(0)) {

				// Check if the light can be placed
				const { x, y } = tileMousePosition;
				if (!isBackground(level[y][x])) return;

				// Place the light
				sound.play('off');
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
				level[y][x] = light.tile ? light.tile : Tile.Light1;
				grabbedLight = undefined;

				// Update the light bg sprites
				updateLightBgSprites();
			}
			return;
		}

		if (levelHeld) {
			if (levelHeldPosition === null) {
				levelHeldPosition = new Point(mousePosition.x, mousePosition.y);
			} else {
				const dx = mousePosition.x - levelHeldPosition.x;
				const dy = mousePosition.y - levelHeldPosition.y;
				levelCon.position.x += dx;
				levelCon.position.y += dy;
				levelHeldPosition.x = mousePosition.x;
				levelHeldPosition.y = mousePosition.y;
			}

			if (!mouseButtons.has(0)) {
				levelHeld = false;
				levelHeldPosition = null;
			}
			return;
		}


		// See if there is a light to grab
		const { x, y } = tileMousePosition;
		const light = lightLookup[`${x},${y}`];
		if (light === undefined || !isMovableLight(level[y][x])) {
			setCursor('default');

			if (mouseButtons.has(0)) {
				levelHeld = true;
			}

			return;
		}

		setCursor('grab');
		if (mouseButtons.has(0)) {
			// Grab the light
			sound.play('on');
			level[y][x] = getBgTile();
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

const levelList = document.getElementById('levelList') as HTMLDivElement;
levels.forEach((_, index) => {
	const button = document.createElement('button');
	button.classList.add('levelButton');
	button.innerText = `${index + 1}`;
	button.addEventListener('click', () => {
		goToLevel(index);
		loadLevel();
		initLevel();
		levelMenuControl(false);
	});
	levelList.appendChild(button);
	updateLevelButtons();
});

function updateLevelButtons() {
	const levelButtons = document.querySelectorAll('.levelButton');
	levelButtons.forEach((button, index) => {
		if (index > currentLevel) {
			button.classList.add('locked');
		} else {
			button.classList.remove('locked');
		}
	});
}

const editorTiles = document.getElementById('editorTiles') as HTMLDivElement;

export function createTileElements() {
	for (const tile in Tile) {
		if (isNaN(Number(tile))) {
			const tileId = Tile[tile as keyof typeof Tile];
			const tileBtn = document.createElement('button');
			tileBtn.classList.add('tile');
			tileBtn.innerText = tile;
			tileBtn.addEventListener('click', () => {
				currentEditorTile = tileId;
				setLevelNumber(`${tileId}`);
				setLevelName(`${tile}`);
			});
			editorTiles.appendChild(tileBtn);
		}
	}
}

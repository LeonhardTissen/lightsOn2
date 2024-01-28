import { Assets, Texture } from 'pixi.js';

import game from '../assets/imgs/game.spritesheet.json';

const gameTextures: Record<string, Texture> = {};

export function loadGameAssets(): Promise<Record<string, Texture>> {
	return new Promise((resolve, reject) => {
		Assets.addBundle('game', { game });
		Assets.load('game', (ev) => {
			console.log(ev); // Percentage
		}).then((assets) => {
			for (const [filename, texture] of Object.entries(assets.textures)) {
				gameTextures[filename.replace('.png', '')] = texture as Texture;
			}

			resolve(gameTextures);
		}).catch(reject);
	});
}

export function getTexture(name: string): Texture {
	const texture = gameTextures[name];
	if (texture === undefined) {
		throw new Error(`Unhandled Texture: ${name}`);
	}
	return texture;
}

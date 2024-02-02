import { loadGameAssets } from './pixi/assets';
import './pixi/app';

import './css/style.css';
import { createTileElements, initLevel, loadLevel } from './level';
import './resize';
import './mouse';

loadGameAssets().then(() => {
	console.log('Assets loaded');
	loadLevel();
	initLevel();
	createTileElements();
});

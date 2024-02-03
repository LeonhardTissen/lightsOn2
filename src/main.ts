import { loadGameAssets } from './pixi/assets';
import './pixi/app';

import './css/style.css';
import { createTileElements, initLevel, loadLevel } from './level';
import './resize';
import './mouse';

console.info('%cDev by Warze🎩', 'font-weight: bold; font-size: 50px;color: red; text-shadow: 1px 1px 0 #600000 , 2px 2px 0 #400000 , 3px 3px 0 #000000');
console.info('%ccontact@warze.org & https://warze.org', 'font-weight: bold; font-family: sans-serif; font-size: 24px;color: #FF8888; text-shadow: 2px 2px 0 #300000, 1px 1px 0 #200000 , 2px 2px 0 #000000');

loadGameAssets().then(() => {
	console.log('Assets loaded');
	loadLevel();
	initLevel();
	createTileElements();
});

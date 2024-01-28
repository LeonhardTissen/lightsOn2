import { loadGameAssets } from './pixi/assets';
import './pixi/app';

import './css/style.css';

loadGameAssets().then(() => {
	console.log('Assets loaded');
});

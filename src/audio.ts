import { Howl } from 'howler';
import spriteData from './assets/spritesheet.json';

export const sound = new Howl({
	src: spriteData.urls,
	sprite: {
		next: [spriteData.sprite.next[0], spriteData.sprite.next[1]],
		off: [spriteData.sprite.off[0], spriteData.sprite.off[1]],
		on: [spriteData.sprite.on[0], spriteData.sprite.on[1]],
		win: [spriteData.sprite.win[0], spriteData.sprite.win[1]],
	},
});

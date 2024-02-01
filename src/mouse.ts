import { Point } from 'pixi.js';
import { handleMouseLevel } from './level';
import { app } from './pixi/app';

export const mousePosition: Point = new Point();

export const mouseButtons: Set<number> = new Set();

function handleMouseMove(event: MouseEvent) {
	mousePosition.x = event.clientX;
	mousePosition.y = event.clientY;
	handleMouseLevel();
}

app.view.addEventListener('mousemove', handleMouseMove);

function handleMouseDown(event: MouseEvent) {
	mouseButtons.add(event.button);
	handleMouseLevel();
}

app.view.addEventListener('mousedown', handleMouseDown);

function handleMouseUp(event: MouseEvent) {
	mouseButtons.delete(event.button);
	handleMouseLevel();
}

app.view.addEventListener('mouseup', handleMouseUp);

app.view.addEventListener('contextmenu', (event) => {
	event.preventDefault();
});

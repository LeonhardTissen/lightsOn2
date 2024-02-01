import { Point } from 'pixi.js';
import { handleMouseLevel } from './level';

export const mousePosition: Point = new Point();

export const mouseButtons: Set<number> = new Set();

function handleMouseMove(event: MouseEvent) {
	mousePosition.x = event.clientX;
	mousePosition.y = event.clientY;
	handleMouseLevel();
}

document.addEventListener('mousemove', handleMouseMove);

function handleMouseDown(event: MouseEvent) {
	mouseButtons.add(event.button);
	handleMouseLevel();
}

document.addEventListener('mousedown', handleMouseDown);

function handleMouseUp(event: MouseEvent) {
	mouseButtons.delete(event.button);
	handleMouseLevel();
}

document.addEventListener('mouseup', handleMouseUp);

document.addEventListener('contextmenu', (event) => {
	event.preventDefault();
});

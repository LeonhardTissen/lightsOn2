import { handleKeyboardLevel } from './level';

export const pressedKeys = new Set<string>();

function handleKeyDown(event: KeyboardEvent) {
	const key = event.key;
	pressedKeys.add(key);
	handleKeyboardLevel();
}

function handleKeyUp(event: KeyboardEvent) {
	const key = event.key;
	pressedKeys.delete(key);
}

// Add event listeners
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

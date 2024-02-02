import { exportLevel, toggleEditorMode } from './level';

export const pressedKeys = new Set<string>();

function handleKeyDown(event: KeyboardEvent) {
	const key = event.key;
	pressedKeys.add(key);

	if (key === 'e') {
		toggleEditorMode();
	} else if (key === 'x') {
		exportLevel();
	}
}

function handleKeyUp(event: KeyboardEvent) {
	const key = event.key;
	pressedKeys.delete(key);
}

// Add event listeners
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

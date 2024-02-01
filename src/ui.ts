export function setLevelText(text: string) {
	document.getElementById('levelName')!.innerText = text;
}
export function setLevelName(name: string, levelNumber: number) {
	setLevelText(`Level ${levelNumber + 1} - ${name}`);
}

export function blockerControl(active: boolean) {
	const blocker = document.getElementById('blocker')!;
	const levelName = document.getElementById('levelName')!;
	const ui = document.getElementById('ui')!;
	levelName.style.color = active ? 'black' : 'white';
	blocker.style.opacity = active ? '1' : '0';
	blocker.style.pointerEvents = active ? 'all' : 'none';
	ui.style.bottom = active ? '50%' : '0';
	ui.style.left = active ? '50%' : '0';
	ui.style.transform = active ? 'translate(-50%, 50%)' : 'translate(0, 0)';

}

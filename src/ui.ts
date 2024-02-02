export function setLevelName(text: string) {
	document.getElementById('levelName')!.innerText = text;
}
export function setLevelNumber(text: string) {
	document.getElementById('levelNumber')!.innerText = text;
}
export function setLevelInfo(name: string, levelNumber: number) {
	setLevelName(name);
	setLevelNumber(`${levelNumber + 1}`);
}
export function setTilesLit(lit: number, total: number) {
	document.getElementById('tilesLit')!.innerText = `${lit}/${total}`;
}

export function blockerControl(active: boolean) {
	const blocker = document.getElementById('blocker')!;
	const levelText = document.getElementById('levelText')!;
	const ui = document.getElementById('ui')!;
	levelText.style.color = active ? 'black' : 'white';
	blocker.style.opacity = active ? '1' : '0';
	blocker.style.pointerEvents = active ? 'all' : 'none';
	ui.style.bottom = active ? '50%' : '0';
	ui.style.left = active ? '50%' : '0';
	ui.style.transform = active ? 'translate(-50%, 50%)' : 'translate(0, 0)';
}

export function winScreenControl(active: boolean) {
	const levelText = document.getElementById('levelText')!;
	const winScreen = document.getElementById('winScreen')!;
	winScreen.style.display = active ? 'block' : 'none';
	winScreen.style.pointerEvents = active ? 'all' : 'none';
	levelText.style.display = active ? 'none' : 'block';
}

export function causeLevelTextAnimation() {
	const levelText = document.getElementById('levelText')!;
	levelText.style.animation = 'flick 0.6s ease-out';
	levelText.addEventListener('animationend', () => {
		levelText.style.animation = '';
	});
}

const levelMenu = document.getElementById('levelMenu')!;
const levelMenuBackground = document.getElementById('levelMenuBackground')!;
export function levelMenuControl(active: boolean) {
	levelMenu.style.display = active ? 'block' : 'none';
	levelMenuBackground.style.pointerEvents = active ? 'all' : 'none';
	levelMenuBackground.style.backgroundColor = active ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0)';
	levelMenuBackground.style.backdropFilter = active ? 'blur(5px)' : 'blur(0)';
}

const levelMenuButton = document.getElementById('levelMenuButton')!;
levelMenuButton.addEventListener('click', () => {
	levelMenuControl(levelMenu.style.display === 'none');
});

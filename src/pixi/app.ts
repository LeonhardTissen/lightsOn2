import { Application } from 'pixi.js';

export const app = new Application<HTMLCanvasElement>({
	antialias: false, // Disable antialiasing
});
window.__PIXI_APP__ = app;

function resize(): void {
	app.renderer.resize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);
resize();

app.renderer.background.color = 0x111111;
app.view.id = 'game';
document.body.appendChild(app.view);

export function setCursor(cursor: string): void {
	app.view.style.cursor = cursor;
}

import { Application, Filter } from 'pixi.js';

declare global {
	interface Window {
        __PIXI_APP__: Application
        tealFilter: Filter
        resizeEditorLevel: (x: number, y: number) => void
		exportLevel: () => void
		toggleEditorMode: () => void
		loadEmptyLevel: (width: number, height: number) => void
    }
}

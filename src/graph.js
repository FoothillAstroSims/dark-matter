import * as PIXI from 'pixi.js';

function newGraph() {
    const g = new PIXI.Graphics();
    return g;
}

class Plot {
    constructor(height_px, width_px) {
        this.height_px = height_px;
        this.width_px = width_px;
    }
}
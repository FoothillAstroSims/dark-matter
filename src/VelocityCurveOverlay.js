import * as PIXI from 'pixi.js-legacy';
import {GALAXIES, GALAXY_DATA, DEFAULT_GALAXY_KEY} from './galaxyData.js';
import { MAX_VELOCITY } from './galaxy.js';
import {RAW_VELOCITY_DATA} from './rawData.js';


const KPC_PER_DATA_POINT = 0.05;
const KLY_PER_KPC = 3.26156;


/**
 * VelocityCurveOverlay displays line plots of real galaxy velocity curves.
 * The desired galaxy can be selected from the avaliable galaxies in the
 * galaxyData module.
 */
export default class VelocityCurveOverlay {
    constructor(width, height, maxX, maxY) {
        this.container = new PIXI.Container();
        this.width = width;
        this.height = height;
        this.maxX = maxX;
        this.maxY = maxY;
        this.galaxyKey = DEFAULT_GALAXY_KEY;
        // this.mask = makeGreenRectangle(width, height);
        this.g = new PIXI.Graphics();

        // this.g.mask = this.mask;
        // this.container.addChild(this.mask);
        this.container.addChild(this.g);
        // this.update();
    }


    setMaxX(newMaxX) {
        this.maxX = newMaxX;
        this.update();
    }

    setMaxY(newMaxY) {
        this.maxY = newMaxY;
        this.update();
    }

    setGalaxy(galaxyKey) {
        this.galaxyKey = galaxyKey;
        this.update();
    }

    addToParent(parent) {
        parent.addChild(this.container);
    }

    update() {

        this.g.clear();

        const ngc = GALAXY_DATA[this.galaxyKey].NGC;
        if (ngc === null) {
            return;
        }

        const data = RAW_VELOCITY_DATA[ngc];
        const dataLength = data.length;
        const PIXELS_PER_KLY = this.width / this.maxX;
        const X_PIXELS_PER_KPC = PIXELS_PER_KLY * KLY_PER_KPC;
        const X_PIXELS_PER_DATA_POINT = KPC_PER_DATA_POINT * X_PIXELS_PER_KPC;
        
        /* Draw the velocity curve using the dataset */
        this.g.lineStyle(4, 0x2e8dd1);
        this.g.moveTo(0, (this.maxY - data[0]) * this.height / this.maxY);
        for (let k = 1; k < dataLength; k++) {
            const x = k * X_PIXELS_PER_DATA_POINT;
            const y = (this.maxY - data[k]) * this.height / this.maxY;
            this.g.lineTo(x, y);
            if (x > this.width) {
                break;
            }
        }
        this.g.endFill();
    }

}


function makeGreenRectangle(width, height) {
    const g = new PIXI.Graphics();
    g.beginFill(0x00ff00, 0.5);
    g.drawRect(0, 0, width, height);
    g.endFill();
    return g;
}

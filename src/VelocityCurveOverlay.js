import * as PIXI from 'pixi.js';
import {GALAXIES} from './galaxyData.js';


const TEXTURES = {
    [GALAXIES.MILKY_WAY]: PIXI.Texture.from('./img/svgs/MilkyWay.svg'),
}

export default class VelocityCurveOverlay {
    constructor() {
        this.sprite = new PIXI.Sprite(TEXTURES[GALAXIES.MILKY_WAY]);
    }
}
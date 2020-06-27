import * as PIXI from 'pixi.js-legacy';
import {GALAXIES, GALAXY_DATA} from './galaxyData.js';


/**
 * TEXTURES is a map from galaxyKeys to PixiTextures. It's generated from
 * whatever image filepaths are put into the GALAXY_DATA found in the 
 * galaxyData.js module. Any Additional galaxies or images that are added 
 * there will be automatically added here.
 */
const TEXTURES = Object.fromEntries(
    Object.entries(GALAXY_DATA)
    .map(([ key, val ]) => [ key, makeTexture(val.IMG) ])
);

/**
 * VelocityCurveOverlay displays pictures of real galaxy velocity curves.
 * The desired galaxy can be selected from the availiable images found in the
 * galaxyData.js module. The PIXI sprite will be changed to display the proper
 * image whenever you call the setImageTo(galaxyKey) method. The galaxy keys
 * are also found in the galaxyData.js module.
 */
export default class VelocityCurveOverlay {
    constructor() {
        this.sprite = new PIXI.Sprite(TEXTURES[GALAXIES.MILKY_WAY]);
    }

    getPixiObject() {
        return this.sprite;
    }

    setImageTo(galaxyKey) {
        this.sprite.texture = TEXTURES[galaxyKey];
    }
}

/**
 * Returns a PIXI Texture based on the image path string given. If given the 
 * parameter of "null", this wil assume you want a blank image, which is used
 * to enable the existence of a "no galaxy overlay" option in the simulation.
 */
function makeTexture(imagePath) {
    if (imagePath === null) {
        return PIXI.Texture.EMPTY;
    }
    return PIXI.Texture.from(imagePath);
}
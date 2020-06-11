

const NUM_POINTS = 10;
const NUM_STARS_IN_GALAXY = 200;

const DM_BIN_WIDTH = 10.0;
const LIGHT_YEAR = 9.46e15;
const MSUN = 1.989e30;
const G = 6.67408e-11;
const SECONDS_PER_YEAR = 3.154e7;

export const DEFAULT_DENSITY_DATA = [0.8, 0.7, 0.5, 0.2, 0.1, 0.08, 0.06, 0.04, 0.02, 0.01];

export default class Galaxy {
    constructor() {
        this.sliderData = new Array(NUM_POINTS);
        this.density = new Array(NUM_POINTS);
        this.volume = new Array(NUM_POINTS);
        this.shellMass = new Array(NUM_POINTS);
        this.totalMass = new Array(NUM_POINTS);
        this.orbitalVelocity = new Array(NUM_POINTS);
        this.updateData(DEFAULT_DENSITY_DATA);
    }

    /**
     * Updates galaxy information through an input data array from a slider,
     * where all of the values are in between 0 and 1. The values are mapped
     * into the correct units. The total mass and orbital velocites are 
     * calculated automatically, and can be retrieved after calling this.
     * @param dataArray {[Number]Array} 
     */
    updateData(dataArray) {
        if (dataArray.length !== NUM_POINTS) {
            throw "input data array wrong length. expected: ${NUM_POINTS}, got: ${dataArray.length}";
        }
        for (let k = 0; k < NUM_POINTS; k++) {
            this.sliderData[k] = dataArray[k];
        }
        this._updateAll();
    }

    /** 
     * Oribtal Velocity of k-th data point, in units of km/s
     */
    getOrbitalVelocity(k) {
        return this.orbitalVelocity[k] / 1e3;
    }

    getOrbitalVelocityNormalized(k) {
        return this.orbitalVelocity[k] / 1582e3;
    }

    /**
     * Total Mass Enclosed of k-th data point, in units of Sun-Masses.
     */
    getTotalMassEnclosed(k) {
        return this.totalMass[k] / MSUN;
    }

    getTotalMassEnclosedNormalized(k) {
        return this.totalMass[k] / (1.783e13 * MSUN);
    }

    _updateAll() {
        for (let k = 0; k < NUM_POINTS; k++) {
            this.density[k] = this.sliderData[k] * 1e-20;
            this.volume[k] = 4 / 3 * Math.PI * (Math.pow(radius(k), 3) - Math.pow(radius(k - 1), 3)) * Math.pow(1e3 * LIGHT_YEAR, 3);
            this.shellMass[k] = this.volume[k] * this.density[k];
            this.totalMass[k] = (k === 0) ? this.shellMass[k] : (this.totalMass[k-1] + this.shellMass[k]);
            this.orbitalVelocity[k] = Math.sqrt(G * this.totalMass[k] / (radius(k) * 1e3 * LIGHT_YEAR));
        }
    }
}

function radius(n) {
    return DM_BIN_WIDTH * (n + 1);
}
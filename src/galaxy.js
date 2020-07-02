

const NUM_POINTS = 10;

const DM_BIN_WIDTH = 5;
const LIGHT_YEAR = 9.46e15;
const MSUN = 1.989e30;
const G = 6.67408e-11;

const EARTH_VOLUME_KM3 = 1.083e12;


export const MAX_DENSITY = 100;
export const MAX_RADIUS = DM_BIN_WIDTH * NUM_POINTS;

const DEFAULT_MAX_MASS_ENCLOSED = 2.5e11
export let MAX_MASS_ENCLOSED = DEFAULT_MAX_MASS_ENCLOSED;


const DEFAULT_MAX_VELOCITY = 300;
export let MAX_VELOCITY = DEFAULT_MAX_VELOCITY;

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

    getRadiusPerPoint() {
        return DM_BIN_WIDTH;
    }

    getDensity(k) {
        return this.density[k];
    }

    getDensityNormalized(k) {
        // console.log(k, this.density[k], Galaxy.densityToSliderValue(this.density[k]).toFixed(2));
        return Galaxy.densityToSliderValue(this.density[k]);
    }

    /** 
     * Oribtal Velocity of k-th data point, in units of km/s
     */
    getOrbitalVelocity(k) {
        return this.orbitalVelocity[k];
    }

    getOrbitalVelocityNormalized(k) {
        return this.orbitalVelocity[k] / MAX_VELOCITY;
    }

    /**
     * Total Mass Enclosed of k-th data point, in units of Sun-Masses.
     */
    getTotalMassEnclosed(k) {
        return this.totalMass[k] / MSUN;
    }

    getTotalMassEnclosedNormalized(k) {
        return this.totalMass[k] / MSUN /MAX_MASS_ENCLOSED;
    }

    _updateAll() {
        for (let k = 0; k < NUM_POINTS; k++) {
            this.density[k] = Galaxy.sliderValueToDensity(this.sliderData[k])
            // this.density[k] = this.sliderData[k] * MAX_DENSITY;
            this.volume[k] = 4 / 3 * Math.PI * (Math.pow(radius(k), 3) - Math.pow(radius(k - 1), 3)) * Math.pow(1e3 * LIGHT_YEAR, 3);
            this.shellMass[k] = this.volume[k] * convertToKGM3(this.density[k]);
            this.totalMass[k] = (k === 0) ? this.shellMass[k] : (this.totalMass[k-1] + this.shellMass[k]);
            this.orbitalVelocity[k] = Math.sqrt(G * this.totalMass[k] / (radius(k) * 1e3 * LIGHT_YEAR))  / 1e3;
        }
        this._updateMaxVelocity();
        this._updateTotalMass();
    }

    _updateMaxVelocity() {
        let highestVelocity = Math.max(...this.orbitalVelocity);
        let roundedHighestVelocity = Math.floor(highestVelocity / 100 + 1) * 100;
        MAX_VELOCITY = Math.max(roundedHighestVelocity, 300);
    }

    _updateTotalMass() {
        let highestTotalMass = Math.max(...this.totalMass)  / MSUN; 
        let roundedHighestTotalMass = Math.floor(highestTotalMass / 1e11 + 1) * 1e11;
        // let roundedHighestTotalMass = Math.pow(10, Math.ceil(5 * Math.log10(highestTotalMass)/5 ));
        MAX_MASS_ENCLOSED = roundedHighestTotalMass;
    }

    static sliderValueToDensity(sliderValue) {
        const k = 1 / Math.log10(MAX_DENSITY + 1);
        return Math.pow(10, sliderValue / k) - 1;
    }

    static densityToSliderValue(density) {
        const k = 1 / Math.log10(MAX_DENSITY + 1);
        return k * Math.log10(density + 1)
    }
}

function radius(n) {
    return DM_BIN_WIDTH * (n + 1);
}

function convertToGramsPerEarthVolume(kgm3) {
    return kgm3 * (EARTH_VOLUME_KM3 * 1e9);
}

function convertToKGM3(gramsPerEarthVolume) {
    return gramsPerEarthVolume / (EARTH_VOLUME_KM3 * 1e9);
}
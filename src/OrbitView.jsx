import React from 'react';
import Galaxy, {DEFAULT_DENSITY_DATA, MAX_DENSITY, MAX_VELOCITY, MAX_MASS_ENCLOSED} from './galaxy.js';
import * as PIXI from 'pixi.js-legacy';
import {GALAXIES, GALAXY_DATA, DEFAULT_GALAXY_KEY} from './galaxyData.js';
import VelocityCurveOverlay from './VelocityCurveOverlay.js'

/**
 * Size (in units of pixels) of the PIXI Bitmap for OrbitView.
 * The shape of the PIXI display area is a square, so this value will be used
 * for both the width and height.
 */
export const ORBIT_VIEW_SIZE = 800;

/**
 * Width in pixels of the the controller and graph area, located to the right
 * of the Orbit View area.
 */
const GRAPH_AREA_WIDTH = 667;

/**
 * Size of the underlying "graph", where (0,0) is at the center of the display
 * area, and MAX_GRAPH_SIZE extends in both negative and positive directions
 * from the origin (for both x and y axes)
 */
const MAX_GRAPH_SIZE = 1;

/* Number of star sprites to randomly generate in the galaxy simulation. */
const DOTS_TO_GENERATE = 200;

/* The size of the grid hash-marks in the Galaxy Viewport Area. */
const GALAXY_GRID_LINE_SIZE = 0.025;

/* The size of each grid square in the Graph Control Area. */
const GRAPH_GRID_SIZE = ORBIT_VIEW_SIZE / 30;

/* Number of Data Points to use on the graphs. (and Number of Sliders) */
const N_SLIDES = 10;

/* Radius of a normal data point on the velocity and total-mass graphs. */
const GRAPH_NORMAL_DATA_POINT_RADIUS = 10;

/* Radius of the data points on density graph, used as slider handles */
const GRAPH_SLIDER_HANDLE_DATA_POINT_RADIUS = 25;

const GRAPH_AXIS_LEFT_X = 2 * GRAPH_GRID_SIZE;
const GRAPH_AXIS_RIGHT_X = GRAPH_AREA_WIDTH - GRAPH_GRID_SIZE;
const GRAPH_AXIS_WIDTH = GRAPH_AXIS_RIGHT_X - GRAPH_AXIS_LEFT_X;
const GRAPH_AXIS_HEIGHT = getGraphAxisBottomY(0) - getGraphAxisTopY(0);

const MIN_SLIDER_Y = getGraphAxisTopY(0);
const MAX_SLIDER_Y = getGraphAxisBottomY(0);

/* Font Settings for Axis Labels (used by Pixi Text) */
const FONT_DATA_FOR_AXES = {
    fontFamily: 'Georgia',
    fontSize: 26,
    fill: 0xFFFFFF,
}

const FONT_DATA_FOR_X_AXIS_TITLE = {
    fontFamily: 'Georgia',
    fontSize: 16,
    fill: 0xFFFFFF,
}

const FONT_DATA_FOR_POINTS = {
    fontFamily: 'Georgia',
    fontSize: 12,
    fill: 0xFFFFFF,
}

const FONT_DATA_FOR_Y_AXIS_GRIDLINE_LABELS = {
    fontFamily: 'Georgia',
    fontSize: 12,
    fill: 0xFFFFFF,
    align: "right",
}

function getGraphAxisTopY(n) {
    return ORBIT_VIEW_SIZE / 3 * n  +  2 * GRAPH_GRID_SIZE;
}

function getGraphAxisBottomY(n) {
    return ORBIT_VIEW_SIZE / 3 * (n + 1)  -  2 * GRAPH_GRID_SIZE;
}


let galaxy = new Galaxy();

let sliderValues = new Array(N_SLIDES);
for (let i = 0; i < N_SLIDES; i++) { sliderValues[i] = 0; }

let singleton;

/**
 * OrbitView is the main animation display area for the Dark Matter Simulator.
 * All of the fun galaxy movements happen here. Data from the controls are
 * accessed through props.
 */
export default class OrbitView extends React.Component {
    constructor(props) {
        super(props);
        singleton = this;
        this.state = {};

        this.velocityCurveOverlay = new VelocityCurveOverlay();

        this.objects = {
            densityRings: new PIXI.Container(),
            background: new PIXI.Graphics(),
            galaxy: new PIXI.Graphics(),
            graphs: new PIXI.Graphics(),
        };

        this.galaxyShellContainers = new Array(10);

        this.densityGraphPoints = new Array(10);
        this.velocityGraphPoints = new Array(10);
        this.massGraphPoints = new Array(10);

        this.densityGraphData = new Array(10);
        this.velocityGraphData = new Array(10);
        this.massGraphData = new Array(10);

        this.densityDataText = new Array(10);
        this.velocityDataText = new Array(10);
        this.massDataText = new Array(10);

        this.redGlowRings = new Array(10);

        this.yAxisLabelText = new Array(3);
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            antialias: true,
            width: ORBIT_VIEW_SIZE + GRAPH_AREA_WIDTH,
            height: ORBIT_VIEW_SIZE,
            resolution: Math.min(window.devicePixelRatio, 2) || 1,
            autoDensity: true,
        });
        this.app.renderer.plugins.interaction.autoPreventDefault = false;
        this.app.renderer.view.style['touch-action'] = 'auto';
        this.pixiElement.appendChild(this.app.view);
        for (let [,val] of Object.entries(this.objects)) {
            this.app.stage.addChild(val);
        }
        this.init();
        this.app.ticker.add(this.update.bind(this));
    }

    render() {
        return (
            <React.Fragment>
                <div
                    className="OrbitView"
                    ref={(thisDiv) => { this.pixiElement = thisDiv; }}
                />
                {/* <pre style={{color: 'white'}}>{JSON.stringify(this.state, null, '\t')}</pre> */}
            </React.Fragment>
        )
    }

    componentDidUpdate(prevProps) {
        if (this.props.isDarkMatterGlowEnabled !== prevProps.isDarkMatterGlowEnabled) {
            this.objects.densityRings.visible = this.props.isDarkMatterGlowEnabled;
        }
        if (this.props.galaxyChoice !== prevProps.galaxyChoice) {
            console.log(this.props.galaxyChoice, GALAXY_DATA[this.props.galaxyChoice].NAME);
            this.velocityCurveOverlay.setImageTo(this.props.galaxyChoice);
            this.updateVelocityCurveOverlay();
        }

        /* TODO: If one of them changes, then do the following: */
        for (let k = 0; k < 10; k++) {
            if (this.props.sliderValues[k] !== prevProps.sliderValues[k]) {
                this.densityGraphPoints[k].position.y = MAX_SLIDER_Y - this.props.sliderValues[k] * GRAPH_AXIS_HEIGHT;
                this.updateAllGraphRelatedStuff();
            }
        }
    }

    init() {
        this.initVelocityCurveOverlay();
        this.initRedGlowRings();
        this.initBackground();
        this.initGalaxy();
        this.initGraphs();
        this.initDataPointText();
        this.updateAllGraphRelatedStuff(); // initial update to sync data.
    }

    update(delta) {
        this.updateGalaxy(delta);
    }

    updateAllGraphRelatedStuff() {
        galaxy.updateData(this.props.sliderValues);
        this.updateGraphPoints();
        this.updateDataText();
        this.updateDensityRings();
        this.updateVelocityCurveOverlay();
    }

    // ------------------------------------------------------------
    // Init Methods for pixi objects
    // ------------------------------------------------------------

    initBackground() {

        const g = this.objects.background;
        g.cacheAsBitmap = true;
        let mid = xPixels(0);
        g.clear();

        /* Axes of Graph */
        g.lineStyle(2, 0xFFFFFF, 0.9);
        g.moveTo(mid, 0);
        g.lineTo(mid, ORBIT_VIEW_SIZE);
        g.moveTo(0, mid);
        g.lineTo(ORBIT_VIEW_SIZE, mid);

        /* Grid Lines */
        g.lineStyle(2, 0xFFFFFF, 0.8);
        for (let i = -10; i < 11; i++) {
            let x0 = xPixels(GALAXY_GRID_LINE_SIZE);
            let xf = xPixels(-GALAXY_GRID_LINE_SIZE);
            let y = yPixels(0.1 * i);
            g.moveTo(x0, y);
            g.lineTo(xf, y);
            g.moveTo(y, x0);
            g.lineTo(y, xf);
        }

        /* Shell Circles */
        g.lineStyle(2, 0xFFFFFF, 0.2);
        for (let i = 0; i < 10; i++) {
            let x = xPixels(0);
            let y = yPixels(0);
            let r = xPixels(0.1 * (i + 1) - 1);
            g.drawCircle(x, y, r);
        }
        g.endFill();
    }

    initGalaxy() {
        /* Create Containers for each "radius-shell" to put stars into */
        for (let k = 0; k < 10; k++) {
            const g = new PIXI.Container();
            g.x = g.pivot.x = ORBIT_VIEW_SIZE / 2;
            g.y = g.pivot.y = ORBIT_VIEW_SIZE / 2;
            this.galaxyShellContainers[k] = g;
            this.objects.galaxy.addChild(g);
        }
        for (let k = 0; k < DOTS_TO_GENERATE; k++) {
            const dot = newDotGraphic();
            const R = Math.random() * MAX_GRAPH_SIZE;
            const theta = Math.random() * 2 * Math.PI;
            dot.x = xPixels(R * Math.cos(theta));
            dot.y = yPixels(R * Math.sin(theta));
            this.galaxyShellContainers[getShellFromDot(R)].addChild(dot);
        }
        for (let k = 0; k < 10; k++) {
            // this.galaxyShellContainers[k].cacheAsBitmap = true;
        }
    }

    initRedGlowRings() {
        {
            const g = new PIXI.Graphics();
            g.beginFill(0xff0000);
            g.drawCircle(ORBIT_VIEW_SIZE/2, ORBIT_VIEW_SIZE/2, ORBIT_VIEW_SIZE * 0.05);
            g.endFill();
            this.redGlowRings[0] = g;
            this.objects.densityRings.addChild(g);
        }
        for (let k = 1; k < 10; k++) {
            const g = new PIXI.Graphics();
            let r = ORBIT_VIEW_SIZE * 0.05 * (2 * k + 1) / 2;
            g.lineStyle(ORBIT_VIEW_SIZE/20, 0xff0000, 0.7);
            g.arc(ORBIT_VIEW_SIZE/2, ORBIT_VIEW_SIZE/2, r, 0, 2*Math.PI);
            g.endFill();
            this.redGlowRings[k] = g;
            this.objects.densityRings.addChild(g);
        }   
    }

    initVelocityCurveOverlay() {
        this.velocityCurveOverlay.setImageTo(this.props.galaxyChoice);
        this.velocityCurveOverlay.sprite.x = GRAPH_AXIS_LEFT_X;
        this.velocityCurveOverlay.sprite.y = getGraphAxisTopY(1);
        this.velocityCurveOverlay.sprite.width = GRAPH_AXIS_WIDTH;
        this.velocityCurveOverlay.sprite.height = GRAPH_AXIS_HEIGHT;
        this.objects.graphs.addChild(this.velocityCurveOverlay.sprite);
    }

    initGraphs() {
        const g = this.objects.graphs;
        
        let w = GRAPH_AREA_WIDTH;
        let h = ORBIT_VIEW_SIZE;
        g.x = ORBIT_VIEW_SIZE;

        g.lineStyle(3, 0xFFFFFF);

        /* BEGIN: GRIDLINES EVERYWHERE */
        const N_GRIDS_X = Math.floor(w / GRAPH_GRID_SIZE) + 1;
        const N_GRIDS_Y = Math.floor(h / GRAPH_GRID_SIZE) + 1;
        g.lineStyle(1, 0xFFFFFF, 0.2);
        for (let i = 0; i < N_GRIDS_X; i++) {
            let x = GRAPH_GRID_SIZE * i;
            g.moveTo(x, 0)
            g.lineTo(x, h)
        }
        for (let i = 0; i < N_GRIDS_Y; i++) {
            let y = GRAPH_GRID_SIZE * i;
            g.moveTo(0, y);
            g.lineTo(w, y);
        }
        /* END */


        /* Horizontal Lines to seperate each graph more clearly. */
        g.lineStyle(2, 0xFFFFFF, 0.7);
        for (let i = 0; i < 4; i++) {
            g.moveTo(0, i*h/3);
            g.lineTo(w, i*h/3);
        }

        /* Add Individual Graph Backgrounds */
        let arrowSize = 10
        let pad = GRAPH_GRID_SIZE;
        let axisLeftX =  2 * pad
        let axisRightX = w - pad;
        let axisBottomY = (graphNum) => h/3 * (graphNum + 1) - 2 * pad;
        let axisTopY = (graphNum) => h/3 * graphNum + 2 * pad;
        let axisWidth = axisRightX - axisLeftX;
        let axisHeight = axisBottomY(0) - axisTopY(0);

        g.lineStyle(2, 0xFFFFFF, 1);
        for (let i = 0; i < 3; i++ ) {

            let x = axisLeftX;
            let xf = axisRightX;
            let y = axisBottomY(i);
            let yf = axisTopY(i);

            /* Draw Horizontal Axis and Right Arrow */
            g.moveTo(x, y);
            g.lineTo(xf, y);
            g.bezierCurveTo(xf, y, xf-arrowSize, y, xf-arrowSize, y-(arrowSize));
            g.moveTo(xf, y);
            g.bezierCurveTo(xf, y, xf-arrowSize, y, xf-arrowSize, y+(arrowSize));

            /* Draw Vertical Axis and UP Arrow */
            g.moveTo(x, y);
            g.lineTo(x, yf);
            g.bezierCurveTo(x, yf, x, yf+arrowSize, x-arrowSize, yf+(arrowSize));
            g.moveTo(x, yf);
            g.bezierCurveTo(x, yf, x, yf+arrowSize, x+arrowSize, yf+(arrowSize));
        }

        /* Graph Labels */

        const titleTexts = [
            // 'Dark Matter Density (kg/m³)',
            'Dark Matter Density (kilograms per Earth-volume)',
            'Orbital Velocity (km/s)',
            'Total Mass Enclosed (Solar Masses)',
        ];

        for (let i = 0; i < titleTexts.length; i++) {
            const t = new PIXI.Text(titleTexts[i], FONT_DATA_FOR_AXES);
            t.anchor.set(0, 0.5)
            // t.resolution = 2;
            t.x = 0.5 * pad;
            t.y = axisTopY(i) - pad * (i===0? 1.5 : 1);
            g.addChild(t);
        }

        /* Special Y-axis label to point out the fact that its a log graph */
        {
            const t = new PIXI.Text('Log-Scale', FONT_DATA_FOR_AXES);
            t.anchor.set(0.5);
            t.y = ( axisTopY(0) + axisBottomY(0) ) / 2;
            t.rotation = 3 * Math.PI / 2;
            g.addChild(t);
        }

        /* Add X-axis Titles that say "Radius" */
        for (let i = 0; i < 3; i++) {
            const t = new PIXI.Text('Radius (Thousands of Light-Years)', FONT_DATA_FOR_X_AXIS_TITLE);
            t.anchor.set(0.5);
            // t.resolution = 2;
            t.x = axisLeftX + axisWidth/2;
            t.y = axisBottomY(i) + pad + 5;
            g.addChild(t);
        }

        /* Add X-axis Gridline labels */
        for (let i = 0; i < 3; i++) {
            for (let k = 0; k < 10; k++) {
                const radius = (galaxy.getRadiusPerPoint() * (k + 1));
                const t = new PIXI.Text(radius, FONT_DATA_FOR_POINTS);
                t.anchor.set(0.5);
                t.x = axisLeftX + 2*pad * (k+1);
                t.y = axisBottomY(i) + 12;
                g.addChild(t);
            }
        }
        /* Add Y-axis Gridline labels */
        let max_y_values = [MAX_DENSITY, MAX_VELOCITY, MAX_MASS_ENCLOSED];
        for (let i = 0; i < 3; i++) {
            this.yAxisLabelText[i] = new Array(6);
            for (let k = 0; k < 6; k++) {
                let rawVal = max_y_values[i] * (k+1) / 6;
                let val;
                switch(i) {
                    case 1:
                        val = Math.round(rawVal);
                        break;
                    case 0:
                        rawVal = Galaxy.sliderValueToDensity((k+1)/6);
                        val = rawVal.toPrecision(3);
                        break;
                    default: 
                        val = Number.parseFloat(rawVal).toExponential(1);
                }
                const t = new PIXI.Text(val, FONT_DATA_FOR_Y_AXIS_GRIDLINE_LABELS);
                t.anchor.set(1, 0.5);
                t.x = axisLeftX - 5;
                t.y = axisBottomY(i) - (k+1) * pad;
                g.addChild(t);
                this.yAxisLabelText[i][k] = t;
            }
        }

        /* Draw the Slider Tracks */
        const tracks = new PIXI.Container();
        for (let i = 0; i < N_SLIDES; i++) {
            const track = new PIXI.Graphics();
            track.lineStyle(3, 0xf7dcd0, 0.5);
            track.lineTo(0, axisHeight);
            track.x = axisLeftX + 2 * (i + 1) * GRAPH_GRID_SIZE;
            track.y = axisTopY(0);
            tracks.addChild(track);
        }
        g.addChild(tracks);


        /* Create Data Points */
        for (let graphNum = 0; graphNum < 3; graphNum ++) {
            const container = new PIXI.Container();
            for (let i = 0; i < N_SLIDES; i++) {
                let point;
                switch (graphNum) {
                case 0:
                    point = this.newSpecialInputDataPointGraph(i);
                    this.densityGraphPoints[i] = point;
                    break;
                case 1:
                    point = newRedDataPointGraphic();
                    this.velocityGraphPoints[i] = point;
                    break;
                default:
                    point = newRedDataPointGraphic();
                    this.massGraphPoints[i] = point;
                    break;
                }
                point.x = axisLeftX + 2 * (i + 1) * GRAPH_GRID_SIZE;
                point.y = axisBottomY(graphNum) - Math.random() * axisHeight;
                container.addChild(point);
            }
            g.addChild(container);
        }
        for (let k = 0; k < N_SLIDES; k++) {
            this.densityGraphPoints[k].y = getGraphAxisBottomY(0) - DEFAULT_DENSITY_DATA[k] * axisHeight;
        }

        g.endFill();
    }

    /**
     * Initializes the text that appears above each data point in the graphs.
     */
    initDataPointText() {
        let textArrays = [this.densityDataText, this.velocityDataText, this.massDataText];
        for (let i = 1; i < 3; i++) {
            for (let k = 0; k < 10; k++) {
                const t = new PIXI.Text("xxx", FONT_DATA_FOR_POINTS);
                t.anchor.set(0.5);
                textArrays[i][k] = t;
                this.objects.graphs.addChild(t);
            }
        }
    }


    // ------------------------------------------------------------
    // Update Methods for pixi objects
    // ------------------------------------------------------------

    updateGalaxy(delta) {
        for (let k = 0; k < 10; k++) {
            const speed = galaxy.getOrbitalVelocityNormalized(k);
            this.galaxyShellContainers[k].rotation -= 0.01 * speed * delta;
        }
    }

    updateGraphPoints() {
        for (let k = 0; k < 10; k++) {
            this.densityGraphData[k] = galaxy.getDensity(k);
            this.velocityGraphData[k] = galaxy.getOrbitalVelocity(k);
            this.massGraphData[k] = galaxy.getTotalMassEnclosed(k);
            this.velocityGraphPoints[k].y = getGraphAxisBottomY(1) - galaxy.getOrbitalVelocityNormalized(k) * GRAPH_AXIS_HEIGHT;
            this.massGraphPoints[k].y = getGraphAxisBottomY(2) - galaxy.getTotalMassEnclosedNormalized(k) * GRAPH_AXIS_HEIGHT;
        }
    }

    updateDataText() {
        let dataArrays = [this.densityGraphData, this.velocityGraphData, this.massGraphData];
        let pointArrays = [this.densityGraphPoints, this.velocityGraphPoints, this.massGraphPoints];
        let textArrays = [this.densityDataText, this.velocityDataText, this.massDataText];
        for (let i = 1; i < 3; i++) {
            for (let k = 0; k < 10; k++) {
                textArrays[i][k].position.set(pointArrays[i][k].x, pointArrays[i][k].y - 15);
                if (i == 1) {
                    textArrays[i][k].text = Math.round(dataArrays[i][k]);
                } else {
                    textArrays[i][k].text = Number.parseFloat(dataArrays[i][k]).toExponential(1);
                }
            }
        }
        /* Update y-axis gridline label text */
        let max_y_values = [MAX_DENSITY, MAX_VELOCITY, MAX_MASS_ENCLOSED];
        for (let i = 0; i < 3; i++) {
            for (let k = 0; k < 6; k++) {
                let rawVal = max_y_values[i] * (k+1) / 6;
                let val;
                switch(i) {
                    case 1:
                        val = Math.round(rawVal);
                        break;
                    case 0:
                        rawVal = Galaxy.sliderValueToDensity((k+1)/6);
                        val = rawVal.toPrecision(3);
                        break;
                    default: 
                        val = Number.parseFloat(rawVal).toExponential(1);
                }
                this.yAxisLabelText[i][k].text = val;
            }
        }
    }

    updateVelocityCurveOverlay() {
        let scaleY = GALAXY_DATA[this.props.galaxyChoice].MAX_V / MAX_VELOCITY;
        console.log("new scale factor:", scaleY);
        // this.velocityCurveOverlay.sprite.scale.set(1, scaleY);
        this.velocityCurveOverlay.sprite.height = GRAPH_AXIS_HEIGHT * scaleY;
        this.velocityCurveOverlay.sprite.y = getGraphAxisBottomY(1) - this.velocityCurveOverlay.sprite.height;
    }

    updateDensityRings() {
        for (let k = 0; k < 10; k++) {
            this.redGlowRings[k].alpha = this.props.sliderValues[k];
        }
    }

    // -----------------------------------------------------------------
    // Creation of New Slider Dots
    // -----------------------------------------------------------------

    /* generates a  data point for usage as a slider handle */
    newSpecialInputDataPointGraph(key) {
        const g = new PIXI.Graphics();
        const r = GRAPH_SLIDER_HANDLE_DATA_POINT_RADIUS;
        g.interactive = true;
        g.buttonMode = true;
        g
            .on('pointermove', this.onDataPointDragMove)
            .on('pointerdown', this.onDataPointDragStart)
            .on('pointerup', this.onDataPointDragEnd)
            .on('pointerupoutside', this.onDataPointDragEnd)
        g.beginFill(0xFF1122, 0.7);
        g.lineStyle(3, 0xFFFFFF, 0.4);
        g.drawCircle(0, 0, r);
        g.moveTo(r/2, 0);
        g.lineTo(-r/2, 0);
        g.endFill();
        return g;
}

    onDataPointDragStart(event) {
        event.data.originalEvent.preventDefault();
        this.data = event.data;
        this.alpha = 0.5;
        this.dragging = true;
    }

    onDataPointDragEnd() {
        this.alpha = 1;
        this.dragging = false;
        this.data = null;
    }

    onDataPointDragMove(event) {
        if (this.dragging) {
            const newPosition = this.data.getLocalPosition(this.parent);
            this.y = Math.max(Math.min(newPosition.y, MAX_SLIDER_Y), MIN_SLIDER_Y);
            let key = getSliderIndexFromPosition(this.x);
            let sliderValue = ((MAX_SLIDER_Y - this.y) / GRAPH_AXIS_HEIGHT);
            singleton.props.onSliderChange(key, sliderValue);
        }
    }

}



let dots = new Array(DOTS_TO_GENERATE);
let thetas = new Array(DOTS_TO_GENERATE);
let radiuses = new Array(DOTS_TO_GENERATE);

/* Generates a single galaxy sprite. Represents a "star" in the galaxy. */
function newDotGraphic() {
    const g = new PIXI.Graphics();
    // g.lineStyle(1, 0xFFFFFF, 1);
    g.beginFill(0xEEEEFF, 1);
    g.drawCircle(0, 0, 5);
    g.endFill();
    return g;
}

/* Generates a red data point for use on the control graph */
function newRedDataPointGraphic() {
    const g = new PIXI.Graphics();
    g.beginFill(0xFF1122, 0.7);
    g.drawCircle(0, 0, GRAPH_NORMAL_DATA_POINT_RADIUS);
    g.endFill();
    return g;
}

/* WARNING: This Function makes the assumption that sliders are evenly spaced
along the x-axis.  If that were to change, it would break this function. */
function getSliderIndexFromPosition(x) {
    let x0 = GRAPH_AXIS_LEFT_X + 2 * GRAPH_GRID_SIZE;
    let diff = 2 * GRAPH_GRID_SIZE;
    return Math.round((x - x0) / diff);
}

/* Converts Graph Units to Pixels (x-dimension) */
function xPixels(x) {
    return (x + MAX_GRAPH_SIZE) * ORBIT_VIEW_SIZE / (2 * MAX_GRAPH_SIZE);
}

/* Converts Graph Units to Pixels (y-dimension) */
function yPixels(y) {
    return -(y - MAX_GRAPH_SIZE) * ORBIT_VIEW_SIZE / (2 * MAX_GRAPH_SIZE);
}

function getShellFromDot(R) {
    return Math.floor(R / (1 /N_SLIDES))
}

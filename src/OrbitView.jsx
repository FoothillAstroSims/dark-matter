import React from 'react';
import * as PIXI from 'pixi.js';

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
const DOTS_TO_GENERATE = 300;

/* The size of the grid hash-marks in the Galaxy Viewport Area. */
const GALAXY_GRID_LINE_SIZE = 0.025;

/* The size of each grid square in the Graph Control Area. */
const GRAPH_GRID_SIZE = ORBIT_VIEW_SIZE / 30;

/* Number of Data Points to use on the graphs. (and Number of Sliders) */
const N_SLIDES = 10;

/* Radius of a normal data point on the velocity and total-mass graphs. */
const GRAPH_NORMAL_DATA_POINT_RADIUS = 10;

/* Radius of the data points on density graph, used as slider handles */
const GRAPH_SLIDER_HANDLE_DATA_POINT_RADIUS = 20;

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

function getGraphAxisTopY(n) {
    return ORBIT_VIEW_SIZE / 3 * n  +  2 * GRAPH_GRID_SIZE;
}

function getGraphAxisBottomY(n) {
    return ORBIT_VIEW_SIZE / 3 * (n + 1)  -  2 * GRAPH_GRID_SIZE;
}



let sliderValues = new Array(N_SLIDES);
for (let i = 0; i < N_SLIDES; i++) { sliderValues[i] = 0; }



/**
 * OrbitView is the main animation display area for the Dark Matter Simulator.
 * All of the fun galaxy movements happen here. Data from the controls are
 * accessed through props.
 */
export default class OrbitView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.objects = {
            background: new PIXI.Graphics(),
            galaxy: new PIXI.Graphics(),
            graphs: new PIXI.Graphics(),
        };
        this.densityGraphPoints = new Array(10);
        this.velocityGraphPoints = new Array(10);
        this.massGraphPoints = new Array(10);
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            antialias: true,
            width: ORBIT_VIEW_SIZE + GRAPH_AREA_WIDTH,
            height: ORBIT_VIEW_SIZE,
            resolution: Math.min(window.devicePixelRatio, 3) || 1,
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

                <pre style={{color: 'white'}}>
                    {JSON.stringify(this.state, null, '\t')}
                </pre>

            </React.Fragment>
        )
    }

    init() {
        this.initBackground();
        this.initGalaxy();
        this.initGraphs();
    }

    update(delta) {
        this.updateGalaxy(delta);
        this.updateGraphValues();
        for (let i = 0; i < N_SLIDES; i++) {
            sliderValues[i] = 1 - (this.densityGraphPoints[i].position.y - getGraphAxisTopY(0)) / GRAPH_AXIS_HEIGHT;
        }
        this.setState({
            sliderValues
        });
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
        for (let k = 0; k < DOTS_TO_GENERATE; k++) {
            const dot = newDotGraphic();
            let R = Math.random() * MAX_GRAPH_SIZE;
            let theta = Math.random() * 2 * Math.PI;
            radiuses[k] = R;
            thetas[k] = theta;
            dot.x = xPixels(R * Math.cos(theta));
            dot.y = yPixels(R * Math.sin(theta));
            this.objects.galaxy.addChild(dot)
            dots[k] = dot;
            // console.log(dot.x, dot.y);
        }
    }

    initGraphs() {
        const g = this.objects.graphs;

        let w = GRAPH_AREA_WIDTH;
        let h = ORBIT_VIEW_SIZE;
        g.x = ORBIT_VIEW_SIZE;

        g.lineStyle(3, 0xFFFFFF);

        /* Border around the Graphs Area */
        // g.moveTo(0,0);
        // g.lineTo(w,0);
        // g.lineTo(w,h);
        // g.lineTo(0,h);
        // g.lineTo(0,0);

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
            'Dark Matter Density (kg/m³)',
            'Orbital Velocity (km/s)',
            'Total Mass Enclosed (Msun)'
        ];

        for (let i = 0; i < titleTexts.length; i++) {
            const t = new PIXI.Text(titleTexts[i], FONT_DATA_FOR_AXES);
            t.anchor.set(0, 0.5)
            // t.resolution = 2;
            t.x = pad;
            t.y = axisTopY(i) - pad;
            g.addChild(t);
        }

        for (let i = 0; i < 3; i++) {
            const t = new PIXI.Text('Radius (kly)', FONT_DATA_FOR_AXES);
            t.anchor.set(0.5);
            // t.resolution = 2;
            t.x = axisLeftX + axisWidth/2;
            t.y = axisBottomY(i) + pad;
            g.addChild(t);
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
                    point = newSpecialInputDataPointGraph();
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

        g.endFill();
    }




    // ------------------------------------------------------------
    // Update Methods for pixi objects
    // ------------------------------------------------------------

    updateGalaxy(delta) {
        for (let k = 0; k< DOTS_TO_GENERATE; k++) {
            let R = radiuses[k];
            let shell = getShellFromDot(R);
            // let adjustedSpeed = speed[shell] / 1.58e6;
            let adjustedSpeed = 0.2 * R;
            thetas[k] += 0.05 * adjustedSpeed * delta;
            let theta = thetas[k];
            dots[k].x = xPixels(R * Math.cos(theta));
            dots[k].y = yPixels(R * Math.sin(theta));
        }
    }

    updateGraphValues() {
        
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

/* generates a  data point for usage as a slider handle */
function newSpecialInputDataPointGraph() {
    const g = new PIXI.Graphics();
    const r = GRAPH_SLIDER_HANDLE_DATA_POINT_RADIUS;
    g.interactive = true;
    g.buttonMode = true;
    g
        .on('pointermove', onDataPointDragMove)
        .on('pointerdown', onDataPointDragStart)
        .on('pointerup', onDataPointDragEnd)
        .on('pointerupoutside', onDataPointDragEnd)
    g.lineStyle(3, 0xFFFFFF, 0.4);
    g.beginFill(0xFF1122, 0.7);
    g.drawCircle(0, 0, r);
    // g.moveTo(0, r/2);
    // g.lineTo(0, -r/2);
    g.moveTo(r/2, 0);
    g.lineTo(-r/2, 0);
    g.endFill();
    return g;
}

function onDataPointDragStart(event) {
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
}

function onDataPointDragEnd() {
    this.alpha = 1;
    this.dragging = false;
    this.data = null;
}

function onDataPointDragMove(event) {
    if (this.dragging) {
        const newPosition = this.data.getLocalPosition(this.parent);
        this.y = Math.max(Math.min(newPosition.y, MAX_SLIDER_Y), MIN_SLIDER_Y);
    }
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

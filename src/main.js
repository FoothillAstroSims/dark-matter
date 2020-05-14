import * as PIXI from 'pixi.js'



/* SLIDER MATH STUFF */


const q = document.querySelector.bind(document);
const N_SLIDES = 10;

const light_year = 9.46E15;
const Msun = 1.989E30;
const G = 6.67408E-11;
const seconds_in_year = 3.154e7;
const DM_bin_width = 10.0;

let density = new Array(16);
density[0] = 0;

let volume = new Array(15);
let shellMass = new Array(15);
let totalMass = new Array(15);
let speed = new Array(15);

function loop() {
    let output = ""

    /* Collect Slider Input */
    for (let i=1; i<11; i++) {
        let s = q(slider(i));
        let val = s.value;
        let converted = (val / 100).toFixed(2);
        // output += `slider${padnum(i)}:  ${converted}` + "\n";
    }

    /* Calculate Density */
    // output += "\n"
    for (let k=0; k<10; k++) {
        density[k] = q(slider(k+1)).value * 1e-20 / 100
        output += `density[${padnum(k)}]:  ${density[k].toExponential(2)}` + '  kg/m3 \n';
    }
    q("#output1").innerText = output;
    output = "";

    /* Print Radii */
    // output += "\n"
    for (let k=0; k<11; k++) {
        let paddedRadius = `${radius(k)}`.padStart(3, ' ');
        // output += `radius[${padnum(k)}]:  ${paddedRadius}` + '  kly \n';
    }

    /* Calculate Volumes */
    // output += "\n"
    for (let i = 0; i<10; i++) {
        volume[i] = 4/3 * Math.PI * (Math.pow(radius(i+1), 3) - Math.pow(radius(i), 3)) * Math.pow(1e3 * light_year, 3);
        // output += `volume[${padnum(i)}]:  ${volume[i].toExponential(2)}` + '\n';
    }

    /* Calculate Shell Mass */
    // output += "\n"
    for (let k=0; k<10; k++) {
        shellMass[k] = volume[k] * density[k];
        // output += `shellMass[${padnum(k)}]:  ${(shellMass[k] / Msun).toExponential(2)}` + '  Msun \n';
    }

    /* Calculate Total Mass */
    for (let k=0; k<10; k++) {
        if (k === 0) {
            totalMass[0] = shellMass[0];
        } else {
            totalMass[k] = totalMass[k-1] + shellMass[k];
        }
        let adjusted = totalMass[k] / Msun;
        q(massProg(k)).value = adjusted;
        output += `totalMass[${padnum(k)}]:  ${(adjusted).toExponential(2)}` + '  Msun \n'
    }
    q("#output2").innerText = output;
    output = "";

    /* Calculate Total Speed */
    for (let k=0; k<10; k++) {
        speed[k] = Math.sqrt(G * totalMass[k] / (radius(k+1) * 1e3 * light_year))
        let adjustedSpeed = speed[k] / 1e3;
        output += `speed[${padnum(k)}]:  ${(adjustedSpeed).toExponential(2)}` + '  km/s \n'
        q(progress(k)).value = adjustedSpeed;
    }
    q("#output3").innerText = output;

    window.requestAnimationFrame(loop);
}


function slider(n) {
    return `#slide${n}`
}

function radius(k) {
    return k * DM_bin_width;
}

function padnum(n) {
    return `${n}`.padStart(2, ' ');
}

function progress(n) {
    return `#progress${n}`;
}

function massProg(n) {
    return `#mass${n}`;
}

function main() {

    const example = [0.8, 0.7, 0.5, 0.2, 0.1, 0.08, 0.06, 0.04, 0.02, 0.01];

    /* Initialize Sliders to Example Values */
    for (let k=0; k<10; k++) {
        let s = q(slider(k+1));
        s.value = example[k] * 100;
    }

    /* Start Looop */
    window.requestAnimationFrame(loop);
}
document.addEventListener('DOMContentLoaded', main);




// ============================================================

/* PIXI STUFF */

const maxR = 5;
const MAX_GRAPH_SIDE = 1;
const SIDE = 800;
const DOTS_TO_GENERATE = 300;

let dots = new Array(DOTS_TO_GENERATE);
let thetas = new Array(DOTS_TO_GENERATE);
let radiuses = new Array(DOTS_TO_GENERATE);


const app = new PIXI.Application({
    width: SIDE,
    height: SIDE,
});
document.body.appendChild(app.view);

for (let k = 0; k < DOTS_TO_GENERATE; k++) {
    const dot = newDotGraphic();
    let R = Math.random()  * MAX_GRAPH_SIDE;
    let theta = Math.random() * 2 * Math.PI;
    radiuses[k] = R;
    thetas[k] = theta;
    dot.x = xUnitsToPixels(R * Math.cos(theta));
    dot.y = yUnitsToPixels(R * Math.sin(theta));
    app.stage.addChild(dot)
    dots[k] = dot;
    console.log(dot.x, dot.y);
}




function newDotGraphic() {
    const g = new PIXI.Graphics();
    // g.lineStyle(1, 0xFFFFFF, 1);
    g.beginFill(0xEEEEFF, 1);
    g.drawCircle(0, 0, 5);
    g.endFill();
    return g;
}


function xUnitsToPixels(x) {
    return (x + MAX_GRAPH_SIDE) * SIDE / (2 * MAX_GRAPH_SIDE);
}

function yUnitsToPixels(y) {
    return -(y - MAX_GRAPH_SIDE) * SIDE / (2 * MAX_GRAPH_SIDE);
}

function getShellFromDot(R) {
    return Math.floor(R / (1 /N_SLIDES))
}

app.ticker.add((delta) => {
    for (let k = 0; k< DOTS_TO_GENERATE; k++) {
        let R = radiuses[k];
        let shell = getShellFromDot(R);
        let adjustedSpeed = speed[shell] / 1.58e6;
        thetas[k] += 0.05 * adjustedSpeed * delta;
        let theta = thetas[k];
        dots[k].x = xUnitsToPixels(R * Math.cos(theta));
        dots[k].y = yUnitsToPixels(R * Math.sin(theta));
    }
});

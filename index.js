import { createSVGWindow } from 'svgdom';
import { SVG as SVGMaker, registerWindow } from '@svgdotjs/svg.js';
import drawSVG from './drawSVG.js';
import parseShows from './parse.js';

const window = createSVGWindow();
const document = window.document;
registerWindow(window, document);

const svg = SVGMaker(document.documentElement);
const shows = parseShows("./shows.csv")
    .then((shows) => {
        drawSVG(svg, shows);
        console.log(svg.svg());
    }).catch((error) => {
        console.error("Error:", error);
    });
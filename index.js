import PDFRenderer from './PDFRenderer.js';
import parseShows from './parse.js';
import {} from './Alegreya-Regular-normal.js';
import {} from './Alegreya-italic.js';

const outfile = process.argv[2];
if (!outfile) {
    console.log("Usage: <cmd> <outfile>");
    process.exit(1);
}

const shows = parseShows(new URL("shows.csv", import.meta.url))
    .then((shows) => {
        const pdf = new PDFRenderer(shows).drawPDF(shows);
        pdf.save(outfile);
    }).catch((error) => {
        console.error("Error:", error);
    });


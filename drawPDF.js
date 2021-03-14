import { jsPDF } from "jspdf";
import fs from "fs";

const titleToBoxYSpace = 3;
const rowYSpace = 2;
const intershowSpace = 6;
const boxHeight = 7;
const boxWidth = 7; 
const segmentHSpace = 10;
const lineWidth = 0.2;
const thickBorderWidth = 0.7;

const fonts = {
    title: {
        name: 'Alegreya-Medium',
        size: 16
    },
    annotation: {
        name: 'Alegreya-Medium',
        size: 12
    }
};
const annotationFont = ['Alegreya-Medium', 12];

const leftEdge = 20;
const topEdge = 20;

export default function drawPDF(shows) {
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'letter'
    });

    pdf.saveGraphicsState()
        .setLineWidth(lineWidth)
        .setFontSize(10);

    const sorted = sortByKey([...shows], 'title');
    let y = topEdge;
    for (const show of sorted) {
        y = drawShow(pdf, show, y) + intershowSpace;
    }

    pdf.restoreGraphicsState();
    return pdf;
}

function sortByKey(array, key) {
    return [...array].sort((o1, o2) => {
        const k1 = o1[key], k2 = o2[key];
        return k1 < k2 ? -1 : k2 > k1 ? 1 : 0;
    });
}

function drawShow(pdf, show, y) {
    const lineHeight = convertPointsToUnit(pdf.getFontSize(), 'mm');
    let yPrime = y;

    pdf.saveGraphicsState()
        .setFont(fonts.title.name)
        .setFontSize(fonts.title.size);
    const text = `${show.title} (${show.length}, ${show.location})`;
    pdf.text(text, leftEdge, yPrime + lineHeight)
        .restoreGraphicsState();
    
    yPrime += lineHeight + titleToBoxYSpace;
    for (const seasonSegments of show.seasons) {
        let xPrime = leftEdge;
        for (let [idx, segmentLength] of seasonSegments.entries()) {
            const segX = xPrime;
            for (let ep = 0; ep < segmentLength; ep++) {
                pdf.rect(xPrime, yPrime, boxWidth, boxHeight);
                xPrime += boxWidth;
            }
            
            pdf.saveGraphicsState()
                .setLineWidth(thickBorderWidth)
                .rect(segX, yPrime, boxWidth * segmentLength, boxHeight)
                .restoreGraphicsState();

            if (idx < seasonSegments.length - 1) {
                xPrime = appendPlus(pdf, xPrime, yPrime);
            }
        }
        yPrime += boxHeight + rowYSpace;
    }
    return yPrime;
}

function appendPlus(pdf, xSpacerStart, yBoxTop) {
    pdf.saveGraphicsState()
        .setLineWidth(thickBorderWidth);
    
    const frac = 0.5;
    const lineLength = frac * Math.min(boxHeight, segmentHSpace);

    const xStart = xSpacerStart + (segmentHSpace - lineLength) / 2.0;
    const y = yBoxTop + (boxHeight / 2.0);
    pdf.line(xStart, y, xStart + lineLength, y);
    
    const yStart = yBoxTop + (boxHeight - lineLength) / 2.0;
    const x = xSpacerStart + (segmentHSpace / 2.0);
    pdf.line(x, yStart, x, yStart + lineLength);

    pdf.restoreGraphicsState();
    return xSpacerStart + segmentHSpace;
}

// https://gist.github.com/AnalyzePlatypus/55d806caa739ba6c2b27ede752fa3c9c
function convertPointsToUnit(points, unit) {
    // Unit table from https://github.com/MrRio/jsPDF/blob/ddbfc0f0250ca908f8061a72fa057116b7613e78/jspdf.js#L791
    var multiplier;
    switch(unit) {
      case 'pt':  multiplier = 1;          break;
      case 'mm':  multiplier = 25.4 / 72;  break;
      case 'cm':  multiplier = 2.54 / 72;  break;
      case 'in':  multiplier = 72;         break;
      case 'px':  multiplier = 72 / 96;    break;
      case 'pc':  multiplier = 12;         break;
      case 'em':  multiplier = 12;         break;
      case 'ex':  multiplier = 6;
      default:
        throw ('Invalid unit: ' + unit);
    }
    return points * multiplier;
}

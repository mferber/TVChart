const titleToBoxYSpace = 10;
const rowYSpace = 40;
const boxHeight = 25;
const boxWidth = 25;
const segmentHSpace = 30;
const thickBorderWidth = 3;

const leftEdge = thickBorderWidth;
const topEdge = 0;

export default function drawSVG(svg, shows) {
    const sorted = sortByKey([...shows], 'title');
    let y = topEdge;
    for (const show of sorted) {
        const bbox = drawShow(svg, show, y);
        y += bbox.height + rowYSpace;
    }

    svg.size(1000, 3000);
}

function sortByKey(array, key) {
    return [...array].sort((o1, o2) => {
        const k1 = o1[key], k2 = o2[key];
        return k1 < k2 ? -1 : k2 > k1 ? 1 : 0;
    });
}

function drawShow(svg, show, y) {
    let yPrime = y;

    const text = svg.plain(`${show.title} (${show.length}, ${show.location})`).font({family: "Helvetica", size: 24}).move(leftEdge, yPrime);
    
    yPrime = text.bbox().y2 + titleToBoxYSpace;
    const allBoxes = svg.group();
    for (const seasonSegments of show.seasons) {
        let xPrime = leftEdge;
        for (let [idx, segmentLength] of seasonSegments.entries()) {
            const segmentBoxes = svg.group();
            for (let ep = 0; ep < segmentLength; ep++) {
                segmentBoxes.rect(boxWidth, boxHeight).stroke("#000").fill({opacity: 0}).move(xPrime, yPrime);
                xPrime += boxWidth;
            }
            const segmentBounds = segmentBoxes.bbox();
            allBoxes.rect(segmentBounds.width, segmentBounds.height)
                .move(segmentBounds.x, segmentBounds.y)
                .attr('stroke-width', thickBorderWidth)
                .stroke("#000")
                .fill({opacity: 0});

            if (idx < seasonSegments.length - 1) {
                appendPlus(svg, xPrime, yPrime);
                xPrime += segmentHSpace;
            }
            



        }
        yPrime += boxHeight + 5;
    }

    return text.bbox().merge(allBoxes.bbox());
}

function appendPlus(svg, xSpacerStart, yBoxTop) {
    const frac = 0.5;
    const lineLength = frac * Math.min(boxHeight, segmentHSpace);

    const xStart = xSpacerStart + (segmentHSpace - lineLength) / 2.0;
    const y = yBoxTop + (boxHeight / 2.0);
    svg.line(xStart, y, xStart + lineLength, y).attr({'stroke-width': thickBorderWidth}).stroke("#000");
    
    const yStart = yBoxTop + (boxHeight - lineLength) / 2.0;
    const x = xSpacerStart + (segmentHSpace / 2.0);
    svg.line(x, yStart, x, yStart + lineLength).attr({'stroke-width': thickBorderWidth}).stroke("#000");
}
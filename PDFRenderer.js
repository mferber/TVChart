import { jsPDF } from "jspdf";

const titleToBoxYSpace = 3;
const horizMargin = 20;
const vertMargin = 20;
const rowYSpace = 2;
const intershowSpace = 6;
const showTitleInfoSpacing = 3;
const boxHeight = 7;
const boxWidth = 7;
const segmentHSpace = 8;
const lineWidth = 0.2;
const thickBorderWidth = 0.7;

const fonts = {
    title: {
        name: 'Alegreya-Regular',
        size: 16,
        style: 'normal'
    },
    annotation: {
        name: 'Alegreya',
        size: 12,
        style: 'italic'
    }
};

export default class PDFRenderer {
    #pdf;
    #y;

    drawPDF(shows) {
        this._initializePDF();
        this._initializePage();

        this.#pdf.setLineWidth(lineWidth)
            .setFontSize(10);

        const sorted = this._sortByKey([...shows], 'title');
        for (const show of sorted) {
            this._drawShow(show);
            this.#y += intershowSpace;
        }
        return this.#pdf;
    }

    _initializePDF() {
        this.#pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'letter'
        });
    }
    
    _initializePage() {
        this.#y = horizMargin;
    }

    _sortByKey(array, key) {
        return [...array].sort((o1, o2) => {
            const k1 = o1[key], k2 = o2[key];
            return k1 < k2 ? -1 : k2 > k1 ? 1 : 0;
        });
    }

    _drawShow(show) {
        this._drawShowInfo(show);
        this.#y += titleToBoxYSpace;
        for (const seasonSegments of show.seasons) {
            let x = horizMargin;
            for (let [idx, segmentLength] of seasonSegments.entries()) {
                const segX = x;
                for (let ep = 0; ep < segmentLength; ep++) {
                    this.#pdf.rect(x, this.#y, boxWidth, boxHeight);
                    x += boxWidth;
                }

                this.#pdf.saveGraphicsState()
                    .setLineWidth(thickBorderWidth)
                    .rect(segX, this.#y, boxWidth * segmentLength, boxHeight)
                    .restoreGraphicsState();

                if (idx < seasonSegments.length - 1) {
                    x = this._appendPlus(x);
                }
            }
            this.#y += boxHeight + rowYSpace;
        }
    }

    _drawShowInfo(show) {
        this.#pdf.saveGraphicsState()
            .setFont(fonts.title.name, fonts.title.style)
            .setFontSize(fonts.title.size);

        const lineHeight = this._convertPointsToUnit(this.#pdf.getFontSize(), 'mm');
        const descr = `(${show.length}, ${show.location})`;

        this.#pdf.text(show.title, horizMargin, this.#y + lineHeight);

        const offset = this.#pdf.getTextWidth(show.title);

        this.#pdf.setFont(fonts.annotation.name, fonts.annotation.style)
            .setFontSize(fonts.annotation.size);

        this.#pdf.text(
            descr, 
            horizMargin + offset + showTitleInfoSpacing, 
            this.#y + lineHeight
        ).restoreGraphicsState();
        this.#y += lineHeight;
    }

    _appendPlus(xSpacerStart) {
        this.#pdf.saveGraphicsState()
            .setLineWidth(thickBorderWidth);

        const frac = 0.5;
        const lineLength = frac * Math.min(boxHeight, segmentHSpace);

        const xStart = xSpacerStart + (segmentHSpace - lineLength) / 2.0;
        const lineY = this.#y + (boxHeight / 2.0);

        this.#pdf.line(xStart, lineY, xStart + lineLength, lineY);

        const yStart = this.#y + (boxHeight - lineLength) / 2.0;
        const x = xSpacerStart + (segmentHSpace / 2.0);
        this.#pdf.line(x, yStart, x, yStart + lineLength);

        this.#pdf.restoreGraphicsState();
        return xSpacerStart + segmentHSpace;
    }

    // https://gist.github.com/AnalyzePlatypus/55d806caa739ba6c2b27ede752fa3c9c
    _convertPointsToUnit(points, unit) {
        // Unit table from https://github.com/MrRio/jsPDF/blob/ddbfc0f0250ca908f8061a72fa057116b7613e78/jspdf.js#L791
        var multiplier;
        switch (unit) {
            case 'pt': multiplier = 1; break;
            case 'mm': multiplier = 25.4 / 72; break;
            case 'cm': multiplier = 2.54 / 72; break;
            case 'in': multiplier = 72; break;
            case 'px': multiplier = 72 / 96; break;
            case 'pc': multiplier = 12; break;
            case 'em': multiplier = 12; break;
            case 'ex': multiplier = 6;
            default:
                throw ('Invalid unit: ' + unit);
        }
        return points * multiplier;
    }
}

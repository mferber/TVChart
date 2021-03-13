import fs from 'fs';
export default async function parseShows(path) {
    let shows = [];
    const text = await fs.promises.readFile(path, 'utf8');
    const lines = text.split('\n').filter(ln => ln.trim().length > 0);

    lines:
    for (const line of lines) {
        const fields = line.split(',').map(f => f.trim());
        if (fields.length < 4) {
            notifyInvalid(line);
            continue lines;
        }
        let seasons = [];
        for (const season of fields.slice(3)) {
            const segments = season.split('+').map(s => parseInt(s));
            if (segments.some(s => isNaN(s))) {
                notifyInvalid(line);
                continue lines;
            }
            seasons.push(segments);
        };
        shows.push({
            title: fields[0],
            location: fields[1],
            length: fields[2],
            seasons: seasons
        });
    }

    return shows;
}

function notifyInvalid(line) {
    console.error(`Invalid input line: "${line}"`);
}
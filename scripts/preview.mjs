import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('www');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
    '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg' };
createServer(async (request, response) => {
    try {
        const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const file = resolve(root, '.' + (name === '/' ? '/index.html' : name));
        if (!file.startsWith(root + sep)) throw new Error('Invalid path');
        const content = await readFile(file);
        response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream',
            'Cache-Control': 'no-store' });
        response.end(content);
    } catch {
        response.writeHead(404);
        response.end('Not found');
    }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('FightWise preview ready'));

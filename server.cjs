const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const files = {
  '/': ['main.html', 'text/html; charset=utf-8'],
  '/main.html': ['main.html', 'text/html; charset=utf-8'],
  '/main.css': ['main.css', 'text/css; charset=utf-8'],
  '/main.js': ['main.js', 'text/javascript; charset=utf-8'],
  '/letter.js': ['letter.js', 'text/javascript; charset=utf-8'],
  '/photo-list.js': ['photo-list.js', 'text/javascript; charset=utf-8'],
  '/assets/photos/photos.json': ['assets/photos/photos.json', 'application/json; charset=utf-8'],
  '/local-player.js': ['local-player.js', 'text/javascript; charset=utf-8']
};
http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1:5500').pathname;
  if (pathname === '/assets/pinterest/photos.json' || pathname === '/assets/photos/photos.json') {
    const folder = pathname.includes('/pinterest/') ? 'pinterest' : 'photos';
    fs.readdir(path.join(__dirname, 'assets', folder), { withFileTypes: true }, (error, entries) => {
      if (error) { response.writeHead(500); response.end(); return; }
      const names = entries.filter(entry => entry.isFile() && /\.(jpe?g|png|webp|avif|gif)$/i.test(entry.name)).map(entry => entry.name).sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }));
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify(names));
    });
    return;
  }
  const asset = /^\/assets\/(audio\/[a-z0-9-]+\.mp3|(?:covers|decor|floating|content-decor)\/[a-z0-9-]+\.jpg)$/.exec(pathname);
  const stickerAsset = /^\/assets\/floating\/sticker-[1-4]\.png$/.test(pathname);
  let photoPath;
  try { photoPath = decodeURIComponent(pathname); } catch { response.writeHead(400); response.end(); return; }
  const photo = /^\/assets\/(?:photos|pinterest)\/([^/\\]+\.(jpe?g|png|webp|avif|gif))$/i.exec(photoPath);
  const imageTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif' };
  const file = files[pathname] || (stickerAsset && [pathname.slice(1), 'image/png']) || (asset && [pathname.slice(1), pathname.endsWith('.mp3') ? 'audio/mpeg' : 'image/jpeg']) || (photo && [photoPath.slice(1), imageTypes[photo[2].toLowerCase()]]);
  if (!file) { response.writeHead(404); response.end(); return; }
  fs.readFile(path.join(__dirname, file[0]), (error, data) => {
    if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500); response.end(); return; }
    const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range || '');
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
      if (start > end || start >= data.length) {
        response.writeHead(416, { 'Content-Range': `bytes */${data.length}` }); response.end(); return;
      }
      response.writeHead(206, { 'Content-Type': file[1], 'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes' });
      response.end(data.subarray(start, end + 1)); return;
    }
    response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store', 'Content-Length': data.length, 'Accept-Ranges': 'bytes' });
    response.end(data);
  });
}).listen(5500, '127.0.0.1', () => console.log('http://127.0.0.1:5500/main.html'));

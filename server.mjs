import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

// In-memory cache for ultra-fast static file serving
const memoryCache = new Map();

function getCachedFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const cached = memoryCache.get(filePath);
    if (cached && cached.mtimeMs === stats.mtimeMs) {
      return cached;
    }
    const rawContent = fs.readFileSync(filePath);
    const isCompressible = /\.(html|js|mjs|css|json|svg)$/i.test(filePath);
    const gzippedContent = isCompressible ? zlib.gzipSync(rawContent) : null;
    
    const entry = {
      mtimeMs: stats.mtimeMs,
      raw: rawContent,
      gzip: gzippedContent
    };
    memoryCache.set(filePath, entry);
    return entry;
  } catch {
    return null;
  }
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const fileData = getCachedFile(filePath);
  if (!fileData) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const acceptEncoding = req.headers['accept-encoding'] || '';
  const canGzip = fileData.gzip && acceptEncoding.includes('gzip');

  const headers = {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  };

  if (canGzip) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    res.end(fileData.gzip);
  } else {
    res.writeHead(200, headers);
    res.end(fileData.raw);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ LogicBaby High-Speed Server running!`);
  console.log(`💻 PC / Local:    http://localhost:${PORT}`);
  console.log(`📱 Phone (Wi-Fi): http://192.168.1.34:${PORT}`);
});

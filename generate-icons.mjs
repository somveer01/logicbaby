import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, drawPixel) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function drawAppIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const cornerRadius = w * 0.22;
  const innerW = w * 0.44;
  const innerH = h * 0.44;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  const outsideX = Math.max(0, absX - innerW);
  const outsideY = Math.max(0, absY - innerH);
  const cornerDist = Math.sqrt(outsideX * outsideX + outsideY * outsideY);

  if (cornerDist > cornerRadius) {
    return [0, 0, 0, 0];
  }

  const gradT = (x + y) / (w + h);
  let r = Math.round(108 * (1 - gradT) + 79 * gradT);
  let g = Math.round(63 * (1 - gradT) + 70 * gradT);
  let b = Math.round(181 * (1 - gradT) + 229 * gradT);

  const starRadius = w * 0.24;
  const angle = Math.atan2(dy, dx);
  const starDist = starRadius * (0.65 + 0.35 * Math.cos(5 * angle));
  if (dist < starDist) {
    r = 251; g = 191; b = 36;
  } else if (dist < starDist + w * 0.04) {
    r = 255; g = 255; b = 255;
  }

  return [r, g, b, 255];
}

const iconsDir = path.join(process.cwd(), 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const buf192 = createPng(192, 192, drawAppIcon);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), buf192);
console.log('✅ Generated icons/icon-192.png');

const buf512 = createPng(512, 512, drawAppIcon);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), buf512);
console.log('✅ Generated icons/icon-512.png');

const bufMaskable = createPng(512, 512, (x, y, w, h) => {
  const gradT = (x + y) / (w + h);
  let r = Math.round(108 * (1 - gradT) + 79 * gradT);
  let g = Math.round(63 * (1 - gradT) + 70 * gradT);
  let b = Math.round(181 * (1 - gradT) + 229 * gradT);

  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const starRadius = w * 0.24;
  const angle = Math.atan2(y - cy, x - cx);
  const starDist = starRadius * (0.65 + 0.35 * Math.cos(5 * angle));
  if (dist < starDist) {
    r = 251; g = 191; b = 36;
  } else if (dist < starDist + w * 0.04) {
    r = 255; g = 255; b = 255;
  }

  return [r, g, b, 255];
});
fs.writeFileSync(path.join(iconsDir, 'maskable-512.png'), bufMaskable);
console.log('✅ Generated icons/maskable-512.png');

// Screenshot 1 (Wide: 1280x720)
const bufShot1 = createPng(1280, 720, (x, y, w, h) => {
  const gradT = (x + y) / (w + h);
  let r = Math.round(245 * (1 - gradT) + 237 * gradT);
  let g = Math.round(243 * (1 - gradT) + 233 * gradT);
  let b = Math.round(255 * (1 - gradT) + 254 * gradT);

  // Center mock card
  if (x > 200 && x < w - 200 && y > 120 && y < h - 120) {
    r = 255; g = 255; b = 255;
  }
  return [r, g, b, 255];
});
fs.writeFileSync(path.join(iconsDir, 'screenshot-1.png'), bufShot1);
console.log('✅ Generated icons/screenshot-1.png');

// Screenshot 2 (Mobile portrait: 720x1280)
const bufShot2 = createPng(720, 1280, (x, y, w, h) => {
  const gradT = (x + y) / (w + h);
  let r = Math.round(245 * (1 - gradT) + 237 * gradT);
  let g = Math.round(243 * (1 - gradT) + 233 * gradT);
  let b = Math.round(255 * (1 - gradT) + 254 * gradT);

  if (x > 60 && x < w - 60 && y > 100 && y < h - 100) {
    r = 255; g = 255; b = 255;
  }
  return [r, g, b, 255];
});
fs.writeFileSync(path.join(iconsDir, 'screenshot-2.png'), bufShot2);
console.log('✅ Generated icons/screenshot-2.png');

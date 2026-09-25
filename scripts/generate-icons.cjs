const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG generator in pure Node.js (no external dependencies)
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with row filter 0
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2;
  const safeRadius = isMaskable ? radius * 0.75 : radius * 0.88;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: dark slate navy #0f172a or red gradient
      let r = 15, g = 23, b = 42, a = 255; // #0f172a

      // Inner rounded badge / shield
      if (dist <= safeRadius) {
        // Red fire badge: #dc2626
        const normY = (y - (cy - safeRadius)) / (safeRadius * 2);
        r = Math.floor(220 + normY * 20); // 220-240
        g = Math.floor(38 - normY * 15);   // 38-23
        b = Math.floor(38 - normY * 15);   // 38-23
        a = 255;

        // Draw extinguisher cylinder silhouette:
        // Cylinder body: cx - w*0.12 to cx + w*0.12, cy - h*0.15 to cy + h*0.25
        const bodyLeft = cx - width * 0.13;
        const bodyRight = cx + width * 0.13;
        const bodyTop = cy - height * 0.10;
        const bodyBottom = cy + height * 0.28;

        // Dome top
        const domeDy = y - bodyTop;
        const domeDx = dx;
        const inDome = (domeDy < 0 && domeDy > -height * 0.08 && (domeDx * domeDx) / Math.pow(width * 0.13, 2) + (domeDy * domeDy) / Math.pow(height * 0.08, 2) <= 1);

        // Cylinder body
        const inBody = (x >= bodyLeft && x <= bodyRight && y >= bodyTop && y <= bodyBottom);

        // Valve / handle / nozzle top
        const inValve = (Math.abs(dx) <= width * 0.04 && y >= cy - height * 0.26 && y < bodyTop - height * 0.04);
        const inLever = (dx >= -width * 0.10 && dx <= width * 0.10 && y >= cy - height * 0.24 && y <= cy - height * 0.20);
        const inHose = (dx >= width * 0.08 && dx <= width * 0.18 && y >= cy - height * 0.20 && y <= cy + height * 0.18);

        // Gold flame symbol in center of cylinder
        const flameDist = Math.sqrt(dx * dx + (dy - height * 0.08) * (dy - height * 0.08));
        const inFlame = (flameDist <= width * 0.08);

        if (inBody || inDome) {
          // Glossy bright red / crimson cylinder
          r = 239; g = 68; b = 68; // #ef4444
          if (x < cx - width * 0.04) {
            // highlight
            r = 252; g = 165; b = 165;
          }
          if (inFlame) {
            // Gold flame / badge in center
            r = 251; g = 191; b = 36; // #fbbf24
          }
        } else if (inValve || inLever || inHose) {
          // Dark charcoal brass/metal
          r = 241; g = 245; b = 249; // shiny chrome/metal
        }
      } else if (!isMaskable) {
        // Outside circle for non-maskable: smooth anti-alias transparent or dark circle
        if (dist > radius) {
          a = 0; // transparent corners
        }
      }

      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate required sizes
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));

console.log('All PWA icon assets generated successfully in /public!');

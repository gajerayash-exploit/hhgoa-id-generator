// Canvas-based image filters for the BoardInGoa card generator
// All filters operate on ImageData (pixel arrays) for full Canvas export fidelity.
// They are framework-agnostic pure functions: (ImageData) => ImageData

export type SkinFilter = 'raw' | 'sunset' | 'glitch' | 'jungle' | 'cyber' | '8bit';

// ─── Utility ────────────────────────────────────────────────────────────────

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

// ─── 1. RAW — No-op passthrough ─────────────────────────────────────────────

export function filterRaw(data: ImageData): ImageData {
  return data;
}

// ─── 2. SUNSET — Warm orange/amber grade ────────────────────────────────────
// Boosts red, pulls down blue, adds a warm mid-tone lift.

export function filterSunset(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data);
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = clamp(d[i] * 1.25 + 20);    // R boost
    d[i + 1] = clamp(d[i + 1] * 1.05);     // G slight
    d[i + 2] = clamp(d[i + 2] * 0.60);     // B crush
  }
  return new ImageData(d, data.width, data.height);
}

// ─── 3. GLITCH — RGB channel shift (chromatic aberration) ───────────────────
// Shifts the R channel right, G center, B left to create colour fringing.

export function filterGlitch(data: ImageData): ImageData {
  const src = data.data;
  const w = data.width;
  const h = data.height;
  const out = new Uint8ClampedArray(src.length);
  const shift = Math.floor(w * 0.025); // ~2.5% shift

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;

      // Red — shifted right
      const rx = Math.min(w - 1, x + shift);
      const ri = (y * w + rx) * 4;
      out[i]     = src[ri];

      // Green — center (with scanline glitch every ~30px)
      const glitchRow = y % 30 === 0;
      const gx = glitchRow ? Math.min(w - 1, x + shift * 2) : x;
      const gi = (y * w + gx) * 4;
      out[i + 1] = src[gi + 1];

      // Blue — shifted left
      const bx = Math.max(0, x - shift);
      const bi = (y * w + bx) * 4;
      out[i + 2] = src[bi + 2];

      out[i + 3] = src[i + 3];
    }
  }
  return new ImageData(out, w, h);
}

// ─── 4. JUNGLE DUOTONE — Map luminance → #1E4D2B (dark) to #D9A441 (light) ──
// Converts the image to grayscale then maps the tone to two brand colours.

const JUNGLE_DARK  = [0x1e, 0x4d, 0x2b];  // #1E4D2B
const JUNGLE_LIGHT = [0xd9, 0xa4, 0x41];  // #D9A441

export function filterJungle(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data);
  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
    d[i]     = clamp(JUNGLE_DARK[0] + (JUNGLE_LIGHT[0] - JUNGLE_DARK[0]) * lum);
    d[i + 1] = clamp(JUNGLE_DARK[1] + (JUNGLE_LIGHT[1] - JUNGLE_DARK[1]) * lum);
    d[i + 2] = clamp(JUNGLE_DARK[2] + (JUNGLE_LIGHT[2] - JUNGLE_DARK[2]) * lum);
  }
  return new ImageData(d, data.width, data.height);
}

// ─── 5. CYBER — High contrast + teal/chrome tint ───────────────────────────
// Cranks contrast then biases towards cyan for a cyberpunk chrome feel.

export function filterCyber(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data);
  const factor = 2.0; // Contrast factor
  for (let i = 0; i < d.length; i += 4) {
    const r = clamp(factor * (d[i]     - 128) + 128);
    const g = clamp(factor * (d[i + 1] - 128) + 128);
    const b = clamp(factor * (d[i + 2] - 128) + 128);
    // Bias towards teal: reduce red, boost green+blue
    d[i]     = clamp(r * 0.55);
    d[i + 1] = clamp(g * 0.9 + 30);
    d[i + 2] = clamp(b * 1.1 + 40);
  }
  return new ImageData(d, data.width, data.height);
}

// ─── 6. 8-BIT — Pixelation via block downsample ─────────────────────────────
// Reduces effective resolution to a pixel grid, then restores dimensions.

export function filter8bit(data: ImageData): ImageData {
  const w = data.width;
  const h = data.height;
  const src = data.data;
  const out = new Uint8ClampedArray(src.length);
  const blockSize = Math.max(4, Math.floor(Math.min(w, h) / 60));

  for (let y = 0; y < h; y += blockSize) {
    for (let x = 0; x < w; x += blockSize) {
      // Sample the top-left pixel of each block
      const si = (y * w + x) * 4;
      const r = src[si], g = src[si + 1], b = src[si + 2], a = src[si + 3];
      // Posterise: quantise to 4 steps per channel
      const rq = clamp(Math.round(r / 64) * 64);
      const gq = clamp(Math.round(g / 64) * 64);
      const bq = clamp(Math.round(b / 64) * 64);
      // Fill the block
      for (let by = y; by < Math.min(y + blockSize, h); by++) {
        for (let bx = x; bx < Math.min(x + blockSize, w); bx++) {
          const di = (by * w + bx) * 4;
          out[di] = rq; out[di + 1] = gq; out[di + 2] = bq; out[di + 3] = a;
        }
      }
    }
  }
  return new ImageData(out, w, h);
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export function applyFilter(data: ImageData, filter: SkinFilter): ImageData {
  switch (filter) {
    case 'raw':    return filterRaw(data);
    case 'sunset': return filterSunset(data);
    case 'glitch': return filterGlitch(data);
    case 'jungle': return filterJungle(data);
    case 'cyber':  return filterCyber(data);
    case '8bit':   return filter8bit(data);
  }
}

// ─── Apply filter to an ImageBitmap, returning a new canvas ─────────────────

export async function applyFilterToBitmap(
  bitmap: ImageBitmap,
  filter: SkinFilter,
  destWidth: number,
  destHeight: number,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = destWidth;
  canvas.height = destHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, destWidth, destHeight);
  if (filter === 'raw') return canvas;
  const imgData = ctx.getImageData(0, 0, destWidth, destHeight);
  const filtered = applyFilter(imgData, filter);
  ctx.putImageData(filtered, 0, 0);
  return canvas;
}

// ============================================================
// BoardInGoa Canvas Compositing Engine
// Produces the boarding-pass-style ID card as a PNG-ready canvas.
// Framework-agnostic: takes data in, returns a canvas element.
// ============================================================

import { applyFilter, type SkinFilter } from './canvasFilters';
import { drawQRToCanvas } from './qrGen';

export interface CardData {
  photoSrc: string | null;
  name: string;
  stack: string;
  builderClass: string;
  skin: SkinFilter;
  format: 'pfp' | 'builderId';
  panX: number;
  panY: number;
  scale: number;
  // Squad
  squadMode?: boolean;
  teammates?: Array<{ photoSrc: string | null; name: string; stack: string }>;
}

// ─── Dimensions ─────────────────────────────────────────────────────────────
export const CARD_DIMS = {
  pfp:      { w: 1080, h: 1080 },
  builderId:{ w: 1080, h: 1350 },
  squad:    { w: 1620, h: 1080 },
};

// ─── Brand Colours ───────────────────────────────────────────────────────────
const JUNGLE      = '#1E4D2B';
const GOLD        = '#D9A441';
const GOLD_DIM    = '#976a00';
const CREAM       = '#F5EFE0';
const TEAL        = '#2DD4BF';
const DARK        = '#100e06';
const OUTLINE_V   = '#414941';

// ─── Font helpers ────────────────────────────────────────────────────────────
const F_DISPLAY = '"Space Grotesk", sans-serif';
const F_MONO    = '"JetBrains Mono", monospace';

function setFont(ctx: CanvasRenderingContext2D, size: number, weight: string, family: string) {
  ctx.font = `${weight} ${size}px ${family}`;
}

// ─── Load image helper ───────────────────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

// ─── Draw a barcode-style graphic ───────────────────────────────────────────
function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) {
  const bars = [5,2,8,3,6,2,9,1,4,7,2,5,8,3,2,6,4,1,7,3,5,2,8,6,1,4,3,7,2,5];
  const totalUnits = bars.reduce((a, b) => a + b, 0);
  const unitW = w / totalUnits;
  let cx = x;
  bars.forEach((units, i) => {
    if (i % 2 === 0) {
      ctx.fillRect(cx, y, unitW * units, h);
    }
    cx += unitW * units;
  });
}

// ─── Draw perforated edge ────────────────────────────────────────────────────
function drawPerforatedEdge(
  ctx: CanvasRenderingContext2D,
  x: number, y1: number, y2: number
) {
  ctx.save();
  ctx.setLineDash([16, 10]);
  ctx.strokeStyle = OUTLINE_V;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y1 + 30);
  ctx.lineTo(x, y2 - 30);
  ctx.stroke();
  ctx.setLineDash([]);
  // Punch notches
  ctx.fillStyle = JUNGLE;
  ctx.beginPath();
  ctx.arc(x, y1 + 14, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y2 - 14, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── Draw card frame (cream background, gold border) ─────────────────────────
function drawCardFrame(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  radius = 20
) {
  ctx.save();
  // Drop to stacked "thick paper" shadow
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;
  // Cream background
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  // Paper grain overlay (tinted rect at low opacity)
  ctx.fillStyle = 'rgba(139, 115, 85, 0.04)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  // Gold border with offset shadow
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.stroke();
  ctx.restore();
}

// ─── Draw Devanagari watermark ───────────────────────────────────────────────
function drawDevanagariWatermark(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.25);
  setFont(ctx, size, '900', F_DISPLAY);
  ctx.fillStyle = 'rgba(0,0,0,0.035)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('गोवा', 0, 0);
  ctx.restore();
}

// ─── Draw photo with center-crop + pan/zoom + filter ─────────────────────────
async function drawPhoto(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number, y: number, w: number, h: number,
  panX: number, panY: number, scale: number,
  skin: SkinFilter,
  cornerRadius = 12
) {
  const img = await loadImage(src);

  // Cover crop
  const imgRatio = img.width / img.height;
  const frameRatio = w / h;
  let dw: number, dh: number;
  if (imgRatio > frameRatio) {
    dh = h * scale; dw = img.width * (h / img.height) * scale;
  } else {
    dw = w * scale; dh = img.height * (w / img.width) * scale;
  }
  const dx = x + (w - dw) / 2 + panX * dw;
  const dy = y + (h - dh) / 2 + panY * dh;

  // Clip to photo frame
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, cornerRadius);
  ctx.clip();

  // Draw photo to temp canvas for filter
  const tmp = document.createElement('canvas');
  tmp.width = Math.max(1, Math.round(dw));
  tmp.height = Math.max(1, Math.round(dh));
  const tc = tmp.getContext('2d')!;
  tc.drawImage(img, 0, 0, tmp.width, tmp.height);

  if (skin !== 'raw') {
    const imgData = tc.getImageData(0, 0, tmp.width, tmp.height);
    const filtered = applyFilter(imgData, skin);
    tc.putImageData(filtered, 0, 0);
  }

  ctx.drawImage(tmp, dx, dy, dw, dh);
  ctx.restore();
}

// ─── Label row helper ─────────────────────────────────────────────────────────
function drawLabelRow(
  ctx: CanvasRenderingContext2D,
  label: string, value: string,
  x: number, y: number
) {
  setFont(ctx, 26, '700', F_MONO);
  ctx.fillStyle = OUTLINE_V;
  ctx.textAlign = 'left';
  ctx.fillText(label.toUpperCase(), x, y);

  setFont(ctx, 42, '700', F_MONO);
  ctx.fillStyle = DARK;
  ctx.fillText(value.toUpperCase() || '—', x, y + 52);
}

// ─── Horizontal dotted separator ─────────────────────────────────────────────
function drawDottedSep(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number
) {
  ctx.save();
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = OUTLINE_V;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ─── Main draw function ───────────────────────────────────────────────────────

export async function drawCard(
  canvas: HTMLCanvasElement,
  data: CardData
): Promise<void> {
  const isSquad = data.squadMode && data.teammates && data.teammates.length > 0;
  const dims = isSquad
    ? CARD_DIMS.squad
    : data.format === 'pfp' ? CARD_DIMS.pfp : CARD_DIMS.builderId;

  canvas.width = dims.w;
  canvas.height = dims.h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // ── App Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = JUNGLE;
  ctx.fillRect(0, 0, dims.w, dims.h);

  // Subtle radial glow
  const grd = ctx.createRadialGradient(
    dims.w / 2, dims.h / 2, 0,
    dims.w / 2, dims.h / 2, dims.w * 0.7
  );
  grd.addColorStop(0, 'rgba(160, 211, 166, 0.08)');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, dims.w, dims.h);

  if (isSquad) {
    await drawSquadCard(ctx, data, dims.w, dims.h);
  } else if (data.format === 'pfp') {
    await drawPFPCard(ctx, data, dims.w, dims.h);
  } else {
    await drawBuilderIDCard(ctx, data, dims.w, dims.h);
  }
}

// ─── Builder ID Card (1080 × 1350) ───────────────────────────────────────────

async function drawBuilderIDCard(
  ctx: CanvasRenderingContext2D,
  data: CardData,
  W: number, H: number
) {
  const pad = 60;
  const cardX = pad, cardY = pad;
  const cardW = W - pad * 2, cardH = H - pad * 2;
  const stubH = 300;
  const mainH = cardH - stubH;

  // Card frame
  drawCardFrame(ctx, cardX, cardY, cardW, cardH, 20);

  // Header strip (cream)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, 90, [20, 20, 0, 0]);
  ctx.fillStyle = DARK;
  ctx.fill();
  ctx.restore();

  // Logo / Wordmark
  setFont(ctx, 36, '700', F_DISPLAY);
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'left';
  ctx.fillText('HH GOA \'26', cardX + 36, cardY + 58);

  setFont(ctx, 26, '500', F_MONO);
  ctx.fillStyle = '#a0d3a6';
  ctx.textAlign = 'right';
  ctx.fillText('GOA, INDIA · 28–31 OCT 2026', cardX + cardW - 36, cardY + 58);

  // Devanagari watermark
  drawDevanagariWatermark(ctx, cardX + cardW * 0.72, cardY + mainH * 0.5, 280);

  // Photo zone
  const photoX = cardX + 40, photoY = cardY + 110;
  const photoW = 560, photoH = 680;

  if (data.photoSrc) {
    await drawPhoto(ctx, data.photoSrc, photoX, photoY, photoW, photoH,
      data.panX, data.panY, data.scale, data.skin, 14);
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 14);
    ctx.fillStyle = '#222017';
    ctx.fill();
    ctx.strokeStyle = OUTLINE_V;
    ctx.lineWidth = 3;
    ctx.stroke();
    // Placeholder person icon
    ctx.fillStyle = '#414941';
    ctx.beginPath();
    ctx.arc(photoX + photoW / 2, photoY + photoH / 2 - 60, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(photoX + photoW / 2, photoY + photoH + 100, 200, 0, Math.PI, true);
    ctx.fill();
    ctx.restore();
  }

  // Photo border
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, 14);
  ctx.stroke();

  // Right column data fields
  const rx = photoX + photoW + 44;
  const ry = cardY + 120;
  const rw = cardW - photoW - 84;

  drawLabelRow(ctx, 'PASSENGER NAME', data.name || 'YOUR NAME', rx, ry);
  drawDottedSep(ctx, rx, ry + 110, rw);
  drawLabelRow(ctx, 'STACK / SPECIALTY', data.stack || 'BUILDER', rx, ry + 130);
  drawDottedSep(ctx, rx, ry + 240, rw);

  // Builder class pill
  const bcLabel = (data.builderClass || 'HACKER').toUpperCase();
  setFont(ctx, 24, '700', F_MONO);
  const bcW = Math.min(ctx.measureText(bcLabel).width + 48, rw);
  const bcH = 60;
  const bcX = rx;
  const bcY = ry + 260;

  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.roundRect(bcX, bcY, bcW, bcH, 8);
  ctx.fill();

  setFont(ctx, 24, '700', F_MONO);
  ctx.fillStyle = '#003731';
  ctx.textAlign = 'center';
  ctx.fillText(bcLabel, bcX + bcW / 2, bcY + 40);
  ctx.textAlign = 'left';

  // Builder class label above
  setFont(ctx, 22, '700', F_MONO);
  ctx.fillStyle = OUTLINE_V;
  ctx.fillText('BUILDER CLASS', rx, ry + 254);

  // FROM / TO
  const depY = ry + 360;
  setFont(ctx, 22, '700', F_MONO);
  ctx.fillStyle = OUTLINE_V;
  ctx.fillText('FROM', rx, depY);
  ctx.fillText('TO', rx + rw / 2, depY);

  setFont(ctx, 38, '700', F_DISPLAY);
  ctx.fillStyle = DARK;
  ctx.fillText('EARTH', rx, depY + 48);
  ctx.fillText('GOA', rx + rw / 2, depY + 48);

  // Gate / Seat
  const gateY = depY + 110;
  drawDottedSep(ctx, rx, gateY, rw);
  setFont(ctx, 22, '700', F_MONO);
  ctx.fillStyle = OUTLINE_V;
  ctx.fillText('GATE', rx, gateY + 36);
  ctx.fillText('CLASS', rx + rw / 2, gateY + 36);
  setFont(ctx, 42, '700', F_DISPLAY);
  ctx.fillStyle = DARK;
  ctx.fillText('26', rx, gateY + 84);

  setFont(ctx, 32, '700', F_DISPLAY);
  ctx.fillStyle = GOLD_DIM;
  ctx.fillText('FIRST', rx + rw / 2, gateY + 84);

  // Perforated divider between main and stub
  const divY = cardY + mainH;
  drawDottedSep(ctx, cardX + 14, divY, cardW - 28);
  // Punch notches
  ctx.fillStyle = JUNGLE;
  ctx.beginPath(); ctx.arc(cardX, divY, 20, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cardX + cardW, divY, 20, 0, Math.PI * 2); ctx.fill();

  // ── Tear-off STUB ──
  const sX = cardX + 20, sY = divY + 20, sW = cardW - 40, sH = stubH - 30;

  // QR code
  const qrSize = sH - 32;
  const qrX = sX;
  const qrY = sY + 16;
  await drawQRToCanvas(ctx, 'https://hhgoa.com', qrX, qrY, qrSize);

  // Stub vertical perf
  const stubPerfX = qrX + qrSize + 28;
  drawPerforatedEdge(ctx, stubPerfX, sY, sY + sH);

  // Barcode
  const bcodeX = stubPerfX + 28;
  const bcodeY = sY + 20;
  const bcodeW = sW - (stubPerfX - sX) - 64;
  const bcodeH = sH - 80;
  ctx.fillStyle = DARK;
  drawBarcode(ctx, bcodeX, bcodeY, bcodeW, bcodeH);

  // Barcode text
  setFont(ctx, 22, '500', F_MONO);
  ctx.fillStyle = DARK;
  ctx.textAlign = 'center';
  ctx.fillText('G-2026-HH · #FrameInGoa', bcodeX + bcodeW / 2, bcodeY + bcodeH + 36);

  // Footer tagline
  setFont(ctx, 24, '700', F_MONO);
  ctx.textAlign = 'left';
  ctx.fillStyle = OUTLINE_V;
  ctx.fillText('LESS NOISE. MORE SIGNAL.', bcodeX, sY + sH - 8);

  setFont(ctx, 22, '500', F_MONO);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8b9389';
  ctx.fillText('2:47 PM STUDIO · TASK #1', cardX + cardW - 24, sY + sH - 8);
  ctx.textAlign = 'left';
}

// ─── PFP Card (1080 × 1080) ──────────────────────────────────────────────────

async function drawPFPCard(
  ctx: CanvasRenderingContext2D,
  data: CardData,
  W: number, H: number
) {
  const pad = 60;
  const cardX = pad, cardY = pad;
  const cardW = W - pad * 2, cardH = H - pad * 2;

  drawCardFrame(ctx, cardX, cardY, cardW, cardH, 20);

  // Devanagari watermark
  drawDevanagariWatermark(ctx, W / 2, H / 2, 320);

  // Full-bleed photo with frame
  const photoX = cardX + 24, photoY = cardY + 24;
  const photoW = cardW - 48, photoH = cardH - 180;

  if (data.photoSrc) {
    await drawPhoto(ctx, data.photoSrc, photoX, photoY, photoW, photoH,
      data.panX, data.panY, data.scale, data.skin, 14);
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 14);
    ctx.fillStyle = '#222017';
    ctx.fill();
    ctx.restore();
  }

  // Photo border
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, 14);
  ctx.stroke();

  // Bottom data strip
  const stripY = photoY + photoH + 20;
  const stripH = cardH - photoH - 60;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX + 24, cardY + cardH - stripH - 20, cardW - 48, stripH + 10, [0, 0, 14, 14]);
  ctx.fillStyle = DARK;
  ctx.fill();
  ctx.restore();

  setFont(ctx, 52, '700', F_DISPLAY);
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'center';
  ctx.fillText((data.name || 'YOUR NAME').toUpperCase(), W / 2, stripY + 56);

  setFont(ctx, 28, '500', F_MONO);
  ctx.fillStyle = GOLD;
  ctx.fillText((data.stack || 'BUILDER').toUpperCase(), W / 2, stripY + 96);

  setFont(ctx, 22, '700', F_MONO);
  ctx.fillStyle = TEAL;
  ctx.fillText(`✦ ${(data.builderClass || 'HACKER').toUpperCase()} ✦`, W / 2, stripY + 128);

  // Footer
  setFont(ctx, 22, '500', F_MONO);
  ctx.fillStyle = '#8b9389';
  ctx.fillText('GOA, INDIA · 28–31 OCT 2026 · #FrameInGoa', W / 2, stripY + 160);
}

// ─── Squad Card (1620 × 1080) ─────────────────────────────────────────────────

async function drawSquadCard(
  ctx: CanvasRenderingContext2D,
  data: CardData,
  W: number, H: number
) {
  const pad = 50;
  const all = [
    { photoSrc: data.photoSrc, name: data.name, stack: data.stack },
    ...(data.teammates ?? []),
  ];
  const count = Math.min(all.length, 3);

  const cardW = W - pad * 2;
  const cardH = H - pad * 2;
  drawCardFrame(ctx, pad, pad, cardW, cardH, 20);
  drawDevanagariWatermark(ctx, W / 2, H / 2, 300);

  // Header
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, 80, [20, 20, 0, 0]);
  ctx.fillStyle = DARK;
  ctx.fill();
  ctx.restore();

  setFont(ctx, 34, '700', F_DISPLAY);
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'left';
  ctx.fillText('SQUAD BOARDING PASS · HH GOA 2026', pad + 32, pad + 54);

  setFont(ctx, 22, '500', F_MONO);
  ctx.fillStyle = '#a0d3a6';
  ctx.textAlign = 'right';
  ctx.fillText('GOA, INDIA · 28–31 OCT 2026', pad + cardW - 32, pad + 54);

  // Member slots
  const slotW = (cardW - 40) / count;
  const slotY = pad + 90;
  const slotH = cardH - 90 - 140;
  const photoH = slotH - 120;

  for (let i = 0; i < count; i++) {
    const m = all[i];
    const slotX = pad + 20 + i * slotW;
    const photoX = slotX + 16;
    const photoW = slotW - 32;
    const photoY = slotY + 12;

    if (m.photoSrc) {
      await drawPhoto(ctx, m.photoSrc, photoX, photoY, photoW, photoH,
        i === 0 ? data.panX : 0,
        i === 0 ? data.panY : 0,
        i === 0 ? data.scale : 1,
        data.skin, 12);
    } else {
      ctx.fillStyle = '#222017';
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 12);
      ctx.fill();
    }

    // Photo border
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 12);
    ctx.stroke();

    // Name / Stack
    setFont(ctx, 36, '700', F_DISPLAY);
    ctx.fillStyle = DARK;
    ctx.textAlign = 'center';
    ctx.fillText((m.name || `BUILDER ${i + 1}`).toUpperCase(), slotX + slotW / 2, slotY + photoH + 52);

    setFont(ctx, 24, '500', F_MONO);
    ctx.fillStyle = GOLD_DIM;
    ctx.fillText((m.stack || 'HACKER').toUpperCase(), slotX + slotW / 2, slotY + photoH + 88);

    // Vertical separator (between slots)
    if (i < count - 1) {
      drawPerforatedEdge(ctx, slotX + slotW - 6, slotY, slotY + slotH - 10);
    }
  }

  // Shared footer strip
  const footY = pad + cardH - 130;
  drawDottedSep(ctx, pad + 20, footY, cardW - 40);

  // Punch notches
  ctx.fillStyle = JUNGLE;
  ctx.beginPath(); ctx.arc(pad, footY, 20, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(pad + cardW, footY, 20, 0, Math.PI * 2); ctx.fill();

  // QR
  const qrSize = 100;
  await drawQRToCanvas(ctx, 'https://hhgoa.com', pad + 24, footY + 14, qrSize);

  // Barcode
  const bcX = pad + qrSize + 56;
  const bcW = cardW - qrSize - 120;
  ctx.fillStyle = DARK;
  drawBarcode(ctx, bcX, footY + 24, bcW, 60);

  setFont(ctx, 22, '500', F_MONO);
  ctx.fillStyle = DARK;
  ctx.textAlign = 'center';
  ctx.fillText('G-2026-HH · SQUAD PASS · #FrameInGoa', bcX + bcW / 2, footY + 100);

  setFont(ctx, 22, '700', F_MONO);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8b9389';
  ctx.fillText('LESS NOISE. MORE SIGNAL. · 2:47 PM STUDIO', pad + cardW - 24, footY + 100);
  ctx.textAlign = 'left';
}

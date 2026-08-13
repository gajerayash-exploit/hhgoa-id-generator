// QR Code generation utility
// Uses the `qrcode` npm package to generate a QR code as a data URL or canvas.

import QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL (PNG).
 */
export async function generateQRDataURL(
  text: string,
  size: number = 200,
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    color: {
      dark: '#100e06',  // surface-container-lowest
      light: '#F5EFE0', // cream
    },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Draw a QR code directly onto a canvas context at the given position.
 */
export async function drawQRToCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
): Promise<void> {
  const dataUrl = await generateQRDataURL(text, size);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, x, y, size, size);
      resolve();
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

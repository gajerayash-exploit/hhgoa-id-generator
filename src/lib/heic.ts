// HEIC → JPEG conversion with EXIF orientation correction
// Lazy-loads heic2any only when needed to keep bundle small.

export async function processImageFile(file: File): Promise<string> {
  let processedFile = file;

  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  if (isHeic) {
    const heic2any = (await import('heic2any')).default;
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
    const single = Array.isArray(blob) ? blob[0] : blob;
    processedFile = new File([single], file.name.replace(/\.hei[cf]$/i, '.jpg'), {
      type: 'image/jpeg',
    });
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(processedFile);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(url); return; }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

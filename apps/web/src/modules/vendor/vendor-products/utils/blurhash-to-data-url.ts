import { decode } from 'blurhash';

const SIZE = 32;

/**
 * Converts a blurHash string to a data URL for use as Next.js Image blurDataURL.
 * Runs in the browser (uses canvas). Returns empty string if blurHash is invalid or in SSR.
 */
export function getBlurDataUrlFromBlurHash(blurHash: string | null): string {
  if (!blurHash || typeof document === 'undefined') return '';

  try {
    const pixels = decode(blurHash, SIZE, SIZE);
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imageData = ctx.createImageData(SIZE, SIZE);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.5);
  } catch {
    return '';
  }
}

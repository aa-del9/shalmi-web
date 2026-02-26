import { encode } from 'blurhash';
import sharp from 'sharp';

const BLURHASH_RESIZE = 32;
const BLURHASH_COMPONENT_X = 4;
const BLURHASH_COMPONENT_Y = 3;

export async function getBlurHashFromBuffer(
  buffer: Buffer
): Promise<string | null> {
  try {
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .resize(BLURHASH_RESIZE, BLURHASH_RESIZE, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixels = new Uint8ClampedArray(data);
    return encode(
      pixels,
      info.width,
      info.height,
      BLURHASH_COMPONENT_X,
      BLURHASH_COMPONENT_Y
    );
  } catch {
    return null;
  }
}

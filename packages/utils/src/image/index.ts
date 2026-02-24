import imageCompression from 'browser-image-compression';

const DEFAULT_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1024,
} as const;

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, DEFAULT_OPTIONS);
}

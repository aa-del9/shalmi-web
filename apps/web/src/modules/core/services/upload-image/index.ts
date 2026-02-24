import {
  generateUniqueFilename,
  uploadFile,
  getPublicUrl,
} from '@repo/storage';
import { getExtensionFromFilename } from '@/modules/core/utils/file';
import { getBlurHashFromBuffer } from '../blurhash';

export type UploadImageResult = {
  url: string;
  blurHash: string | null;
};

export async function uploadImageToStorage(
  file: File,
  bucket: string
): Promise<UploadImageResult> {
  const ext = getExtensionFromFilename(file.name);
  const path = generateUniqueFilename(ext ?? undefined);
  const buffer = Buffer.from(await file.arrayBuffer());

  await uploadFile(bucket, path, buffer);
  const url = getPublicUrl(bucket, path);
  const blurHash = await getBlurHashFromBuffer(buffer);

  return { url, blurHash };
}

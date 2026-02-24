import { getSupabaseServerClient } from './client';

export type UploadFileBody = Buffer | Blob | ArrayBuffer;

function toUploadBody(
  body: UploadFileBody
): Blob | ArrayBuffer | Uint8Array {
  if (body instanceof Buffer) {
    return new Uint8Array(body);
  }
  return body;
}

export async function uploadFile(
  bucket: string,
  path: string,
  body: UploadFileBody
): Promise<string> {
  const client = getSupabaseServerClient();
  const { error } = await client.storage
    .from(bucket)
    .upload(path, toUploadBody(body), {
      contentType: undefined,
      upsert: false,
    });
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
  return path;
}

export function getPublicUrl(bucket: string, path: string): string {
  const client = getSupabaseServerClient();
  const {
    data: { publicUrl },
  } = client.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

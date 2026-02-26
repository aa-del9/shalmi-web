const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

export function getExtensionFromFilename(filename: string): string | undefined {
  const parts = filename.split('.');
  if (parts.length < 2) return undefined;
  return parts.pop()?.toLowerCase();
}

export function getExtensionFromMimeType(mimeType: string): string | undefined {
  return MIME_TO_EXT[mimeType.toLowerCase()];
}

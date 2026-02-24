export function getExtensionFromFilename(filename: string): string | undefined {
  const parts = filename.split('.');
  if (parts.length < 2) return undefined;
  return parts.pop()?.toLowerCase();
}

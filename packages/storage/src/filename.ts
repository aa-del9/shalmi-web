import { generateId } from '@repo/utils/id';

export function generateUniqueFilename(extension?: string): string {
  const uuid = generateId();
  if (extension === undefined || extension === '') {
    return uuid;
  }
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return `${uuid}${ext}`;
}

/**
 * File type detection and handling utilities
 */

const IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'ico',
];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
const DOCUMENT_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
];

/**
 * Get file extension from filename or URL
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() ?? '';
};

/**
 * Check if file is an image
 */
export const isImage = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return IMAGE_EXTENSIONS.includes(ext);
};

/**
 * Check if file is a video
 */
export const isVideo = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return VIDEO_EXTENSIONS.includes(ext);
};

/**
 * Check if file is a document
 */
export const isDocument = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return DOCUMENT_EXTENSIONS.includes(ext);
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get MIME type from file extension
 */
export const getMimeType = (filename: string): string => {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm',
  };
  return mimeTypes[ext] ?? 'application/octet-stream';
};

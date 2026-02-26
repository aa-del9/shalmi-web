'use client';

import { useState, useCallback } from 'react';
import { compressImage } from '@repo/utils/image';
import { ImageUploadResult, UseImageUploadOptions } from './image-upload.types';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export function useImageUpload({
  accept = DEFAULT_ACCEPT,
  multiple = true,
  onUploaded,
  uploadUrl,
  compressBeforeUpload = true,
}: UseImageUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.isArray(files) ? files : Array.from(files);
      if (list.length === 0) return;

      setError(null);
      setIsUploading(true);

      try {
        const toUpload = await Promise.all(
          list.map((file) =>
            compressBeforeUpload && file.type.startsWith('image/')
              ? compressImage(file)
              : Promise.resolve(file)
          )
        );

        const formData = new FormData();
        for (const file of toUpload) {
          formData.append('file', file);
        }

        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json?.error ?? 'Upload failed');
        }

        const data = json.data as { results: ImageUploadResult[] };
        const results = data?.results ?? [];
        for (const item of results) {
          onUploaded({ url: item.url, blurHash: item.blurHash ?? null });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [onUploaded, uploadUrl, compressBeforeUpload]
  );

  return {
    uploadFiles,
    isUploading,
    error,
    accept,
    multiple,
  };
}

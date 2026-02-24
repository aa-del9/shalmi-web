'use client';

import { useRef, useCallback } from 'react';
import { Button } from '@repo/ui/components/button';
import { Spinner } from '@repo/ui/components/spinner';
import { cn } from '@repo/ui/lib/utils';
import { UploadIcon } from 'lucide-react';
import { useImageUpload } from './use-image-upload';
import { ImageUploadProps } from './image-upload.types';

export function ImageUpload({
  accept,
  multiple = true,
  onUploaded,
  uploadUrl,
  compressBeforeUpload = true,
  className,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    uploadFiles,
    isUploading,
    error,
    accept: acceptFromHook,
    multiple: multipleFromHook,
  } = useImageUpload({
    accept,
    multiple,
    onUploaded,
    uploadUrl,
    compressBeforeUpload,
  });

  const handleClick = useCallback(() => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  }, [disabled, isUploading]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.length) {
        uploadFiles(files);
      }
      e.target.value = '';
    },
    [uploadFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || isUploading) return;
      const files = e.dataTransfer.files;
      if (files?.length) {
        uploadFiles(files);
      }
    },
    [disabled, isUploading, uploadFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className={cn('space-y-2', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-busy={isUploading}
        aria-disabled={disabled}
        className={cn(
          'border-muted-foreground/25 bg-muted/30 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
          'hover:border-muted-foreground/40 hover:bg-muted/50',
          (disabled || isUploading) && 'pointer-events-none opacity-60',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptFromHook}
          multiple={multipleFromHook}
          onChange={handleChange}
          className="sr-only"
          aria-hidden
        />
        {isUploading ? (
          <>
            <Spinner className="size-8" />
            <span className="text-muted-foreground text-sm">Uploading…</span>
          </>
        ) : (
          <>
            <UploadIcon className="text-muted-foreground size-8" />
            <span className="text-muted-foreground text-sm">
              Drag and drop or click to upload
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Choose files
            </Button>
          </>
        )}
      </div>
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

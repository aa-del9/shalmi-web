'use client';

import Image from 'next/image';
import { Button } from '@repo/ui/components/button';
import { XIcon } from 'lucide-react';
import { useProductImageThumbnail } from './use-product-image-thumbnail';

type ProductImageThumbnailProps = {
  url: string;
  blurHash: string | null;
  onRemove: () => void;
  disabled?: boolean;
  alt?: string;
};

export function ProductImageThumbnail({
  url,
  blurHash,
  onRemove,
  disabled = false,
  alt = 'Product image',
}: ProductImageThumbnailProps) {
  const { blurDataUrl } = useProductImageThumbnail({
    blurHash,
  });

  return (
    <div className="bg-muted relative aspect-square w-full max-w-[140px] min-w-[100px] overflow-hidden rounded-lg border">
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover"
        sizes="140px"
        placeholder={blurDataUrl ? 'blur' : 'empty'}
        blurDataURL={blurDataUrl || undefined}
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 size-7"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remove image"
      >
        <XIcon className="size-3.5" />
      </Button>
    </div>
  );
}

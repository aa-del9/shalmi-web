'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@repo/ui/components/button';
import { XIcon } from 'lucide-react';
import { getBlurDataUrlFromBlurHash } from '../../utils/blurhash-to-data-url';

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
  const [blurDataUrl, setBlurDataUrl] = useState('');

  useEffect(() => {
    setBlurDataUrl(getBlurDataUrlFromBlurHash(blurHash));
  }, [blurHash]);

  return (
    <div className="relative aspect-square w-full min-w-[100px] max-w-[140px] overflow-hidden rounded-lg border bg-muted">
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
        className="absolute right-1 top-1 size-7"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remove image"
      >
        <XIcon className="size-3.5" />
      </Button>
    </div>
  );
}

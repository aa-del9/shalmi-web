import { useEffect, useState } from 'react';
import { getBlurDataUrlFromBlurHash } from '../../utils/blurhash-to-data-url';

export const useProductImageThumbnail = ({
  blurHash,
}: {
  blurHash: string | null;
}) => {
  const [blurDataUrl, setBlurDataUrl] = useState('');

  useEffect(() => {
    setBlurDataUrl(getBlurDataUrlFromBlurHash(blurHash));
  }, [blurHash]);

  return {
    blurDataUrl,
  };
};

import type { Banner } from '../../types';

export type BannersCarouselProps = {
  banners: Banner[];
  selectedId: string | null;
  onSelectBanner: (id: string | null) => void;
  onReorder: (orderedIds: string[]) => void;
  onRemoveFromActive?: (bannerId: string) => void;
};

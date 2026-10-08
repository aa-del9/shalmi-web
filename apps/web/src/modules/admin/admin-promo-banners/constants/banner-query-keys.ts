export const BannerQueryKeys = {
  all: ['banners'] as const,
  list: () => [...BannerQueryKeys.all, 'list'] as const,
};

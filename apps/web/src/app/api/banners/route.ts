import { getCachedBanners } from '@/modules/promotions/utils/get-cached-banners';
import { jsonSuccess, jsonError } from '@/modules/core/api';

export async function GET() {
  try {
    const banners = await getCachedBanners();
    return jsonSuccess(banners);
  } catch (err) {
    console.error('GET /api/banners error:', err);
    return jsonError('Failed to load banners.', 500);
  }
}

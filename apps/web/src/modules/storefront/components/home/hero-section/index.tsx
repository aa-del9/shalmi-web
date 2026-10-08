import { getCachedBanners } from '@/modules/promotions/utils/get-cached-banners';

import { HeroCarousel } from '../../hero-carousel';

/**
 * Pencil bid1Y/ObrJy — hero region.
 *
 * Per gap-analysis Q3 (binding STUBBED): "Existing HeroCarousel
 * retoken'd to use ink/paper colors but rendering banner images."
 * The Pencil editorial typography hero (eyebrow + 56/800 H1 +
 * paragraph + 2 CTAs + arrows) is **not** shipped in Batch 1 — it
 * waits on a banner-schema extension that is its own feature in
 * scope-cut.
 *
 * Layout note: the hero-card itself was 1360px wide × 380px tall on
 * an `ink` fill. Since we keep the existing carousel for now, we
 * simply wrap it inside the home content max-width and use the
 * existing aspect-3/1 image.
 *
 * TODO(post-v1): swap to `EditorialHero` once `promotional_banners`
 * gains eyebrow/headline/description/cta1/cta2 fields (or hard-code
 * 1-4 slides per scope-cut).
 */
export async function HomeHeroSection() {
  const banners = await getCachedBanners();

  if (banners.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 pt-4 md:px-10 md:pt-8">
      <HeroCarousel banners={banners} />
    </section>
  );
}

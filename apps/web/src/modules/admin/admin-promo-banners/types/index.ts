export type BannerPosition = 'hero' | 'promo_top' | 'strip' | 'sidebar';
export type BannerStatus = 'live' | 'paused';
export type BannerDerivedState =
  | 'live'
  | 'scheduled'
  | 'paused'
  | 'expired';

export type Banner = {
  id: string;
  title: string;
  internalName: string | null;
  eyebrow: string | null;
  ctaLabel: string | null;
  imageUrl: string;
  targetUrl: string | null;
  position: BannerPosition;
  status: BannerStatus;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  displayOrder: number;
  derivedState: BannerDerivedState;
  createdAt: string;
  updatedAt: string;
};

export type BannerListMeta = {
  totals: {
    all: number;
    live: number;
    scheduled: number;
    paused: number;
    expired: number;
  };
};

export type BulkUpdateBannerPayload = {
  id: string;
  isActive: boolean;
  displayOrder: number;
};

export type BannerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function deriveBannerState(args: {
  status: BannerStatus;
  startsAt: string | Date | null;
  endsAt: string | Date | null;
}): BannerDerivedState {
  const now = new Date();
  const startsAt = args.startsAt ? new Date(args.startsAt) : null;
  const endsAt = args.endsAt ? new Date(args.endsAt) : null;

  if (args.status === 'paused') return 'paused';
  if (endsAt && endsAt < now) return 'expired';
  if (startsAt && startsAt > now) return 'scheduled';
  return 'live';
}

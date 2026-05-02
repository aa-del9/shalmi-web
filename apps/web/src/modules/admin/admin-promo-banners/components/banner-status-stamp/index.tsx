import { Stamp } from '@repo/ui/components/stamp';
import type { BannerDerivedState } from '../../types';

const STAMP_VARIANT: Record<
  BannerDerivedState,
  'success' | 'info' | 'neutral' | 'warning' | 'critical'
> = {
  live: 'success',
  scheduled: 'info',
  paused: 'neutral',
  expired: 'critical',
};

const STAMP_LABEL: Record<BannerDerivedState, string> = {
  live: 'Live',
  scheduled: 'Scheduled',
  paused: 'Paused',
  expired: 'Expired',
};

export function BannerStatusStamp({ state }: { state: BannerDerivedState }) {
  return <Stamp variant={STAMP_VARIANT[state]}>{STAMP_LABEL[state]}</Stamp>;
}

export { STAMP_LABEL };

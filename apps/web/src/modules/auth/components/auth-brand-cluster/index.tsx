import { cn } from '@repo/ui/lib/utils';

interface AuthBrandClusterProps {
  className?: string;
  /** Optional right-hand element (e.g. SECURE stamp on the OTP screen). */
  trailing?: React.ReactNode;
}

/**
 * Brand mark cluster used at the top of every Auth surface: 32x32 ink logo
 * tile with a paper-coloured "S" glyph, "Shalmi" wordmark sans 23/800,
 * "Bazaar consolidation" tagline mono 13/600.
 *
 * Per buyer-signin gap-analysis §0a `D3sSR` / `pBv5H`.
 */
export function AuthBrandCluster({ className, trailing }: AuthBrandClusterProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3">
        <div
          aria-hidden
          className="flex size-8 items-center justify-center rounded-sm bg-ink text-paper"
        >
          <span className="font-sans text-[15px] font-extrabold leading-none">
            S
          </span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-sans text-[23px] font-extrabold tracking-[-0.02em] text-ink">
            Shalmi
          </span>
          <span className="mt-1 font-mono text-[12px] font-semibold text-ink-3">
            Bazaar consolidation
          </span>
        </div>
      </div>
      {trailing}
    </div>
  );
}

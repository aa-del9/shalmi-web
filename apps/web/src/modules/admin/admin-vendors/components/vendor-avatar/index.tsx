import { cn } from '@repo/ui/lib/utils';

type Size = 'sm' | 'md' | 'lg';

type VendorAvatarProps = {
  fullName: string | null;
  shopName: string;
  logoUrl: string | null;
  size?: Size;
  className?: string;
};

const SIZE_TO_CLASS: Record<Size, string> = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-xl',
};

// Q20 binding: initials = first letter of first two whitespace-split
// words of `fullName` (fall back to `shopName`). Single-word names
// give a one-letter initial.
function deriveInitials(fullName: string | null, shopName: string): string {
  const source = (fullName && fullName.trim().length > 0
    ? fullName
    : shopName
  ).trim();
  if (source.length === 0) return '?';
  const words = source.split(/\s+/).slice(0, 2);
  return words.map((word) => word.charAt(0).toUpperCase()).join('');
}

export function VendorAvatar({
  fullName,
  shopName,
  logoUrl,
  size = 'md',
  className,
}: VendorAvatarProps) {
  const initials = deriveInitials(fullName, shopName);
  const sizeClass = SIZE_TO_CLASS[size];

  if (logoUrl) {
    return (
      <span
        aria-hidden
        className={cn(
          'border-rule-2 flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white',
          sizeClass,
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        'border-green-500 bg-green-bg text-green-700 flex shrink-0 items-center justify-center rounded-full border font-bold',
        sizeClass,
        className
      )}
    >
      {initials}
    </span>
  );
}

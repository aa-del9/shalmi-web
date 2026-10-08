import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@repo/ui/lib/utils';

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors shrink-0 outline-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    'rounded-sm',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/30',
  ].join(' '),
  {
    variants: {
      variant: {
        // Pencil: primary green — green-2 fill, white text.
        default: 'bg-primary text-primary-foreground hover:bg-green-700 active:bg-green-900',
        // Pencil: destructive outline — white fill, red border, red text.
        destructive:
          'border border-red bg-white text-red hover:bg-red-bg active:bg-red-bg focus-visible:ring-destructive',
        // Pencil: outline ink — white fill, ink border, ink text.
        outline:
          'border border-ink bg-white text-ink hover:bg-paper-2 active:bg-paper-3',
        // No Pencil counterpart — kept for compatibility. Re-tokened to paper-2.
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-paper-3 active:bg-paper-3',
        // Pencil: ghost — no fill, ink-3 text, hover lifts to ink-2.
        ghost: 'text-ink-3 hover:text-ink-2 hover:bg-paper-2',
        // No Pencil counterpart — kept for compatibility.
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        // Pencil canonical 40h with 16px horizontal padding.
        default: 'h-10 px-4 text-sm has-[>svg]:px-3',
        sm: 'h-8 px-3 text-sm gap-1.5 has-[>svg]:px-2.5',
        lg: 'h-12 px-6 text-base has-[>svg]:px-4',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

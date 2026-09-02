'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';

import { cn } from '@repo/ui/lib/utils';

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Pencil declares no checkbox spec — re-derived per §5.4 tokens.
        'peer size-4 shrink-0 rounded-xs border-[1.5px] border-rule-2 bg-white transition-colors outline-none',
        'hover:border-ink',
        'data-[state=checked]:bg-green-2 data-[state=checked]:border-green-2 data-[state=checked]:text-white',
        'focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20',
        'aria-invalid:border-red aria-invalid:ring-2 aria-invalid:ring-red/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

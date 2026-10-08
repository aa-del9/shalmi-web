import * as React from 'react';

import { cn } from '@repo/ui/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Pencil §3.1 search-field-light + labeled-input:
        //   44h · radius 6 · white fill · 1.5px rule-2 stroke
        //   padding [0,12] · text-base / placeholder ink-4
        'flex h-11 w-full min-w-0 rounded-sm border-[1.5px] border-rule-2 bg-white px-3 text-sm text-ink-2 transition-colors outline-none',
        'placeholder:text-ink-4',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink-2',
        'selection:bg-primary selection:text-primary-foreground',
        // Hover/focus per §5.4 re-derived states.
        'hover:border-ink',
        'focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20',
        // Error.
        'aria-invalid:border-red aria-invalid:ring-2 aria-invalid:ring-red/20',
        // Disabled.
        'disabled:cursor-not-allowed disabled:bg-paper-2 disabled:border-rule disabled:text-ink-4',
        className
      )}
      {...props}
    />
  );
}

export { Input };

'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export const FilterSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    active?: boolean;
  }
>(({ className, children, active = false, ...props }, ref) => {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition',

        active
          ? 'border-lime-500 bg-lime-50 text-lime-700 shadow-lime-200'
          : 'border-gray-200 text-gray-700',

        'focus:outline-none focus:ring-2 focus:ring-lime-400',
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>

      <ChevronDown
        className={cn(
          'h-4 w-4 text-lime-600 transition-transform duration-200 group-data-[state=open]:rotate-180'
        )}
      />
    </SelectPrimitive.Trigger>
  );
});

FilterSelectTrigger.displayName = 'FilterSelectTrigger';

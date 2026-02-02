import * as React from 'react';
import { cn } from '@/lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = 'text', 'aria-invalid': ariaInvalid, ...props },
    ref
  ) => {
    const isDate = type === 'date';
    return (
      <input
        type={type}
        aria-invalid={ariaInvalid}
        ref={ref}
        className={cn(
          'border-input bg-background w-full rounded-md border px-3 text-sm',
          isDate ? 'h-[42px] appearance-none' : 'h-10 py-2',
          'ring-offset-background placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'focus-visible:border-lime-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          ariaInvalid && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };

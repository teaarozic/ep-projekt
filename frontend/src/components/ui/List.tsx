import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ListProps {
  items: string[];
  className?: string;
}

export function List({ items = [], className }: ListProps) {
  return (
    <ul className={cn('list-disc space-y-1 pl-6 text-sm', className)}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

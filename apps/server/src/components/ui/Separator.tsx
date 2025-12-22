import type { FC } from 'hono/jsx';
import { cn } from '../../lib/utils';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  class?: string;
  decorative?: boolean;
}

export const Separator: FC<SeparatorProps> = ({
  orientation = 'horizontal',
  class: className,
  decorative = true,
}) => {
  return (
    <div
      data-slot="separator"
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      class={cn(
        'bg-gray-200 shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
    />
  );
};

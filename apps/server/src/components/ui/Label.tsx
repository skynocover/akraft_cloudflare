import type { FC, PropsWithChildren } from 'hono/jsx';
import { cn } from '../../lib/utils';

interface LabelProps {
  for?: string;
  class?: string;
}

export const Label: FC<PropsWithChildren<LabelProps>> = ({
  children,
  for: htmlFor,
  class: className,
}) => {
  return (
    <label
      for={htmlFor}
      data-slot="label"
      class={cn(
        'flex items-center gap-2 text-sm font-medium leading-none',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
    >
      {children}
    </label>
  );
};

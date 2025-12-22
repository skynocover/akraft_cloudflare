import type { FC } from 'hono/jsx';
import { cn } from '../../lib/utils';

interface CheckboxProps {
  name?: string;
  id?: string;
  checked?: boolean;
  disabled?: boolean;
  class?: string;
  value?: string;
}

export const Checkbox: FC<CheckboxProps> = ({
  name,
  id,
  checked,
  disabled,
  class: className,
  value,
}) => {
  return (
    <input
      type="checkbox"
      name={name}
      id={id}
      checked={checked}
      disabled={disabled}
      value={value}
      data-slot="checkbox"
      class={cn(
        'peer h-4 w-4 shrink-0 rounded border border-gray-300 shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
        'checked:bg-blue-500 checked:border-blue-500 checked:text-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  );
};

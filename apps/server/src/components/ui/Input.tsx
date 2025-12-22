import type { FC } from 'hono/jsx';
import { cn } from '../../lib/utils';

interface InputProps {
  type?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  class?: string;
  id?: string;
  accept?: string;
}

export const Input: FC<InputProps> = ({
  type = 'text',
  name,
  placeholder,
  value,
  disabled,
  class: className,
  id,
  accept,
}) => {
  return (
    <input
      type={type}
      name={name}
      id={id}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      accept={accept}
      data-slot="input"
      class={cn(
        'flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-transparent px-3 py-1 text-base shadow-sm transition-colors',
        'placeholder:text-gray-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:border-blue-400',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
    />
  );
};

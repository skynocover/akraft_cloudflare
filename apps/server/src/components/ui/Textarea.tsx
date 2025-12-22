import type { FC } from 'hono/jsx';
import { cn } from '../../lib/utils';

interface TextareaProps {
  name?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  class?: string;
  id?: string;
  rows?: number;
  required?: boolean;
}

export const Textarea: FC<TextareaProps> = ({
  name,
  placeholder,
  value,
  disabled,
  class: className,
  id,
  rows = 3,
  required,
}) => {
  return (
    <textarea
      name={name}
      id={id}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      required={required}
      data-slot="textarea"
      class={cn(
        'flex min-h-16 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-base shadow-sm transition-colors',
        'placeholder:text-gray-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:border-blue-400',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'resize-none',
        className
      )}
    >
      {value}
    </textarea>
  );
};

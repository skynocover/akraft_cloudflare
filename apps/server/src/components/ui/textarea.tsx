import type { FC } from "hono/jsx";
import { cn } from "../../lib/utils";

interface TextareaProps {
  name?: string;
  placeholder?: string;
  class?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export const Textarea: FC<TextareaProps> = ({
  name,
  placeholder,
  class: className,
  value,
  required,
  disabled,
  rows,
}) => {
  return (
    <textarea
      name={name}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      class={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {value}
    </textarea>
  );
};

export default Textarea;

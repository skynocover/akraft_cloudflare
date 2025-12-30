import type { FC } from "hono/jsx";
import { cn } from "../../lib/utils";

interface InputProps {
  type?: string;
  name?: string;
  placeholder?: string;
  class?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
}

export const Input: FC<InputProps> = ({
  type = "text",
  name,
  placeholder,
  class: className,
  value,
  required,
  disabled,
  accept,
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      required={required}
      disabled={disabled}
      accept={accept}
      class={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
};

export default Input;

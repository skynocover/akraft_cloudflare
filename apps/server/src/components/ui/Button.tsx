import type { FC, PropsWithChildren } from 'hono/jsx';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-blue-500 text-white shadow-sm hover:bg-blue-600',
        destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
        outline: 'border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:text-gray-900',
        secondary: 'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        link: 'text-blue-500 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md gap-1.5 px-3',
        lg: 'h-10 rounded-md px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  type?: 'button' | 'submit' | 'reset';
  class?: string;
  disabled?: boolean;
  title?: string;
}

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  type = 'button',
  variant,
  size,
  class: className,
  disabled,
  title,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      title={title}
      data-slot="button"
      class={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
    </button>
  );
};

export { buttonVariants };

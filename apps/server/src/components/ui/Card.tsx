import type { FC, PropsWithChildren } from 'hono/jsx';
import { cn } from '../../lib/utils';

interface CardProps {
  id?: string;
  class?: string;
}

export const Card: FC<PropsWithChildren<CardProps>> = ({ children, id, class: className }) => {
  return (
    <div
      id={id}
      data-slot="card"
      class={cn(
        'bg-white text-gray-900 flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: FC<PropsWithChildren<{ class?: string }>> = ({ children, class: className }) => {
  return (
    <div
      data-slot="card-header"
      class={cn(
        'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardTitle: FC<PropsWithChildren<{ class?: string; title?: string }>> = ({
  children,
  class: className,
  title,
}) => {
  return (
    <div
      data-slot="card-title"
      class={cn('leading-none font-semibold', className)}
      title={title}
    >
      {children}
    </div>
  );
};

export const CardDescription: FC<PropsWithChildren<{ class?: string }>> = ({ children, class: className }) => {
  return (
    <div
      data-slot="card-description"
      class={cn('text-gray-500 text-sm', className)}
    >
      {children}
    </div>
  );
};

export const CardContent: FC<PropsWithChildren<{ class?: string }>> = ({ children, class: className }) => {
  return (
    <div data-slot="card-content" class={cn('px-6', className)}>
      {children}
    </div>
  );
};

export const CardFooter: FC<PropsWithChildren<{ class?: string }>> = ({ children, class: className }) => {
  return (
    <div
      data-slot="card-footer"
      class={cn('flex items-center px-6', className)}
    >
      {children}
    </div>
  );
};

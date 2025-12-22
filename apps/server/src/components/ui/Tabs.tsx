import type { FC, PropsWithChildren } from 'hono/jsx';
import { cn } from '../../lib/utils';

interface TabsProps {
  defaultValue?: string;
  class?: string;
  id?: string;
}

export const Tabs: FC<PropsWithChildren<TabsProps>> = ({
  children,
  defaultValue,
  class: className,
  id,
}) => {
  return (
    <div
      id={id}
      data-slot="tabs"
      data-default-value={defaultValue}
      class={cn('flex flex-col gap-2', className)}
    >
      {children}
    </div>
  );
};

interface TabsListProps {
  class?: string;
}

export const TabsList: FC<PropsWithChildren<TabsListProps>> = ({
  children,
  class: className,
}) => {
  return (
    <div
      data-slot="tabs-list"
      class={cn(
        'bg-gray-100 text-gray-500 inline-flex h-9 w-fit items-center justify-center rounded-lg p-1',
        className
      )}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  class?: string;
  disabled?: boolean;
}

export const TabsTrigger: FC<PropsWithChildren<TabsTriggerProps>> = ({
  children,
  value,
  class: className,
  disabled,
}) => {
  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-value={value}
      disabled={disabled}
      class={cn(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
        'hover:text-gray-900',
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  class?: string;
}

export const TabsContent: FC<PropsWithChildren<TabsContentProps>> = ({
  children,
  value,
  class: className,
}) => {
  return (
    <div
      data-slot="tabs-content"
      data-value={value}
      class={cn('flex-1 outline-none', className)}
    >
      {children}
    </div>
  );
};

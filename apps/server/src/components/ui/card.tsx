import type { FC, PropsWithChildren } from "hono/jsx";
import { cn } from "../../lib/utils";

interface CardProps {
  class?: string;
  id?: string;
}

export const Card: FC<PropsWithChildren<CardProps>> = ({ children, class: className, id }) => {
  return (
    <div id={id} class={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      {children}
    </div>
  );
};

export const CardHeader: FC<PropsWithChildren<CardProps>> = ({ children, class: className }) => {
  return (
    <div class={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
};

export const CardTitle: FC<PropsWithChildren<CardProps>> = ({ children, class: className }) => {
  return (
    <h3 class={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
};

export const CardDescription: FC<PropsWithChildren<CardProps>> = ({ children, class: className }) => {
  return (
    <p class={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
};

export const CardContent: FC<PropsWithChildren<CardProps>> = ({ children, class: className }) => {
  return (
    <div class={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
};

export const CardFooter: FC<PropsWithChildren<CardProps>> = ({ children, class: className }) => {
  return (
    <div class={cn("flex items-center p-6 pt-0", className)}>
      {children}
    </div>
  );
};

export default Card;

import type { FC } from "hono/jsx";
import { cn } from "../../lib/utils";

interface SeparatorProps {
  class?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

export const Separator: FC<SeparatorProps> = ({
  class: className,
  orientation = "horizontal",
  decorative = true,
}) => {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      class={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
    />
  );
};

export default Separator;

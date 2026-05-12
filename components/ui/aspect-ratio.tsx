import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type AspectRatioProps = Omit<ComponentProps<"div">, "ref"> & {
  ratio?: number;
};

export function AspectRatio({
  ratio = 1,
  className,
  children,
  style,
  ...props
}: AspectRatioProps) {
  return (
    <div
      {...props}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: ratio, ...style }}
    >
      {children}
    </div>
  );
}

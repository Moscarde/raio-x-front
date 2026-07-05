import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ContentGridProps = {
  className?: string;
  children: ReactNode;
};

export function ContentGrid({ className, children }: ContentGridProps) {
  return <div className={cn("grid gap-3.5", className)}>{children}</div>;
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DashboardCardProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Shell compartilhado pelos cards de conteúdo do dashboard e pelo
 * skeleton em loading.tsx — mudar padding/radius/borda aqui não deixa os
 * dois lugares dessincronizarem.
 */
export function DashboardCard({ className, children }: DashboardCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

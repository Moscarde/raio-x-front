import type { ReactNode } from "react";

export type DashboardHeaderProps = {
  kicker: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function DashboardHeader({
  kicker,
  title,
  subtitle,
  actions,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10.5px] font-medium tracking-wide text-text-secondary uppercase">
          {kicker}
        </span>
        <div className="flex items-baseline gap-2.5">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {title}
          </h1>
          {subtitle ? (
            <span className="text-[13px] font-medium text-text-secondary">
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex items-center gap-2.5">{actions}</div>
      ) : null}
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type KpiTrend = "positivo" | "negativo" | "atencao" | "neutro";

const TREND_COLOR: Record<KpiTrend, string> = {
  positivo: "text-success",
  negativo: "text-danger",
  atencao: "text-warning-text",
  neutro: "text-text-secondary",
};

export type KpiCardProps = {
  label: string;
  value: string;
  trendLabel?: string;
  trend?: KpiTrend;
};

export function KpiCard({
  label,
  value,
  trendLabel,
  trend = "neutro",
}: KpiCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
      <span className="font-mono text-[10px] font-medium tracking-wide text-text-secondary uppercase">
        {label}
      </span>
      <span className="font-display text-2xl font-bold text-text-primary">
        {value}
      </span>
      {trendLabel ? (
        <span className={cn("text-[11px] font-medium", TREND_COLOR[trend])}>
          {trendLabel}
        </span>
      ) : null}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-2.5 w-28" />
    </div>
  );
}

export type KpiCardPendenteProps = {
  label: string;
  nota: string;
};

/**
 * Para indicadores que o design prevê mas a camada de dados ainda não
 * expõe (ex.: cobertura APS, equipes ESF) — ver notes/backlog.md. Borda
 * tracejada distingue visualmente de um KpiCard com dado real.
 */
export function KpiCardPendente({ label, nota }: KpiCardPendenteProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-dashed border-border bg-card p-4">
      <span className="font-mono text-[10px] font-medium tracking-wide text-text-secondary uppercase">
        {label}
      </span>
      <span className="text-sm font-medium text-text-tertiary">
        Dado pendente
      </span>
      <span className="text-[11px] text-text-secondary">{nota}</span>
    </div>
  );
}

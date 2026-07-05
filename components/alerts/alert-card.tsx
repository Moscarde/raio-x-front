import { cn } from "@/lib/utils";
import type { AlertaPrioritario } from "@/types/alerta";

const SEVERITY_CONTAINER: Record<AlertaPrioritario["severidade"], string> = {
  critico: "border-danger-border bg-danger-surface",
  atencao: "border-warning-border bg-warning-surface",
};

const SEVERITY_DOT: Record<AlertaPrioritario["severidade"], string> = {
  critico: "bg-danger",
  atencao: "bg-warning",
};

export function AlertCard({ titulo, descricao, severidade }: AlertaPrioritario) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-lg border p-3",
        SEVERITY_CONTAINER[severidade],
      )}
    >
      <span
        className={cn(
          "mt-1 size-2 shrink-0 rounded-full",
          SEVERITY_DOT[severidade],
        )}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-text-primary">
          {titulo}
        </span>
        <span className="text-[11px] text-text-secondary">{descricao}</span>
      </div>
    </div>
  );
}

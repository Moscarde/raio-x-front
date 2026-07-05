import type { AlertaPrioritario } from "@/types/alerta";
import { AlertCard } from "@/components/alerts/alert-card";

export type AlertListProps = {
  alertas: AlertaPrioritario[];
  emptyMessage?: string;
};

export function AlertList({
  alertas,
  emptyMessage = "Nenhum alerta no período selecionado.",
}: AlertListProps) {
  if (alertas.length === 0) {
    return <p className="text-xs text-text-secondary">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {alertas.map((alerta) => (
        <AlertCard key={alerta.id} {...alerta} />
      ))}
    </div>
  );
}

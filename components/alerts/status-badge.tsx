import { cn } from "@/lib/utils";

export type StatusSeverity = "sucesso" | "atencao" | "critico";

const STATUS_STYLE: Record<StatusSeverity, string> = {
  sucesso: "bg-success-bg text-success",
  atencao: "bg-warning-bg text-warning-text",
  critico: "bg-danger-bg text-danger",
};

const STATUS_DOT: Record<StatusSeverity, string> = {
  sucesso: "bg-success",
  atencao: "bg-warning",
  critico: "bg-danger",
};

export type StatusBadgeProps = {
  status: StatusSeverity;
  label: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap",
        STATUS_STYLE[status],
      )}
    >
      <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
      {label}
    </span>
  );
}

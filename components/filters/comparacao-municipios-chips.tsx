"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/formatters/number-format";
import type { MunicipioComparacaoRj } from "@/types/comparacao-municipio";

export type ComparacaoMunicipiosChipsProps = {
  todos: MunicipioComparacaoRj[];
  alvoId: number;
  paresIds: number[];
  extraIds: number[];
  criterio: string;
};

export function ComparacaoMunicipiosChips({
  todos,
  alvoId,
  paresIds,
  extraIds,
  criterio,
}: ComparacaoMunicipiosChipsProps) {
  const router = useRouter();
  const porId = new Map(todos.map((m) => [m.municipioId, m]));
  const disponiveis = todos.filter(
    (m) =>
      m.municipioId !== alvoId &&
      !paresIds.includes(m.municipioId) &&
      !extraIds.includes(m.municipioId),
  );

  function navegarComExtras(novosExtraIds: number[]): void {
    const params = new URLSearchParams({
      municipioId: String(alvoId),
      criterio,
    });
    if (novosExtraIds.length > 0) {
      params.set("extra", novosExtraIds.join(","));
    }
    router.push(`/comparador?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {renderChipMunicipio(porId.get(alvoId), "principal")}
      {paresIds.map((id) => renderChipMunicipio(porId.get(id), "par"))}
      {extraIds.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => navegarComExtras(extraIds.filter((extraId) => extraId !== id))}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-text-primary"
        >
          {porId.get(id)?.nomeMunicipio ?? id}
          <span aria-hidden>✕</span>
        </button>
      ))}
      {disponiveis.length > 0 ? (
        <Select
          value=""
          onValueChange={(value) => navegarComExtras([...extraIds, Number(value)])}
        >
          <SelectTrigger size="sm">
            <SelectValue>
              {(value: string) =>
                value ? porId.get(Number(value))?.nomeMunicipio : "+ Adicionar município"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {disponiveis.map((municipio) => (
              <SelectItem key={municipio.municipioId} value={String(municipio.municipioId)}>
                {municipio.nomeMunicipio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}

function renderChipMunicipio(
  municipio: MunicipioComparacaoRj | undefined,
  tipo: "principal" | "par",
) {
  if (!municipio) {
    return null;
  }
  const estilo =
    tipo === "principal"
      ? "bg-brand-primary text-white"
      : "border border-border bg-card text-text-secondary";

  return (
    <span
      key={municipio.municipioId}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${estilo}`}
    >
      {municipio.nomeMunicipio}
      <span className="opacity-70">{formatNumber(municipio.populacaoEstimada)} hab.</span>
    </span>
  );
}

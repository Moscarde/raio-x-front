"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MunicipioComparacaoRj } from "@/types/comparacao-municipio";

export type MunicipioComparadorSelectProps = {
  municipios: MunicipioComparacaoRj[];
  municipioSelecionadoId: number;
  criterio: string;
};

export function MunicipioComparadorSelect({
  municipios,
  municipioSelecionadoId,
  criterio,
}: MunicipioComparadorSelectProps) {
  const router = useRouter();

  return (
    <Select
      value={String(municipioSelecionadoId)}
      onValueChange={(value) =>
        router.push(`/comparador?municipioId=${value}&criterio=${criterio}`)
      }
    >
      <SelectTrigger>
        <SelectValue>
          {(value: string) => {
            const municipio = municipios.find(
              (item) => String(item.municipioId) === value,
            );
            return municipio ? municipio.nomeMunicipio : value;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {municipios.map((municipio) => (
          <SelectItem
            key={municipio.municipioId}
            value={String(municipio.municipioId)}
          >
            {municipio.nomeMunicipio}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

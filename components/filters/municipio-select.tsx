"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MunicipioResumo } from "@/types/municipio";

export type MunicipioSelectProps = {
  municipios: MunicipioResumo[];
  municipioSelecionadoId: number;
};

export function MunicipioSelect({
  municipios,
  municipioSelecionadoId,
}: MunicipioSelectProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select
      value={String(municipioSelecionadoId)}
      onValueChange={(value) =>
        router.push(
          pathname.replace(
            /\/municipios\/\d{6,7}(?=\/|$)/,
            `/municipios/${value}`,
          ),
        )
      }
    >
      <SelectTrigger>
        <SelectValue>
          {(value: string) => {
            const municipio = municipios.find(
              (item) => String(item.municipioId) === value,
            );
            return municipio
              ? `${municipio.nomeMunicipio} · ${municipio.siglaUf}`
              : value;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {municipios.map((municipio) => (
          <SelectItem
            key={municipio.municipioId}
            value={String(municipio.municipioId)}
          >
            {municipio.nomeMunicipio} · {municipio.siglaUf}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CriterioPareamento } from "@/types/comparacao-municipio";

const ROTULO_CRITERIO: Record<CriterioPareamento, string> = {
  populacao: "População mais próxima",
  porte_rede: "Porte de rede mais próximo",
  regiao: "Mesma região (microrregião)",
};

export type CriterioPareamentoSelectProps = {
  municipioId: number;
  criterioSelecionado: CriterioPareamento;
};

export function CriterioPareamentoSelect({
  municipioId,
  criterioSelecionado,
}: CriterioPareamentoSelectProps) {
  const router = useRouter();

  return (
    <Select
      value={criterioSelecionado}
      onValueChange={(value) =>
        router.push(`/comparador?municipioId=${municipioId}&criterio=${value}`)
      }
    >
      <SelectTrigger>
        <SelectValue>
          {(value: string) => ROTULO_CRITERIO[value as CriterioPareamento] ?? value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(ROTULO_CRITERIO) as CriterioPareamento[]).map((criterio) => (
          <SelectItem key={criterio} value={criterio}>
            {ROTULO_CRITERIO[criterio]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

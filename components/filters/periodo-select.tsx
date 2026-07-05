"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PeriodoOpcao = {
  value: string;
  label: string;
};

export type PeriodoSelectProps = {
  opcoes: PeriodoOpcao[];
  valorSelecionado: string;
};

/**
 * Hoje só existe 1 período real carregado (2025 completo, SIA) — o select
 * fica desabilitado em vez de simular escolha entre anos que ainda não
 * existem na camada de dados.
 */
export function PeriodoSelect({ opcoes, valorSelecionado }: PeriodoSelectProps) {
  return (
    <Select value={valorSelecionado} disabled={opcoes.length <= 1}>
      <SelectTrigger>
        <SelectValue>
          {(value: string) =>
            opcoes.find((opcao) => opcao.value === value)?.label ?? value
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {opcoes.map((opcao) => (
          <SelectItem key={opcao.value} value={opcao.value}>
            {opcao.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

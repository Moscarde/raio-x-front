"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { ProducaoMensalPoint } from "@/types/producao-ambulatorial";
import { formatNumber } from "@/lib/formatters/number-format";

export type ProducaoMensalChartProps = {
  pontos: ProducaoMensalPoint[];
};

/**
 * Regra visual de destaque de anomalia (design-system.md): um mês "abaixo
 * da média" é um que fica sob 85% da média do período exibido. É uma regra
 * estatística de apresentação do gráfico, não uma classificação de dado —
 * exportada para outras telas que venham a mostrar a mesma série (ex.:
 * a futura página de Produção, ver reference/paginas.md) reusarem o mesmo
 * limiar em vez de inventar um novo.
 */
export const LIMIAR_ABAIXO_MEDIA = 0.85;

export function ProducaoMensalChart({ pontos }: ProducaoMensalChartProps) {
  if (pontos.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Produção ambulatorial ainda não disponível para este município.
      </p>
    );
  }

  const media = pontos[0].media12m;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-3.5 text-[11px] text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-xs bg-brand-secondary" />
          Realizado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-xs bg-warning" />
          Abaixo da média
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-2.5 bg-brand-accent" />
          Média do período
        </span>
      </div>

      <div className="h-[180px]" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pontos} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border-hairline)" />
            <XAxis
              dataKey="competenciaLabel"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }}
            />
            <ReferenceLine
              y={media}
              stroke="var(--color-brand-accent)"
              strokeDasharray="4 3"
              strokeOpacity={0.7}
            />
            <Tooltip
              cursor={{ fill: "var(--color-surface)" }}
              formatter={(value) => formatNumber(Number(value))}
              contentStyle={{
                borderRadius: 8,
                borderColor: "var(--color-border)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="quantidadeAprovada" radius={[4, 4, 0, 0]}>
              {pontos.map((ponto) => (
                <Cell
                  key={ponto.competencia}
                  fill={
                    ponto.quantidadeAprovada < ponto.media12m * LIMIAR_ABAIXO_MEDIA
                      ? "var(--color-warning)"
                      : "var(--color-brand-secondary)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

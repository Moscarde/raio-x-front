import { describe, expect, it } from "vitest";
import {
  mapRowToIndicadorIcsap,
  mapRowToResumoInternacoes,
} from "../../lib/queries/internacoes";

describe("mapRowToResumoInternacoes", () => {
  it("converte total e permanência média para número", () => {
    const resumo = mapRowToResumoInternacoes({
      total: "3152",
      permanencia_media: "4.1",
    });

    expect(resumo).toEqual({ total: 3152, permanenciaMediaDias: 4.1 });
  });

  it("preserva permanência média nula quando não há internações", () => {
    const resumo = mapRowToResumoInternacoes({
      total: "0",
      permanencia_media: null,
    });

    expect(resumo).toEqual({ total: 0, permanenciaMediaDias: null });
  });
});

describe("mapRowToIndicadorIcsap", () => {
  it("converte totais e percentual (numeric como string) para número", () => {
    const indicador = mapRowToIndicadorIcsap({
      ano: 2025,
      total_internacoes: "27809",
      total_internacoes_icsap: "3353",
      percentual_icsap: "12.1",
    });

    expect(indicador).toEqual({
      ano: 2025,
      totalInternacoes: 27809,
      totalInternacoesIcsap: 3353,
      percentualIcsap: 12.1,
    });
  });
});

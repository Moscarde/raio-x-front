import { describe, expect, it } from "vitest";
import { mapRowToResumoInternacoes } from "../../lib/queries/internacoes";

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

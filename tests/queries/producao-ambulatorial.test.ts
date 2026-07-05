import { describe, expect, it } from "vitest";
import { mapRowsToProducaoMensal } from "../../lib/queries/producao-ambulatorial";

describe("mapRowsToProducaoMensal", () => {
  it("formata a competência e calcula a média do período retornado", () => {
    const pontos = mapRowsToProducaoMensal([
      { competencia_arquivo: "202501", quantidade_aprovada: "100" },
      { competencia_arquivo: "202502", quantidade_aprovada: "200" },
    ]);

    expect(pontos).toEqual([
      {
        competencia: "202501",
        competenciaLabel: "jan/2025",
        quantidadeAprovada: 100,
        media12m: 150,
      },
      {
        competencia: "202502",
        competenciaLabel: "fev/2025",
        quantidadeAprovada: 200,
        media12m: 150,
      },
    ]);
  });

  it("retorna lista vazia sem dividir por zero", () => {
    expect(mapRowsToProducaoMensal([])).toEqual([]);
  });

  it("descarta uma linha com competência malformada em vez de lançar exceção", () => {
    const avisoOriginal = console.warn;
    console.warn = () => {};

    const pontos = mapRowsToProducaoMensal([
      { competencia_arquivo: "202501", quantidade_aprovada: "100" },
      { competencia_arquivo: "não-é-competência", quantidade_aprovada: "999" },
      { competencia_arquivo: "202502", quantidade_aprovada: "200" },
    ]);

    console.warn = avisoOriginal;

    expect(pontos.map((ponto) => ponto.competencia)).toEqual([
      "202501",
      "202502",
    ]);
    expect(pontos[0].media12m).toBe(150);
  });
});

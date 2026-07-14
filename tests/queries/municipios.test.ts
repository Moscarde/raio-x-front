import { describe, expect, it } from "vitest";
import {
  mapRowToMunicipioRjResumo,
  mapRowToMunicipioResumo,
} from "../../lib/queries/municipios";

describe("mapRowToMunicipioResumo", () => {
  it("mapeia colunas snake_case do Postgres para o tipo de domínio", () => {
    const resumo = mapRowToMunicipioResumo({
      id_municipio: 3303807,
      nome_municipio: "Paraty",
      sigla_uf: "RJ",
      nome_microrregiao: "Baía da Ilha Grande",
      nome_mesorregiao: "Sul Fluminense",
      nome_regiao: "Sudeste",
    });

    expect(resumo).toEqual({
      municipioId: 3303807,
      nomeMunicipio: "Paraty",
      siglaUf: "RJ",
      nomeMicrorregiao: "Baía da Ilha Grande",
      nomeMesorregiao: "Sul Fluminense",
      nomeRegiao: "Sudeste",
    });
  });
});

describe("mapRowToMunicipioRjResumo", () => {
  it("inclui a população estimada convertida de numeric", () => {
    const resumo = mapRowToMunicipioRjResumo({
      id_municipio: 3304557,
      nome_municipio: "Rio de Janeiro",
      sigla_uf: "RJ",
      nome_microrregiao: "Rio de Janeiro",
      nome_mesorregiao: "Metropolitana do Rio de Janeiro",
      nome_regiao: "Sudeste",
      populacao_estimada: "6211223",
    });

    expect(resumo.populacaoEstimada).toBe(6211223);
  });
});

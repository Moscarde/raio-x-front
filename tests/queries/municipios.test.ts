import { describe, expect, it } from "vitest";
import { mapRowToMunicipioResumo } from "../../lib/queries/municipios";

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

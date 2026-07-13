import { describe, expect, it } from "vitest";
import {
  mapRowToQualidadeCnes,
  mapRowToQualidadeSia,
  mapRowToQualidadeSih,
  mapRowToQualidadeSisab,
} from "../../lib/queries/qualidade-dados";

describe("mapRowToQualidadeCnes", () => {
  it("mapeia contagens e campos críticos nulos", () => {
    const fonte = mapRowToQualidadeCnes({
      total: "18828",
      municipios: "3",
      sem_tipo: "214",
      sem_natureza: "5463",
    });

    expect(fonte.fonte).toBe("CNES");
    expect(fonte.totalRegistros).toBe(18828);
    expect(fonte.totalRegistrosAproximado).toBe(false);
    expect(fonte.camposCriticosNulos).toEqual([
      { campo: "descricao_tipo_unidade", total: 214 },
      { campo: "descricao_natureza_juridica", total: 5463 },
    ]);
  });
});

describe("mapRowToQualidadeSih", () => {
  it("mapeia contagem e municípios cobertos", () => {
    const fonte = mapRowToQualidadeSih({ total: "389923", municipios: "3" });
    expect(fonte).toEqual({
      fonte: "SIH",
      totalRegistros: 389923,
      totalRegistrosAproximado: false,
      municipiosCobertos: 3,
      periodoReferencia: "2025 completo (12 competências)",
    });
  });
});

describe("mapRowToQualidadeSisab", () => {
  it("mapeia contagem e municípios cobertos", () => {
    const fonte = mapRowToQualidadeSisab({ total: "54", municipios: "3" });
    expect(fonte.totalRegistros).toBe(54);
    expect(fonte.municipiosCobertos).toBe(3);
  });
});

describe("mapRowToQualidadeSia", () => {
  it("marca o total pré-agregado como contagem exata", () => {
    const fonte = mapRowToQualidadeSia({ total: "91742704" });
    expect(fonte.totalRegistrosAproximado).toBe(false);
    expect(fonte.totalRegistros).toBe(91742704);
  });
});

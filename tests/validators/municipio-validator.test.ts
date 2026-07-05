import { describe, expect, it } from "vitest";
import { parseMunicipioId } from "../../lib/validators/municipio-validator";

describe("parseMunicipioId", () => {
  it("aceita código IBGE de 7 dígitos e retorna número", () => {
    expect(parseMunicipioId("3303807")).toBe(3303807);
  });

  it("rejeita valores com formato errado", () => {
    expect(() => parseMunicipioId("330380")).toThrow(/municipioId inválido/);
    expect(() => parseMunicipioId("abcdefg")).toThrow(/municipioId inválido/);
    expect(() => parseMunicipioId("")).toThrow(/municipioId inválido/);
  });
});

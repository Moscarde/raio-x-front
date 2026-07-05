import { describe, expect, it } from "vitest";
import { formatCompetencia } from "../../lib/formatters/competencia-format";

describe("formatCompetencia", () => {
  it("formata AAAAMM para mmm/AAAA", () => {
    expect(formatCompetencia("202501")).toBe("jan/2025");
    expect(formatCompetencia("202512")).toBe("dez/2025");
  });

  it("rejeita formato inválido", () => {
    expect(() => formatCompetencia("2025-01")).toThrow(/Competência inválida/);
    expect(() => formatCompetencia("202513")).toThrow(/Competência inválida/);
  });
});

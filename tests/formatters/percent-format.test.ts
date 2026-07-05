import { describe, expect, it } from "vitest";
import { formatPercent } from "../../lib/formatters/percent-format";

describe("formatPercent", () => {
  it("formata com 1 casa decimal por padrão", () => {
    expect(formatPercent(87.4)).toBe("87,4%");
  });

  it("aceita número de casas decimais customizado", () => {
    expect(formatPercent(87, 0)).toBe("87%");
  });
});

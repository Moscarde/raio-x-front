import { describe, expect, it } from "vitest";
import { formatNumber } from "../../lib/formatters/number-format";

describe("formatNumber", () => {
  it("formata milhar com separador pt-BR", () => {
    expect(formatNumber(21340)).toBe("21.340");
  });
});

import { describe, expect, it } from "vitest";
import { formatCurrency } from "../../lib/formatters/currency-format";

describe("formatCurrency", () => {
  it("formata valor em reais sem casas decimais", () => {
    expect(formatCurrency(3143570.61)).toBe("R$ 3.143.571");
  });
});

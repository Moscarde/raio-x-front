export function formatPercent(value: number, fractionDigits = 1): string {
  const numero = value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return `${numero}%`;
}

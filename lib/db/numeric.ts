/**
 * Colunas NUMERIC/BIGINT do Postgres chegam como string via node-postgres
 * (evita perda de precisão) — este par centraliza a conversão para número,
 * usada por todo lib/queries/*.
 */
export function parseNumericColumn(value: string): number {
  return Number(value);
}

export function parseNullableNumericColumn(value: string | null): number | null {
  return value === null ? null : Number(value);
}

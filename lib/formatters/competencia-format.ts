const MESES_ABREVIADOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/**
 * Formata competência no formato "AAAAMM" usado pelas fontes DATASUS/SISAB
 * (ex.: fct_producao_ambulatorial.competencia_arquivo = "202501").
 */
export function formatCompetencia(competencia: string): string {
  const ano = competencia.slice(0, 4);
  const mes = competencia.slice(4, 6);
  const mesAbreviado = MESES_ABREVIADOS[Number(mes) - 1];

  if (!/^\d{6}$/.test(competencia) || !mesAbreviado) {
    throw new Error(
      `Competência inválida: "${competencia}". Esperado formato "AAAAMM".`,
    );
  }

  return `${mesAbreviado}/${ano}`;
}

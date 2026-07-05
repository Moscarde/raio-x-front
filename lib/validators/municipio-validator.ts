export function parseMunicipioId(value: string): number {
  if (!/^\d{7}$/.test(value)) {
    throw new Error(
      `municipioId inválido: "${value}". Esperado código IBGE de 7 dígitos.`,
    );
  }

  return Number(value);
}

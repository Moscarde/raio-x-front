import "server-only";
import { Pool, type QueryResultRow } from "pg";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente ausente: "${name}". Configure-a em .env.local (ver .env.example).`,
    );
  }
  return value;
}

function getOptionalNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error(
      `Variável de ambiente inválida: "${name}"="${value}". Esperado número positivo.`,
    );
  }

  return parsedValue;
}

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: requireEnv("POSTGRES_HOST"),
      port: Number(process.env.POSTGRES_PORT ?? "5432"),
      database: requireEnv("POSTGRES_DB"),
      user: requireEnv("POSTGRES_USER"),
      password: requireEnv("POSTGRES_PASSWORD"),
      max: 5,
      connectionTimeoutMillis: getOptionalNumberEnv(
        "POSTGRES_CONNECTION_TIMEOUT_MS",
        5000,
      ),
      query_timeout: getOptionalNumberEnv("POSTGRES_QUERY_TIMEOUT_MS", 15000),
      statement_timeout: getOptionalNumberEnv(
        "POSTGRES_STATEMENT_TIMEOUT_MS",
        15000,
      ),
    });
  }
  return pool;
}

export async function query<Row extends QueryResultRow>(
  text: string,
  params: ReadonlyArray<string | number | null> = [],
): Promise<Row[]> {
  const result = await getPool().query<Row>(text, params as (string | number | null)[]);
  return result.rows;
}

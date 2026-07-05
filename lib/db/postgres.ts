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

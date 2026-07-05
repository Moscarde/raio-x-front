import Link from "next/link";
import { QualidadeFontesTable } from "@/components/tables/qualidade-fontes-table";
import { formatNumber } from "@/lib/formatters/number-format";
import { getQualidadeDados } from "@/lib/queries/qualidade-dados";

export default async function QualidadeDadosPage() {
  const fontes = await getQualidadeDados();
  const cnes = fontes.find((fonte) => fonte.fonte === "CNES");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 bg-background px-6 py-12">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10.5px] font-medium tracking-wide text-text-secondary uppercase">
          Qualidade e cobertura dos dados
        </span>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          O que está carregado hoje
        </h1>
        <p className="text-sm text-text-secondary">
          Contagens reais consultadas em <code>marts.*</code> — ver{" "}
          <Link href="/documentacao" className="font-semibold text-brand-primary">
            metodologia e limitações
          </Link>{" "}
          por indicador.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
        <span className="text-sm font-semibold text-text-primary">
          Fontes carregadas
        </span>
        <QualidadeFontesTable fontes={fontes} />
        <p className="text-[11px] text-text-secondary">
          &ldquo;≈&rdquo; indica estimativa via estatísticas do Postgres
          (<code>pg_class.reltuples</code>), usada só para a fonte SIA — a
          tabela tem 99,9M+ linhas e um <code>count(*)</code> exato mede
          ~58s. As demais fontes mostram contagem exata.
        </p>
      </div>

      {cnes?.camposCriticosNulos ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <span className="text-sm font-semibold text-text-primary">
            Campos críticos nulos — CNES
          </span>
          <div className="flex flex-col gap-2">
            {cnes.camposCriticosNulos.map((campo) => (
              <div
                key={campo.campo}
                className="flex items-center justify-between text-[12.5px] text-text-primary"
              >
                <span className="font-mono text-xs">{campo.campo}</span>
                <span className="font-display font-semibold">
                  {formatNumber(campo.total)} de{" "}
                  {formatNumber(cnes.totalRegistros)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-text-secondary">
            Nulo aqui significa que o código de origem (CNES) não tem seed
            de-para confirmado ainda, não que o dado esteja ausente na
            fonte — ver <code>ROADMAP_DBT.md</code> do raio-x-engenharia
            para a cobertura exata de cada seed.
          </p>
        </div>
      ) : null}

      <Link
        href="/"
        className="self-start text-xs font-semibold text-brand-primary"
      >
        ← Voltar para a Visão Geral
      </Link>
    </div>
  );
}

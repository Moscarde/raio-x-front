import Link from "next/link";
import { MunicipioSelect } from "@/components/filters/municipio-select";
import { formatNumber } from "@/lib/formatters/number-format";
import { getMunicipiosRjPorPopulacao } from "@/lib/queries/municipios";

export default async function Home() {
  const municipios = await getMunicipiosRjPorPopulacao();
  const municipiosPrincipais = municipios.slice(0, 5);
  const municipioSelecionado = municipios[0];

  return (
    <div className="flex min-h-full flex-col items-center gap-10 bg-background px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="font-display text-2xl font-bold text-brand-primary">
          Radar<span className="text-brand-accent">SUS</span>{" "}
          <span className="font-mono text-xs font-medium tracking-wide text-text-secondary uppercase">
            Municipal
          </span>
        </span>
        <p className="max-w-md text-sm text-text-secondary">
          Escolha um dos municípios em destaque ou selecione outro para ver o
          Raio-X municipal.
        </p>
      </div>

      {municipioSelecionado ? (
        <div className="flex w-full max-w-sm flex-col gap-2">
          <span className="font-mono text-[10.5px] font-semibold tracking-wide text-text-secondary uppercase">
            Todos os {municipios.length} municípios do Rio de Janeiro
          </span>
          <MunicipioSelect
            municipios={municipios}
            municipioSelecionadoId={municipioSelecionado.municipioId}
          />
        </div>
      ) : null}

      <div className="grid w-full max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {municipiosPrincipais.map((municipio) => (
          <Link
            key={municipio.municipioId}
            href={`/municipios/${municipio.municipioId}`}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand-primary"
          >
            <span className="font-display text-lg font-bold text-text-primary">
              {municipio.nomeMunicipio}
            </span>
            <span className="text-xs text-text-secondary">
              {municipio.siglaUf} · {municipio.nomeMicrorregiao}
            </span>
            <span className="font-mono text-[10.5px] text-text-tertiary">
              {formatNumber(municipio.populacaoEstimada)} habitantes
            </span>
          </Link>
        ))}
      </div>

      <p className="font-mono text-[10.5px] text-text-tertiary">
        DADOS REAIS · CNES · SIA · SIH · SISAB (raio-x-engenharia)
      </p>
    </div>
  );
}

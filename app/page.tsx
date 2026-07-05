import Link from "next/link";
import { getMunicipiosDisponiveis } from "@/lib/queries/municipios";

export default async function Home() {
  const municipios = await getMunicipiosDisponiveis();

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
          Escolha um município para ver o Raio-X municipal.
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {municipios.map((municipio) => (
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
          </Link>
        ))}
      </div>

      <p className="font-mono text-[10.5px] text-text-tertiary">
        DADOS REAIS · CNES · SIA · SIH · SISAB (raio-x-engenharia)
      </p>
    </div>
  );
}

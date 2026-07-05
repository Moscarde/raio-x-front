import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-background p-10 text-center">
      <span className="font-display text-lg font-bold text-brand-primary">
        Radar<span className="text-brand-accent">SUS</span>
      </span>
      <p className="text-sm font-semibold text-text-primary">
        Página não encontrada.
      </p>
      <p className="max-w-md text-xs text-text-secondary">
        Esta seção ainda não foi construída (ver ROADMAP.md) ou o endereço
        está incorreto.
      </p>
      <Link
        href="/municipios/3303807"
        className="mt-1 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
      >
        Voltar para a Visão Geral
      </Link>
    </div>
  );
}

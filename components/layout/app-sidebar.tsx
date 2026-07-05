"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AtualizacaoFonte, UsuarioSessao } from "@/types/sidebar";

type SidebarNavItem = {
  label: string;
  href: string;
  alertCount?: number;
};

function buildNavItems(municipioId: string, alertCount: number): SidebarNavItem[] {
  const base = `/municipios/${municipioId}`;
  return [
    { label: "Visão geral", href: base },
    { label: "Rede e CNES", href: `${base}/rede-cnes` },
    { label: "Atenção Primária", href: `${base}/atencao-primaria` },
    { label: "Produção", href: `${base}/producao` },
    { label: "Alertas", href: `${base}/alertas`, alertCount },
    { label: "Comparador", href: "/comparador" },
    { label: "Relatório IA", href: `${base}/relatorio` },
  ];
}

function RadarLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r="25" fill="none" stroke="#22b8cf" strokeWidth="4" />
      <circle cx="28" cy="28" r="14" fill="none" stroke="#1a7fc4" strokeWidth="3.5" />
      <circle cx="40" cy="17" r="6" fill="#22b8cf" />
    </svg>
  );
}

export type AppSidebarProps = {
  municipioId: string;
  alertCount: number;
  atualizacoes: AtualizacaoFonte[];
  usuario: UsuarioSessao;
};

export function AppSidebar({
  municipioId,
  alertCount,
  atualizacoes,
  usuario,
}: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = buildNavItems(municipioId, alertCount);

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-6 bg-sidebar px-3.5 py-5 text-sidebar-foreground">
      <div className="flex items-center gap-2 px-2">
        <RadarLogo />
        <span className="font-display text-[15px] font-bold">
          Radar<span className="text-brand-accent">SUS</span>
        </span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-2.5 rounded-r-lg border-l-[3px] px-3 py-2.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "border-sidebar-primary bg-sidebar-accent font-semibold text-sidebar-foreground"
                  : "border-transparent text-sidebar-foreground/60 hover:text-sidebar-foreground",
              )}
            >
              <span>{item.label}</span>
              {item.alertCount ? (
                <span className="rounded-full bg-danger px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                  {item.alertCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex flex-col gap-1 rounded-lg bg-white/6 p-3">
          <span className="font-mono text-[9.5px] font-medium tracking-wide text-brand-accent uppercase">
            Última atualização
          </span>
          <div className="flex flex-col text-[11.5px] text-sidebar-foreground/75">
            {atualizacoes.map((atualizacao) => (
              <span key={atualizacao.fonte}>
                {atualizacao.fonte} · {atualizacao.competencia}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 text-[10.5px] font-medium text-sidebar-foreground/55">
          <Link href="/documentacao" className="hover:text-sidebar-foreground">
            Documentação
          </Link>
          <span>·</span>
          <Link href="/qualidade-dados" className="hover:text-sidebar-foreground">
            Qualidade dos dados
          </Link>
        </div>

        <div className="flex items-center gap-2.5 px-1">
          <span className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-xs font-semibold text-white">
            {usuario.iniciais}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{usuario.nome}</span>
            <span className="text-[10px] text-sidebar-foreground/55">
              {usuario.orgao}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

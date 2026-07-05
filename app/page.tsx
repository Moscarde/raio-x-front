import { redirect } from "next/navigation";

/**
 * Sem seletor de município ainda (Fase 4 do ROADMAP) — encaminha para
 * Paraty como ponto de entrada temporário.
 */
export default function Home() {
  redirect("/municipios/3303807");
}

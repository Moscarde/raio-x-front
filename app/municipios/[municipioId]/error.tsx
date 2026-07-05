"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        event: "municipio_dashboard_query_failed",
        error: error.message,
        digest: error.digest,
      }),
    );
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-background p-10 text-center">
      <p className="text-sm font-semibold text-text-primary">
        Dados ainda não disponíveis para este município no período
        selecionado.
      </p>
      <p className="max-w-md text-xs text-text-secondary">
        Não foi possível consultar o banco de dados agora. Tente novamente
        em alguns instantes.
      </p>
      <Button variant="outline" onClick={() => unstable_retry()}>
        Tentar novamente
      </Button>
    </div>
  );
}

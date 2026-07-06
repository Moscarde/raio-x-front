import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback exibido enquanto o conteúdo da página aguarda as queries —
 * a sidebar já renderizou fora deste boundary, então só o corpo pisca.
 */
export function PageContentSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-56" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

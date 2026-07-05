import { PageShell } from "@/components/layout/page-shell";
import { ContentGrid } from "@/components/layout/content-grid";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { KpiCardSkeleton } from "@/components/cards/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";

function SidebarSkeleton() {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-6 bg-sidebar px-3.5 py-5">
      <Skeleton className="h-6.5 w-32 bg-white/10" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full bg-white/10" />
        ))}
      </div>
    </aside>
  );
}

function CardSkeleton() {
  return (
    <DashboardCard>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-32 w-full" />
    </DashboardCard>
  );
}

export default function Loading() {
  return (
    <PageShell sidebar={<SidebarSkeleton />}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-2.5 w-28" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-9 w-64" />
      </div>

      <ContentGrid className="grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </ContentGrid>

      <ContentGrid className="grid-cols-[1.5fr_1fr]">
        <CardSkeleton />
        <CardSkeleton />
      </ContentGrid>

      <ContentGrid className="grid-cols-[1fr_1.5fr]">
        <CardSkeleton />
        <CardSkeleton />
      </ContentGrid>
    </PageShell>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}

export function DashboardKpiSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Skeleton className="h-[122px] rounded-lg xl:col-span-2" />
      <Skeleton className="h-[122px] rounded-lg" />
      <Skeleton className="h-[122px] rounded-lg" />
      <Skeleton className="h-[122px] rounded-lg" />
      <Skeleton className="h-[122px] rounded-lg" />
      <Skeleton className="h-[122px] rounded-lg xl:col-span-2" />
    </section>
  );
}

export function DashboardChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-10/12" />
      </div>
      <Skeleton className="h-[190px] w-full rounded-md" />
    </div>
  );
}

export function DashboardTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

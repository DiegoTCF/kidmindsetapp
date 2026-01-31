import { Skeleton } from "@/components/ui/skeleton";

export function PlayerCardSkeleton() {
  return (
    <div className="mx-auto w-64">
      <div
        className="relative bg-gradient-to-b from-muted via-muted to-muted/80 overflow-hidden animate-pulse"
        style={{
          clipPath: 'polygon(0 8%, 50% 0, 100% 8%, 100% 92%, 50% 100%, 0 92%)',
          aspectRatio: '3/4'
        }}
      >
        <div className="absolute inset-2 bg-black/80 flex flex-col items-center justify-between py-6 px-4"
          style={{
            clipPath: 'polygon(0 8%, 50% 0, 100% 8%, 100% 92%, 50% 100%, 0 92%)'
          }}
        >
          <div className="flex items-start justify-between w-full px-2">
            <div className="space-y-2">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          
          <Skeleton className="w-24 h-24 rounded-full" />
          
          <div className="space-y-2 w-full">
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
          
          <Skeleton className="w-16 h-0.5" />
        </div>
      </div>
    </div>
  );
}

export function StatBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-8" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function PerformancePageSkeleton() {
  return (
    <div className="space-y-8">
      <PlayerCardSkeleton />
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <StatBarSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

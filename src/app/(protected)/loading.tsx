import { Skeleton } from '@/components/ui/skeleton';

export default function ProtectedLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 max-w-[70vw]" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

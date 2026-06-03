import { Skeleton } from '@/components/ui/skeleton';

const CategoryCardSkeleton = () => {
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="space-y-2">
          <Skeleton className="ml-auto h-3 w-20" />
          <Skeleton className="ml-auto h-6 w-10" />
        </div>
      </div>
    </div>
  );
};

export default CategoryCardSkeleton;

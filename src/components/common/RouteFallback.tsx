import Skeleton from '@/components/kit/Skeleton';

/** Shown while a lazily loaded page downloads; keeps the app shell in place. */
export default function RouteFallback() {
  return (
    <div role="status" aria-live="polite" className="space-y-4 p-2">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-8 w-1/3" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

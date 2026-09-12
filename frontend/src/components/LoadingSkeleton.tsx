export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-card border border-line bg-white p-4">
      <div className="mb-3 flex gap-2.5">
        <div className="h-10 w-10 rounded-[9px] bg-line" />
        <div className="flex-1">
          <div className="mb-2 h-3.5 w-3/4 rounded bg-line" />
          <div className="h-3 w-1/2 rounded bg-line" />
        </div>
      </div>
      <div className="h-3 w-1/3 rounded bg-line" />
    </div>
  );
}

export function CardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="card flex flex-col items-center py-12 text-center text-sub">
      <div className="mb-3 text-3xl">{icon}</div>
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm">{description}</p>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong. Please try again.' }: { message?: string }) {
  return (
    <div className="card flex flex-col items-center border-danger/30 bg-danger-bg py-10 text-center text-danger">
      <div className="mb-2 text-2xl">⚠️</div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

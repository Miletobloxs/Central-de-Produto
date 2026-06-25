export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
  );
}

export default function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-5xl animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <SkeletonBox className="w-9 h-9 rounded-xl shrink-0" />
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-40" />
          <SkeletonBox className="h-3 w-56" />
        </div>
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <SkeletonBox className="h-3 w-24" />
            <SkeletonBox className="h-7 w-16" />
            <SkeletonBox className="h-2 w-full" />
          </div>
        ))}
      </div>

      {/* Content rows */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
            <SkeletonBox className="w-8 h-8 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBox className="h-3 w-1/3" />
              <SkeletonBox className="h-2 w-1/2" />
            </div>
            <SkeletonBox className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

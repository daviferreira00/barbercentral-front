// Placeholders de carregamento com efeito shimmer

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
      ))}
    </div>
  )
}

export function SkeletonKpis({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton-shimmer h-20 rounded-[20px] ${i === 0 ? "col-span-2" : ""}`} />
      ))}
    </div>
  )
}

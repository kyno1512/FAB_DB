export default function StatCards({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-[14px] bg-white p-5 shadow-sm">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="mt-3 h-8 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((card) => (
        <div key={card.label} className="rounded-[14px] bg-white p-5 shadow-sm">
          <span className="text-[0.82rem] text-gray-500">{card.label}</span>
          <div className="mt-2 flex items-baseline gap-2.5">
            <strong className="text-[1.35rem] font-bold">{card.value}</strong>
            <span className={`text-sm font-semibold ${card.up ? 'text-green-500' : 'text-red-500'}`}>
              {card.trend}
            </span>
          </div>
          {card.progress != null && (
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-primary" style={{ width: `${card.progress}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

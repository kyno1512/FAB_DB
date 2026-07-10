import { bestSellers as fallbackItems } from '../../../../data/adminData'

export default function BestSellers({ items = [], loading = false }) {
  const products = items.length > 0 ? items : fallbackItems

  if (loading) {
    return (
      <div className="animate-pulse rounded-[14px] bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="size-11 rounded-[10px] bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[14px] bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold">Bán chạy nhất</h3>
      <div className="flex flex-col gap-3.5">
        {products.map((item) => (
          <div key={item.id ?? item.name} className="flex items-center gap-3">
            <img src={item.image} alt={item.name} className="size-11 rounded-[10px] object-cover" />
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[0.88rem]">{item.name}</strong>
              <span className="text-[0.78rem] text-gray-500">{item.category}</span>
            </div>
            <div className="text-right text-[0.78rem]">
              <span className="block text-gray-500">{item.sold} đã bán</span>
              <em className="font-semibold text-green-500 not-italic">{item.trend}</em>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

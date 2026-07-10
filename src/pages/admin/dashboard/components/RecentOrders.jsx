import { recentOrders as fallbackOrders } from '../../../../data/adminData'

const statusLabel = {
  done: 'HOÀN TẤT',
  processing: 'ĐANG XỬ LÝ',
  cancelled: 'ĐÃ HỦY',
}
const statusClass = {
  done: 'bg-green-100 text-green-600',
  processing: 'bg-blue-100 text-blue-600',
  cancelled: 'bg-red-100 text-red-600',
}

export default function RecentOrders({ orders = [], loading = false }) {
  const items = orders.length > 0 ? orders : fallbackOrders

  if (loading) {
    return (
      <div className="animate-pulse rounded-[14px] bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[14px] bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold">Đơn hàng gần đây</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-[0.78rem] text-gray-500">
            <th className="pb-3 pr-3 font-medium">Khách hàng</th>
            <th className="pb-3 pr-3 font-medium">Thời gian</th>
            <th className="pb-3 pr-3 font-medium">Tổng cộng</th>
            <th className="pb-3 font-medium">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {items.map((order) => (
            <tr key={order.id} className="border-b border-gray-50 last:border-0">
              <td className="py-3.5 pr-3">
                <div className="flex items-center gap-2.5 font-medium">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-full text-[0.72rem] font-bold text-white"
                    style={{ background: order.color }}
                  >
                    {order.initials}
                  </span>
                  {order.customer}
                </div>
              </td>
              <td className="py-3.5 pr-3">{order.time}</td>
              <td className="py-3.5 pr-3">{order.total}</td>
              <td className="py-3.5">
                <span
                  className={`rounded-md px-2.5 py-1 text-[0.68rem] font-bold tracking-wide ${statusClass[order.status]}`}
                >
                  {statusLabel[order.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

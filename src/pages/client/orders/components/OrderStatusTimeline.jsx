import {
  getOrderStatusDescription,
  getOrderStatusStepIndex,
  ORDER_STATUS_TIMELINE,
} from '../../../../lib/orderStatus'

export default function OrderStatusTimeline({ status }) {
  if (status === 'DaHoanTien') {
    return (
      <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-5">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Tiến trình đơn hàng</p>
        <div className="rounded-xl bg-purple-100 px-4 py-3 text-center text-sm font-semibold text-purple-700">
          ✓ Đơn hàng đã hủy và hoàn tiền thành công
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">
          Cảm ơn bạn đã mua tại Flygo!
        </p>
      </div>
    )
  }

  if (status === 'DaHuy') {
    return (
      <div className="rounded-2xl border border-cream-dark bg-cream/30 px-4 py-5">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Tiến trình đơn hàng</p>
        <div className="rounded-xl bg-gray-100 px-4 py-3 text-center text-sm text-gray-500">
          Đơn hàng đã bị hủy
        </div>
      </div>
    )
  }

  const activeIndex = getOrderStatusStepIndex(status)

  return (
    <div className="rounded-2xl border border-cream-dark bg-cream/30 px-4 py-5 sm:px-5">
      <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Tiến trình đơn hàng</p>

      <ol className="space-y-0">
        {ORDER_STATUS_TIMELINE.map((step, index) => {
          const isDone = index < activeIndex
          const isActive = index === activeIndex
          const isLast = index === ORDER_STATUS_TIMELINE.length - 1

          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    isDone
                      ? 'bg-primary text-white'
                      : isActive
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-white text-gray-400 ring-1 ring-cream-dark'
                  }`}
                >
                  {isDone ? '✓' : index + 1}
                </span>
                {!isLast && (
                  <span className={`my-1 w-0.5 flex-1 min-h-[28px] ${isDone ? 'bg-primary' : 'bg-cream-dark'}`} />
                )}
              </div>

              <div className={`pb-5 ${isLast ? 'pb-0' : ''}`}>
                <p
                  className={`font-semibold ${
                    isActive ? 'text-primary' : isDone ? 'text-gray-800' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {(isActive || isDone) && (
                  <p className={`mt-0.5 text-sm ${isActive ? 'text-gray-600' : 'text-gray-500'}`}>
                    {isActive ? getOrderStatusDescription(status) : step.doneHint}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

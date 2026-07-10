import { Link } from 'react-router-dom'
import { paths } from '../../../../routes/paths'

const steps = [
  { id: 1, label: 'Giỏ hàng', path: paths.CART },
  { id: 2, label: 'Thanh toán', path: paths.CHECKOUT },
  { id: 3, label: 'Hoàn tất', path: paths.PAYMENT_RESULT },
]

export default function CheckoutSteps({ current = 1 }) {
  return (
    <nav aria-label="Tiến trình đặt hàng" className="mb-8 flex items-center gap-2 sm:gap-4">
      {steps.map((step, idx) => {
        const active = step.id === current
        const done = step.id < current
        const isLast = idx === steps.length - 1

        return (
          <div key={step.id} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                  active || done
                    ? 'bg-primary text-white'
                    : 'border border-cream-dark bg-white text-gray-400'
                }`}
              >
                {done ? '✓' : step.id}
              </span>
              {step.id < 3 ? (
                <Link
                  to={step.path}
                  className={`truncate text-sm font-medium no-underline ${
                    active ? 'text-primary' : done ? 'text-gray-700 hover:text-primary' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </Link>
              ) : (
                <span className={`truncate text-sm font-medium ${active ? 'text-primary' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              )}
            </div>
            {!isLast && <div className={`hidden h-px flex-1 sm:block ${done ? 'bg-primary' : 'bg-cream-dark'}`} />}
          </div>
        )
      })}
    </nav>
  )
}

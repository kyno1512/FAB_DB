import { formatPrice } from '../../../../lib/formatPrice'
import { getDiscountPercent } from '../../../../lib/productPrice'

const sizeStyles = {
  sm: {
    price: 'text-sm font-bold',
    original: 'text-xs',
    badge: 'text-[0.65rem] px-1.5 py-0.5',
  },
  md: {
    price: 'text-base font-bold',
    original: 'text-sm',
    badge: 'text-xs px-2 py-0.5',
  },
  lg: {
    price: 'text-2xl font-bold sm:text-3xl',
    original: 'text-sm',
    badge: 'text-xs px-2.5 py-1',
  },
}

export default function ProductPriceBlock({ price, originalPrice, size = 'sm', className = '' }) {
  const percent = getDiscountPercent(originalPrice, price)
  const styles = sizeStyles[size] ?? sizeStyles.sm

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
        <span className={`${styles.price} ${percent ? 'text-red-600' : 'text-primary'}`}>
          {formatPrice(price)}
        </span>
        {percent != null && (
          <span
            className={`shrink-0 rounded-full bg-red-50 font-semibold text-red-600 ${styles.badge}`}
          >
            -{percent}%
          </span>
        )}
      </div>
      <span className={`text-gray-400 line-through ${styles.original} ${percent == null ? 'invisible' : ''}`}>
        {formatPrice(originalPrice)}
      </span>
    </div>
  )
}

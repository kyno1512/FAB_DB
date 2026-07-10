import { formatPrice } from '../../../../lib/formatPrice'
import { getProductImageFallback } from '../../../../lib/productImage'

export default function OrderSummaryCard({
  items,
  subtotal,
  shipping = 0,
  shippingHint = '',
  discount = 0,
  showImages = false,
  promoSlot = null,
}) {
  const total = Math.max(0, subtotal + shipping - discount)
  const shippingLabel =
    shipping === 0 ? (shippingHint || 'Miễn phí') : undefined

  return (
    <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
      <div className="bg-gradient-to-r from-primary to-primary-dark px-5 py-4 text-white">
        <h2 className="font-semibold">Đơn hàng của bạn</h2>
        <p className="mt-0.5 text-sm text-white/80">{items.length} món</p>
      </div>

      <ul className="max-h-64 divide-y divide-cream-dark overflow-y-auto px-5">
        {items.map((item) => {
          const itemKey = item.sizeId ? `${item.id}-${item.sizeId}` : item.id
          const itemImage = item.image || getProductImageFallback(item.name, item.categoryName)
          return (
            <li key={itemKey} className="flex items-center gap-3 py-3">
              {showImages && (
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                  <img src={itemImage} alt="" className="size-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-gray-800">{item.name}</p>
                {item.sizeName && (
                  <p className="text-xs text-primary">{item.sizeName}</p>
                )}
                <p className="text-xs text-gray-500">× {item.qty}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-gray-800">
                {formatPrice(item.price * item.qty)}
              </span>
            </li>
          )
        })}
      </ul>

      {promoSlot}

      <div className="space-y-2 border-t border-cream-dark px-5 py-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Giảm giá</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Phí giao hàng</span>
          <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
            {shipping === 0 ? shippingLabel : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between border-t border-cream-dark pt-3 text-base font-bold text-gray-800">
          <span>Tổng cộng</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}

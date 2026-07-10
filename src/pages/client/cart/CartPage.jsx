import { Link } from 'react-router-dom'
import { container } from '../../../lib/classes'
import { DELIVERY } from '../../../constants/store'
import { formatPrice } from '../../../lib/formatPrice'
import { useCart } from '../../../context/CartContext'
import { useVoucher } from '../../../context/VoucherContext'
import { paths } from '../../../routes/paths'
import CheckoutSteps from '../checkout/components/CheckoutSteps'
import OrderSummaryCard from '../checkout/components/OrderSummaryCard'
import PromoCodeBox from '../checkout/components/PromoCodeBox'
import CartItemRow from './components/CartItemRow'

export default function CartPage() {
  const { items, subtotal, totalCount } = useCart()
  const { soTienGiam } = useVoucher()
  const total = Math.max(0, subtotal - soTienGiam)

  if (items.length === 0) {
    return (
      <div className="pb-24 pt-16 lg:pb-16">
        <div className={`${container} text-center`}>
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary-light text-3xl">🛒</div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-gray-800">Giỏ hàng trống</h1>
          <p className="mt-2 text-gray-500">Thêm bánh hoặc cà phê yêu thích vào giỏ nhé!</p>
          <Link
            to={paths.PRODUCTS}
            className="mt-6 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-white no-underline hover:bg-primary-dark"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 pt-6 sm:pb-24 sm:pt-10 lg:pb-12">
      <div className={container}>
        <CheckoutSteps current={1} />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
          <section className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-cream-dark px-4 py-4 sm:px-6">
              <div>
                <h1 className="font-display text-xl font-semibold text-gray-800 sm:text-2xl">Giỏ hàng</h1>
                <p className="text-sm text-gray-500">{totalCount} sản phẩm</p>
              </div>
              <Link to={paths.PRODUCTS} className="text-sm font-medium text-primary no-underline hover:underline">
                + Thêm món
              </Link>
            </div>
            {items.map((item) => (
              <CartItemRow key={item.sizeId ? `${item.id}-${item.sizeId}` : item.id} item={item} />
            ))}
          </section>

          <aside className="lg:sticky lg:top-28">
            <OrderSummaryCard
              items={items}
              subtotal={subtotal}
              discount={soTienGiam}
              showImages
              promoSlot={<PromoCodeBox subtotal={subtotal} />}
            />
            <Link
              to={paths.CHECKOUT}
              className="mt-4 block w-full rounded-xl bg-primary py-4 text-center font-semibold text-white no-underline shadow-md shadow-primary/20 transition hover:bg-primary-dark"
            >
              Tiến hành thanh toán · {formatPrice(total)}
            </Link>
            <p className="mt-3 text-center text-xs text-gray-500">
              {DELIVERY.area} · {DELIVERY.district1Free} · {DELIVERY.otherDistrictNote}
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}

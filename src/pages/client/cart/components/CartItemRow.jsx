import { formatPrice } from '../../../../lib/formatPrice'
import { useCart } from '../../../../context/CartContext'
import { checkStock } from '../../../../services/productService'
import { getProductImageFallback } from '../../../../lib/productImage'
import Swal from 'sweetalert2'
import { SWAL_CONFIRM_COLOR } from '../../../../lib/swal'

export default function CartItemRow({ item }) {
  const { updateQty, removeItem, updateItemMaxAvailable } = useCart()

  // Unique key for item (includes sizeId)
  const itemKey = item.sizeId ? `${item.id}-${item.sizeId}` : item.id
  const itemImage = item.image || getProductImageFallback(item.name, item.categoryName)

  async function handleIncrease() {
    const max = item.maxAvailable ?? Infinity
    if (item.qty >= max) {
      if (max > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Đã đạt giới hạn',
          html: `<p style="text-align:left">Chỉ còn <b>${max}</b> phần có sẵn.</p>`,
          confirmButtonText: 'Đã hiểu',
          confirmButtonColor: SWAL_CONFIRM_COLOR,
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Tạm hết hàng',
          html: '<p style="text-align:left">Sản phẩm này hiện không có sẵn.</p>',
          confirmButtonText: 'Đã hiểu',
          confirmButtonColor: SWAL_CONFIRM_COLOR,
        })
      }
      return
    }

    try {
      const res = await checkStock([{ maSanPham: item.id, soLuong: item.qty + 1 }])
      if (!res.success) {
        const maxAvailable = res.maxAvailable ?? 0
        const message = maxAvailable === 0
          ? 'Món này hiện không thể bán.'
          : `Hiện tại món này chỉ đặt được tối đa <strong style="font-size:1.1em">${maxAvailable} phần</strong>.`
        Swal.fire({
          icon: 'warning',
          title: 'Không đủ nguyên liệu!',
          html: `<p style="text-align:center">${message}</p>`,
          confirmButtonText: 'Đã hiểu',
          confirmButtonColor: SWAL_CONFIRM_COLOR,
        })
        return
      }
    } catch {}

    const newQty = item.qty + 1
    updateQty(item.id, newQty, item.sizeId)
    if (item.maxAvailable !== null && newQty > item.maxAvailable) {
      updateItemMaxAvailable(item.id, newQty)
    }
  }

  async function handleDecrease() {
    if (item.qty <= 1) return
    updateQty(item.id, item.qty - 1, item.sizeId)
  }

  const max = item.maxAvailable ?? Infinity
  const isOutOfStock = item.maxAvailable === 0
  const atMax = item.qty >= max && max < Infinity

  return (
    <article className="flex gap-4 border-b border-cream-dark px-4 py-4 last:border-b-0 sm:px-6 sm:py-5">
      <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-cream sm:size-28">
        <img src={itemImage} alt={item.name} className="size-full object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-800">{item.name}</h3>
            {item.sizeName && (
              <p className="mt-1 text-sm text-primary font-medium">Size {item.sizeName}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)} / món</p>
            {isOutOfStock && (
              <p className="mt-1 text-xs font-medium text-red-500">Tạm hết hàng</p>
            )}
            {!isOutOfStock && max < Infinity && (
              <p className="mt-1 text-xs text-gray-400">Tối đa {max} phần</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.id, item.sizeId)}
            className="rounded-lg px-2 py-1 text-xs text-gray-400 transition hover:bg-red-50 hover:text-red-500"
          >
            Xóa
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center rounded-full border border-cream-dark bg-cream/50 p-1">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={item.qty <= 1 || isOutOfStock}
              className="grid size-8 place-items-center rounded-full text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm font-bold">{item.qty}</span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={atMax || isOutOfStock}
              className="grid size-8 place-items-center rounded-full text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
          <span className="text-base font-bold text-primary">{formatPrice(item.price * item.qty)}</span>
        </div>
      </div>
    </article>
  )
}

import { useEffect, useState } from 'react'
import { getProductById, getMaxAvailable } from '../services/productService'
import { formatPrice } from '../lib/formatPrice'
import { getProductImageUrl } from '../lib/productImage'
import { useCart } from '../context/CartContext'
import { getUser } from '../lib/authStorage'
import { IconBell, IconX } from './ui/icons'

export default function ProductQuickViewModal({ product, isOpen, onClose }) {
  const { addItem, addItemWithMax } = useCart()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [maxAvailable, setMaxAvailable] = useState(null)

  // Reset state when product changes
  useEffect(() => {
    if (isOpen && product) {
      setQty(1)
      setSelectedSize(null)
      setMaxAvailable(null)
      fetchDetail()
    }
  }, [isOpen, product])

  // Auto-select first size when product has sizes
  useEffect(() => {
    if (detail?.coSize && detail?.giaTheoSizes?.length && !selectedSize) {
      setSelectedSize(detail.giaTheoSizes[0].maSize)
    }
  }, [detail, selectedSize])

  async function fetchDetail() {
    if (!product?.id) return
    setLoading(true)
    try {
      const data = await getProductById(product.id)
      setDetail(data)

      // Get max available for logged in users
      const user = getUser()
      if (user?.maNguoiDung) {
        try {
          const res = await getMaxAvailable(product.id)
          setMaxAvailable(res.maxAvailable)
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleAddToCart() {
    if (!detail) return

    // Validate size if required
    if (detail.coSize && !selectedSize) {
      alert('Vui lòng chọn size!')
      return
    }

    const user = getUser()
    const currentPrice = detail.coSize && selectedSize
      ? (detail.giaTheoSizes.find(g => g.maSize === selectedSize)?.gia || detail.giaBan)
      : detail.giaBan

    const item = {
      id: detail.maSanPham,
      name: detail.tenSanPham,
      price: currentPrice,
      sizeId: selectedSize,
      sizeName: detail.giaTheoSizes?.find(g => g.maSize === selectedSize)?.tenSize,
      image: getProductImageUrl({
        hinhAnhChinh: detail.hinhAnhs?.find(h => h.laAnhChinh)?.duongDan || detail.hinhAnhs?.[0]?.duongDan,
        tenSanPham: detail.tenSanPham,
        tenDanhMuc: detail.tenDanhMuc,
      }),
      desc: detail.moTa || '',
      categoryName: detail.tenDanhMuc,
      qty,
    }

    if (user?.maNguoiDung) {
      addItemWithMax(item, qty, maxAvailable)
    } else {
      addItem(item, qty)
    }

    onClose()
  }

  if (!isOpen) return null

  const currentPrice = detail?.coSize && selectedSize
    ? (detail.giaTheoSizes.find(g => g.maSize === selectedSize)?.gia || detail?.giaBan || 0)
    : (detail?.giaBan || product?.price || 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-800">Thêm vào giỏ</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <IconX />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : detail ? (
            <>
              {/* Product Info */}
              <div className="flex gap-4">
                <img
                  src={getProductImageUrl({
                    hinhAnhChinh: detail.hinhAnhs?.find(h => h.laAnhChinh)?.duongDan || detail.hinhAnhs?.[0]?.duongDan,
                    tenSanPham: detail.tenSanPham,
                    tenDanhMuc: detail.tenDanhMuc,
                  })}
                  alt={detail.tenSanPham}
                  className="size-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium text-primary">{detail.tenDanhMuc}</p>
                  <h4 className="mt-0.5 font-semibold text-gray-800">{detail.tenSanPham}</h4>
                  <p className="mt-1 text-lg font-bold text-primary">{formatPrice(currentPrice)}</p>
                </div>
              </div>

              {/* Size Selector - only show if product has sizes */}
              {detail.coSize && detail.giaTheoSizes?.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-gray-700">Chọn size</p>
                  <div className="flex gap-2">
                    {detail.giaTheoSizes.map((gia) => (
                      <button
                        key={gia.maSize}
                        type="button"
                        onClick={() => setSelectedSize(gia.maSize)}
                        className={`flex-1 rounded-lg border-2 py-2.5 px-3 text-center transition ${
                          selectedSize === gia.maSize
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="block text-sm font-semibold">{gia.tenSize}</span>
                        <span className="block text-xs mt-0.5">{formatPrice(gia.gia)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-gray-700">Số lượng</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="size-9 rounded-lg border border-gray-300 text-lg font-medium text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxAvailable ?? ''}
                    value={qty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      setQty(maxAvailable != null ? Math.min(val, maxAvailable) : val)
                    }}
                    className="w-20 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setQty(q => maxAvailable != null ? Math.min(q + 1, maxAvailable) : q + 1)}
                    disabled={maxAvailable != null && qty >= maxAvailable}
                    className="size-9 rounded-lg border border-gray-300 text-lg font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                  {maxAvailable != null && (
                    <span className="text-xs text-gray-400">/ {maxAvailable} có sẵn</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-gray-500">Không thể tải thông tin sản phẩm.</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4">
          {!detail?.conHang ? (
            <button
              type="button"
              onClick={() => alert('Cảm ơn bạn! Chúng tôi sẽ thông báo khi sản phẩm có hàng.')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <IconBell />
              Báo khi có hàng
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={loading || !detail || (detail?.coSize && !selectedSize)}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              {loading ? 'Đang tải...' : 'Thêm vào giỏ hàng'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

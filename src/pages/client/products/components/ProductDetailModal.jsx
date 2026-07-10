import { useEffect, useMemo, useState } from 'react'
import { getProductById, getProductReviews, getMaxAvailable } from '../../../../services/productService'
import { formatPrice } from '../../../../lib/formatPrice'
import { getProductImageUrl } from '../../../../lib/productImage'
import { getDiscountPercent } from '../../../../lib/productPrice'
import { useCart } from '../../../../context/CartContext'
import { getUser } from '../../../../lib/authStorage'
import { IconBell, IconClose } from '../../../../components/ui/icons'
import StarRating from './StarRating'
import StockBadge from './StockBadge'

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const { addItem, addItemWithMax } = useCart()
  const [detail, setDetail] = useState(null)
  const [reviews, setReviews] = useState({ average: 0, total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState('')
  const [qty, setQty] = useState(1)
  const [maxFromApi, setMaxFromApi] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)

  useEffect(() => {
    if (!isOpen || !product?.id) return
    setDetail(null)
    setReviews({ average: 0, total: 0 })
    setError('')
    setActiveImage('')
    setQty(1)
    setMaxFromApi(null)
    setSelectedSize(null)
    loadDetail()
  }, [isOpen, product?.id])

  useEffect(() => {
    if (detail?.coSize && detail?.giaTheoSizes?.length && !selectedSize) {
      setSelectedSize(detail.giaTheoSizes[0].maSize)
    }
  }, [detail, selectedSize])

  const currentPrice = useMemo(() => {
    if (!detail) return product?.price || 0
    if (detail.coSize && selectedSize && detail.giaTheoSizes?.length) {
      const sizePrice = detail.giaTheoSizes.find((g) => g.maSize === selectedSize)
      return sizePrice ? sizePrice.gia : detail.giaBan
    }
    return detail.giaBan || 0
  }, [detail, product, selectedSize])

  const maxAvailable = useMemo(() => {
    if (maxFromApi !== null) return maxFromApi
    if (!detail?.bomItems?.length) return null
    const limits = detail.bomItems.map((b) => {
      if (b.soLuong <= 0) return Infinity
      return Math.floor(b.soLuongTon / b.soLuong)
    })
    return Math.min(...limits)
  }, [detail, maxFromApi])

  async function loadDetail() {
    if (!product?.id) return
    setLoading(true)
    setError('')
    try {
      const [productDetail, reviewData] = await Promise.all([
        getProductById(product.id),
        getProductReviews(product.id).catch(() => ({ diemTrungBinh: 0, tongDanhGia: 0 })),
      ])
      setDetail(productDetail)
      setReviews({
        average: reviewData.diemTrungBinh ?? 0,
        total: reviewData.tongDanhGia ?? 0,
      })

      const mainImage = getProductImageUrl({
        hinhAnhChinh:
          productDetail.hinhAnhs?.find((img) => img.laAnhChinh)?.duongDan ||
          productDetail.hinhAnhs?.[0]?.duongDan,
        tenSanPham: productDetail.tenSanPham,
        tenDanhMuc: productDetail.tenDanhMuc,
      })
      setActiveImage(mainImage)

      const user = getUser()
      if (user?.maNguoiDung) {
        try {
          const res = await getMaxAvailable(product.id)
          setMaxFromApi(res.maxAvailable)
        } catch {
          // ignore
        }
      }
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  function handleAddToCart() {
    if (!detail) return
    if (detail.coSize && !selectedSize) {
      alert('Vui lòng chọn size!')
      return
    }

    const user = getUser()
    const image = activeImage || getProductImageUrl({ tenSanPham: detail.tenSanPham, tenDanhMuc: detail.tenDanhMuc })
    const item = {
      id: detail.maSanPham,
      name: detail.tenSanPham,
      price: currentPrice,
      sizeId: selectedSize,
      sizeName: detail.giaTheoSizes?.find((g) => g.maSize === selectedSize)?.tenSize,
      image,
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

  const images = useMemo(() => {
    if (!detail?.hinhAnhs?.length) {
      return [
        getProductImageUrl({
          tenSanPham: detail?.tenSanPham || product?.name,
          tenDanhMuc: detail?.tenDanhMuc || product?.categoryName,
        }),
      ]
    }
    return detail.hinhAnhs.map((img) => img.duongDan)
  }, [detail, product])

  const discountPercent = getDiscountPercent(detail?.giaGoc, detail?.giaBan)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[min(92vh,820px)] w-full max-w-4xl flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold text-gray-500">Chi tiết sản phẩm</p>
            <h3 className="font-display text-lg font-bold text-gray-800 sm:text-xl">
              {loading ? 'Đang tải...' : detail?.tenSanPham || product?.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
            aria-label="Đóng"
          >
            <IconClose />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {error && !loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={loadDetail}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2">
              {/* Ảnh sản phẩm */}
              <div className="relative bg-cream/40">
                <div className="aspect-square w-full overflow-hidden md:h-full md:min-h-[420px] md:aspect-auto">
                  {detail ? (
                    <img
                      src={
                        activeImage ||
                        getProductImageUrl({
                          hinhAnhChinh:
                            detail.hinhAnhs?.find((img) => img.laAnhChinh)?.duongDan ||
                            detail.hinhAnhs?.[0]?.duongDan,
                          tenSanPham: detail.tenSanPham,
                          tenDanhMuc: detail.tenDanhMuc,
                        })
                      }
                      alt={detail.tenSanPham}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">Đang tải ảnh...</div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto border-t border-cream-dark/60 bg-white/80 px-4 py-3 backdrop-blur-sm md:absolute md:bottom-0 md:left-0 md:right-0">
                    {images.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setActiveImage(src)}
                        className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                          activeImage === src
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={src} alt="" className="size-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Thông tin */}
              <div className="flex flex-col p-5 sm:p-6">
                {detail && (
                  <>
                    {detail.tenDanhMuc && (
                      <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {detail.tenDanhMuc}
                      </span>
                    )}

                    <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-gray-800 sm:text-3xl">
                      {detail.tenSanPham}
                    </h2>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <StarRating value={reviews.average} size="sm" />
                      <span className="text-sm text-gray-500">
                        {reviews.average.toFixed(1)} · {reviews.total} đánh giá
                      </span>
                    </div>

                    <div className="mt-4 inline-flex flex-wrap items-baseline gap-2 rounded-xl bg-cream/60 px-4 py-3">
                      <span className={`text-2xl font-bold sm:text-3xl ${discountPercent ? 'text-red-600' : 'text-primary'}`}>
                        {formatPrice(currentPrice)}
                      </span>
                      {detail.coSize && selectedSize && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {detail.giaTheoSizes.find((g) => g.maSize === selectedSize)?.tenSize}
                        </span>
                      )}
                      {discountPercent != null && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                          -{discountPercent}%
                        </span>
                      )}
                      {detail.giaGoc && detail.giaGoc > currentPrice && (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(detail.giaGoc)}</span>
                      )}
                      {detail.donVi && <span className="text-xs text-gray-400">/ {detail.donVi}</span>}
                    </div>

                    <div className="mt-4">
                      {detail.conHang ? (
                        <StockBadge conHang={detail.conHang} coTheBan={detail.coTheBan} />
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2">
                          <IconBell className="text-red-500" />
                          <span className="text-sm font-semibold text-red-600">Hết hàng</span>
                        </div>
                      )}
                    </div>

                    {detail.coSize && detail.giaTheoSizes?.length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Chọn size</p>
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

                    {detail.moTa && (
                      <div className="mt-5 border-t border-gray-100 pt-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mô tả</p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">{detail.moTa}</p>
                      </div>
                    )}

                    {detail.comboItems?.length > 0 && (
                      <div className="mt-5 rounded-xl border border-gray-100 bg-cream/30 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">Combo gồm</p>
                        <ul className="mt-3 space-y-2">
                          {detail.comboItems.map((item) => (
                            <li key={item.maSanPhamCon} className="flex items-center gap-3">
                              <img
                                src={getProductImageUrl({
                                  hinhAnhChinh: item.hinhAnhChinh,
                                  tenSanPham: item.tenSanPham,
                                  tenDanhMuc: item.tenDanhMuc,
                                })}
                                alt={item.tenSanPham}
                                className="size-10 rounded-lg border border-gray-100 object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800">
                                  {item.tenSanPham}
                                  {item.soLuong > 1 ? ` x${item.soLuong}` : ''}
                                </p>
                                <p className="text-xs text-gray-500">{item.tenDanhMuc}</p>
                              </div>
                              <span className="text-xs font-medium text-gray-500">{formatPrice(item.giaBan)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-auto pt-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">Số lượng</p>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="size-9 rounded-lg border border-gray-300 text-lg font-medium text-gray-600 transition hover:bg-gray-100"
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
                          className="w-20 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setQty((q) => (maxAvailable != null ? Math.min(q + 1, maxAvailable) : q + 1))}
                          disabled={maxAvailable != null && qty >= maxAvailable}
                          className="size-9 rounded-lg border border-gray-300 text-lg font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                        {maxAvailable != null && (
                          <span className="text-xs text-gray-400">/ {maxAvailable} có sẵn</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (detail.conHang) {
                          handleAddToCart()
                        } else {
                          alert('Cảm ơn bạn! Chúng tôi sẽ thông báo khi sản phẩm có hàng.')
                        }
                      }}
                      disabled={loading || !detail || (detail?.coSize && !selectedSize)}
                      className={`mt-5 w-full rounded-xl py-3.5 text-sm font-semibold shadow-md transition sm:text-base ${
                        detail?.conHang
                          ? 'bg-primary text-white shadow-primary/20 hover:bg-[color:var(--color-primary-dark)] disabled:bg-gray-300 disabled:shadow-none'
                          : 'border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {loading ? 'Đang tải...' : detail?.conHang ? 'Thêm vào giỏ hàng' : 'Báo khi có hàng'}
                    </button>
                  </>
                )}

                {loading && (
                  <div className="flex flex-1 items-center justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

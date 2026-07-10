import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { container } from '../../../lib/classes'
import { formatPrice } from '../../../lib/formatPrice'
import { getDiscountPercent } from '../../../lib/productPrice'
import { getProductImageUrl } from '../../../lib/productImage'
import { useCart } from '../../../context/CartContext'
import { paths } from '../../../routes/paths'
import { getProductById, getProductReviews, getMaxAvailable } from '../../../services/productService'
import { getUser } from '../../../lib/authStorage'
import { IconBell, IconClock } from '../../../components/ui/icons'
import ProductReviewSection from './components/ProductReviewSection'
import ProductThumbnail from './components/ProductThumbnail'
import StarRating from './components/StarRating'
import StockBadge from './components/StockBadge'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, addItemWithMax } = useCart()
  const [product, setProduct] = useState(null)
  const [ratingSummary, setRatingSummary] = useState({ average: 0, total: 0 })
  const [activeImage, setActiveImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [maxFromApi, setMaxFromApi] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)

  // Auto-select first size when product loads
  useEffect(() => {
    if (product?.coSize && product?.giaTheoSizes?.length && !selectedSize) {
      setSelectedSize(product.giaTheoSizes[0].maSize)
    }
  }, [product, selectedSize])

  // Get price based on selected size
  const currentPrice = useMemo(() => {
    if (product?.coSize && selectedSize && product?.giaTheoSizes?.length) {
      const sizePrice = product.giaTheoSizes.find(g => g.maSize === selectedSize)
      return sizePrice ? sizePrice.gia : product.giaBan
    }
    return product?.giaBan || 0
  }, [product, selectedSize])

  const maxAvailable = useMemo(() => {
    if (maxFromApi !== null) return maxFromApi
    if (!product?.bomItems?.length) return null
    const limits = product.bomItems.map(b => {
      if (b.soLuong <= 0) return Infinity
      return Math.floor(b.soLuongTon / b.soLuong)
    })
    return Math.min(...limits)
  }, [product, maxFromApi])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      try {
        const [detail, reviews] = await Promise.all([
          getProductById(id),
          getProductReviews(id).catch(() => ({ diemTrungBinh: 0, tongDanhGia: 0 })),
        ])

        if (cancelled) return

        setProduct(detail)
        setRatingSummary({
          average: reviews.diemTrungBinh ?? 0,
          total: reviews.tongDanhGia ?? 0,
        })

        const user = getUser()
        if (user?.maNguoiDung) {
          try {
            const res = await getMaxAvailable(id)
            setMaxFromApi(res.maxAvailable)
          } catch {
            // fallback to product.bomItems
          }
        }

        const mainImage = getProductImageUrl({
          hinhAnhChinh:
            detail.hinhAnhs?.find((img) => img.laAnhChinh)?.duongDan ||
            detail.hinhAnhs?.[0]?.duongDan,
          tenSanPham: detail.tenSanPham,
          tenDanhMuc: detail.tenDanhMuc,
        })

        setActiveImage(mainImage)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  const images = useMemo(() => {
    if (!product?.hinhAnhs?.length) {
      return [
        getProductImageUrl({
          tenSanPham: product?.tenSanPham,
          tenDanhMuc: product?.tenDanhMuc,
        }),
      ]
    }
    return product.hinhAnhs.map((img) => img.duongDan)
  }, [product])

  async function handleAddToCart() {
    if (!product) return

    // Validate size selection if product has sizes
    if (product.coSize && !selectedSize) {
      alert('Vui lòng chọn size!')
      return
    }

    const user = getUser()
    if (!user?.maNguoiDung) {
      addItem({
        id: product.maSanPham,
        name: product.tenSanPham,
        price: currentPrice,
        sizeId: selectedSize,
        sizeName: product.giaTheoSizes?.find(g => g.maSize === selectedSize)?.tenSize,
        image: activeImage || getProductImageUrl({ tenSanPham: product.tenSanPham, tenDanhMuc: product.tenDanhMuc }),
        desc: product.moTa ?? '',
        categoryName: product.tenDanhMuc,
        qty,
      })
    } else {
      addItemWithMax({
        id: product.maSanPham,
        name: product.tenSanPham,
        price: currentPrice,
        sizeId: selectedSize,
        sizeName: product.giaTheoSizes?.find(g => g.maSize === selectedSize)?.tenSize,
        image: activeImage || getProductImageUrl({ tenSanPham: product.tenSanPham, tenDanhMuc: product.tenDanhMuc }),
        desc: product.moTa ?? '',
        categoryName: product.tenDanhMuc,
        qty,
      }, qty, maxAvailable)
    }
    navigate(paths.CART)
  }

  function handleReviewSummaryChange(summary) {
    setRatingSummary(summary)
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-gray-500">
        <div className={`${container} max-w-4xl`}>Đang tải sản phẩm...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center">
        <div className={`${container} max-w-4xl`}>
          <p className="text-sm text-red-600">{error || 'Không tìm thấy sản phẩm.'}</p>
          <Link to={paths.PRODUCTS} className="mt-4 inline-block text-sm font-medium text-primary no-underline hover:underline">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  const discountPercent = getDiscountPercent(product.giaGoc, product.giaBan)

  return (
    <div className="pb-24 pt-6 sm:pb-24 sm:pt-10 lg:pb-12">
      <div className={`${container} max-w-4xl`}>
        <Link
          to={paths.PRODUCTS}
          className="mb-5 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-gray-500 no-underline transition hover:bg-white hover:text-primary"
        >
          ← Quay lại sản phẩm
        </Link>

        <article className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            {/* Ảnh sản phẩm */}
            <div className="relative bg-cream/40">
              <div className="aspect-square w-full overflow-hidden lg:min-h-[420px] lg:aspect-auto lg:h-full">
                <ProductThumbnail
                  src={activeImage || getProductImageUrl({ tenSanPham: product?.tenSanPham, tenDanhMuc: product?.tenDanhMuc })}
                  name={product.tenSanPham}
                  categoryName={product.tenDanhMuc}
                  className="size-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-cream-dark/60 bg-white/80 px-4 py-3 backdrop-blur-sm lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:border-t lg:border-white/40">
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
            <div className="flex flex-col p-5 sm:p-7 lg:p-8">
              <div className="flex-1">
                {product.tenDanhMuc && (
                  <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {product.tenDanhMuc}
                  </span>
                )}

                <h1 className="mt-3 font-display text-2xl font-semibold leading-tight text-gray-800 sm:text-3xl">
                  {product.tenSanPham}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StarRating value={ratingSummary.average} size="sm" />
                  <span className="text-sm text-gray-500">
                    {ratingSummary.average.toFixed(1)} · {ratingSummary.total} đánh giá
                  </span>
                </div>

                <div className="mt-5 inline-flex flex-wrap items-baseline gap-2 rounded-xl bg-cream/60 px-4 py-3">
                  <span className={`text-2xl font-bold sm:text-3xl ${discountPercent ? 'text-red-600' : 'text-primary'}`}>
                    {formatPrice(currentPrice)}
                  </span>
                  {product.coSize && selectedSize && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {product.giaTheoSizes.find(g => g.maSize === selectedSize)?.tenSize}
                    </span>
                  )}
                  {discountPercent != null && (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                      -{discountPercent}%
                    </span>
                  )}
                  {product.giaGoc && product.giaGoc > currentPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.giaGoc)}
                    </span>
                  )}
                  {product.donVi && (
                    <span className="text-xs text-gray-400">/ {product.donVi}</span>
                  )}
                </div>

                {/* Stock Badge */}
                <div className="mt-4">
                  {product.conHang ? (
                    <StockBadge conHang={product.conHang} coTheBan={product.coTheBan} />
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2">
                      <IconClock className="text-red-500" />
                      <span className="text-sm font-semibold text-red-600">Hết hàng</span>
                    </div>
                  )}
                </div>

                {/* Size Selector */}
                {product.coSize && product.giaTheoSizes?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Chọn size</p>
                    <div className="flex gap-2">
                      {product.giaTheoSizes.map((gia) => (
                        <button
                          key={gia.maSize}
                          type="button"
                          onClick={() => setSelectedSize(gia.maSize)}
                          className={`flex-1 rounded-lg border-2 py-2.5 px-3 transition ${
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

                {product.moTa && (
                  <div className="mt-5 border-t border-cream-dark pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Mô tả
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
                      {product.moTa}
                    </p>
                  </div>
                )}

                {product.comboItems?.length > 0 && (
                  <div className="mt-5 rounded-xl border border-cream-dark bg-cream/30 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">Combo gồm</p>
                    <ul className="mt-3 space-y-2">
                      {product.comboItems.map((item) => (
                        <li key={item.maSanPhamCon} className="flex items-center gap-3">
                          <img
                            src={getProductImageUrl({
                              hinhAnhChinh: item.hinhAnhChinh,
                              tenSanPham: item.tenSanPham,
                              tenDanhMuc: item.tenDanhMuc,
                            })}
                            alt={item.tenSanPham}
                            className="size-10 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {item.tenSanPham}
                              {item.soLuong > 1 ? ` x${item.soLuong}` : ''}
                            </p>
                            <p className="text-xs text-gray-500">{item.tenDanhMuc}</p>
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            {formatPrice(item.giaBan)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Số lượng</p>
                </div>
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
                    value={qty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      setQty(Math.max(1, val))
                    }}
                    className="w-20 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setQty(q => q + 1)}
                    className="size-9 rounded-lg border border-gray-300 text-lg font-medium text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (product.conHang) {
                    handleAddToCart()
                  } else {
                    // TODO: Implement "Báo khi có hàng" functionality
                    alert('Cảm ơn bạn! Chúng tôi sẽ thông báo khi sản phẩm có hàng.')
                  }
                }}
                className={`mt-6 w-full rounded-xl py-3.5 text-sm font-semibold shadow-md transition sm:text-base ${
                  product.conHang
                    ? 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark'
                    : 'border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                {product.conHang ? 'Thêm vào giỏ hàng' : (
                  <span className="flex items-center justify-center gap-2">
                    <IconBell />
                    Báo khi có hàng
                  </span>
                )}
              </button>
            </div>
          </div>
        </article>

        <ProductReviewSection productId={product.maSanPham} onSummaryChange={handleReviewSummaryChange} />
      </div>
    </div>
  )
}

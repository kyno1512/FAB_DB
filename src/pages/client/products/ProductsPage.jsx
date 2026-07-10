import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageHero from '../../../components/common/PageHero'
import { IconSearch } from '../../../components/ui/icons'
import { container } from '../../../lib/classes'
import { PRODUCT_SORT_OPTIONS } from '../../../constants/products'
import { useCategories } from '../../../hooks/useCategories'
import { useDebounce } from '../../../hooks/useDebounce'
import { useProductList } from '../../../hooks/useProductList'
import { buildProductUrl, parseProductParams } from '../../../lib/productUrls'
import ProductCard from './components/ProductCard'
import ProductCategorySidebar, { ProductCategoryChips } from './components/ProductCategorySidebar'
import ProductQuickViewModal from '../../../components/ProductQuickViewModal'
import ProductDetailModal from './components/ProductDetailModal'

export default function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { findById } = useCategories()
  const { filters, products, totalCount, totalPages, loading, error, reload } = useProductList()
  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebounce(searchInput.trim(), 300)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [detailProduct, setDetailProduct] = useState(null)

  const activeCategory = findById(filters.danhMuc)
  const title = filters.search
    ? `Kết quả "${filters.search}"`
    : activeCategory?.tenDanhMuc ?? 'Tất cả sản phẩm'

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    if (debouncedSearch === filters.search) return
    const current = parseProductParams(searchParams)
    navigate(buildProductUrl({ ...current, search: debouncedSearch, page: 1 }))
  }, [debouncedSearch, filters.search, navigate, searchParams])

  function handleSortChange(sort) {
    const current = parseProductParams(searchParams)
    navigate(buildProductUrl({ ...current, sort, page: 1 }))
  }

  function handlePageChange(page) {
    const current = parseProductParams(searchParams)
    navigate(buildProductUrl({ ...current, page }))
  }

  return (
    <>
      <PageHero
        eyebrow="Thực đơn Flygo"
        title="Sản phẩm"
        description="Bánh tươi, cà phê và combo được tối ưu hương vị — đặt online giao nhanh."
      />

      <div className="pb-24 pt-5 sm:pb-24 sm:pt-8 lg:pb-12 lg:pt-10">
        <div className={`${container} flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-start lg:gap-8`}>
          <div className="sticky-below-header z-30 -mx-4 bg-cream py-2 sm:-mx-6 lg:hidden">
            <ProductCategoryChips />
          </div>

          <div className="sticky-below-header hidden max-h-[calc(100dvh-var(--client-header-height,7.5rem)-1.5rem)] shrink-0 self-start overflow-y-auto lg:z-30 lg:block lg:w-56 xl:w-60">
            <ProductCategorySidebar />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-cream-dark bg-white px-4 py-4 shadow-sm sm:mb-6 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">Danh mục</p>
                  <h2 className="mt-0.5 font-display text-lg font-semibold text-gray-800 sm:text-xl">{title}</h2>
                  <p className="mt-0.5 text-sm text-gray-500">{totalCount} món</p>
                </div>

                <label className="flex w-full items-center gap-2 rounded-xl border border-cream-dark bg-cream/60 px-3 py-2 text-sm text-gray-600 sm:w-auto">
                  <span className="shrink-0 font-medium">Sắp xếp</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="min-w-0 flex-1 border-none bg-transparent text-sm font-medium outline-none sm:min-w-[140px]"
                  >
                    {PRODUCT_SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="relative flex items-center gap-2 rounded-xl border border-cream-dark bg-cream/40 px-3 py-2.5">
                <span className="shrink-0 text-gray-400">
                  <IconSearch />
                </span>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm tên sản phẩm..."
                  className="w-full border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </label>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => reload()}
                  className="mt-2 font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Thử tải lại
                </button>
              </div>
            )}

            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="aspect-square bg-cream-dark" />
                    <div className="space-y-2 p-4">
                      <div className="h-4 w-3/4 rounded bg-cream-dark" />
                      <div className="h-4 w-1/2 rounded bg-cream-dark" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-cream-dark bg-white px-4 py-12 text-center sm:px-6 sm:py-16">
                <p className="font-medium text-gray-700">
                  {filters.search ? `Không tìm thấy sản phẩm "${filters.search}"` : 'Không có sản phẩm trong danh mục này'}
                </p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} onOpenDetail={setDetailProduct} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-sm text-gray-500 sm:text-left">
                  Trang {filters.page} / {totalPages}
                </p>
                <div className="flex justify-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    disabled={filters.page <= 1}
                    onClick={() => handlePageChange(filters.page - 1)}
                    className="rounded-full border border-cream-dark bg-white px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={filters.page >= totalPages}
                    onClick={() => handlePageChange(filters.page + 1)}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
      />
    </>
  )
}

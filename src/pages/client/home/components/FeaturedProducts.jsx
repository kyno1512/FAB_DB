import { useState } from 'react'
import { Link, generatePath } from 'react-router-dom'
import { container, sectionTitle } from '../../../../lib/classes'
import { IconPlus } from '../../../../components/ui/icons'
import { paths } from '../../../../routes/paths'
import { useHomeProducts } from '../../../../hooks/useHomeProducts'
import { getDiscountPercent } from '../../../../lib/productPrice'
import ProductPriceBlock from '../../products/components/ProductPriceBlock'
import ProductQuickViewModal from '../../../../components/ProductQuickViewModal'

export default function FeaturedProducts() {
  const { products, loading } = useHomeProducts()
  const featured = products.slice(0, 8)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  return (
    <section id="san-pham" className="scroll-mt-28 py-10 sm:py-14 lg:py-16">
      <div className={container}>
        <div className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <h2 className={`${sectionTitle} mb-0 text-left`}>Sản Phẩm Nổi Bật</h2>
          <Link to={paths.PRODUCTS} className="shrink-0 text-sm font-semibold text-primary no-underline hover:underline">
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="aspect-square bg-cream-dark" />
                <div className="space-y-2 p-3 sm:p-4">
                  <div className="h-4 w-3/4 rounded bg-cream-dark" />
                  <div className="h-4 w-1/2 rounded bg-cream-dark" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cream-dark bg-white px-6 py-12 text-center">
            <p className="text-sm text-gray-600">Chưa có sản phẩm trên thực đơn.</p>
            <Link to={paths.PRODUCTS} className="mt-3 inline-block text-sm font-semibold text-primary no-underline hover:underline">
              Quay lại sau
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {featured.map((product) => {
              const discountPercent = getDiscountPercent(product.originalPrice, product.price)
              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-md [@media(max-width:639px)]:rounded-xl"
                >
                  <Link to={generatePath(paths.PRODUCT_DETAIL, { id: product.id })} className="block no-underline">
                    <div className="relative aspect-[4/3] overflow-hidden bg-cream sm:aspect-square [@media(max-width:639px)]:aspect-[1/1.18]">
                      <img src={product.image} alt={product.name} className="size-full object-cover" loading="lazy" />
                      {product.categoryName && (
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.65rem] font-bold uppercase text-primary shadow-sm">
                          {product.categoryName}
                        </span>
                      )}
                      {discountPercent != null && (
                        <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2 py-0.5 text-[0.65rem] font-bold text-white shadow-sm">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4">
                    <Link
                      to={generatePath(paths.PRODUCT_DETAIL, { id: product.id })}
                      className="line-clamp-2 text-[0.88rem] font-semibold leading-snug text-gray-800 no-underline hover:text-primary sm:text-[1rem]"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-[0.75rem] leading-relaxed text-gray-500 sm:mt-1.5 sm:text-sm">
                      {product.desc}
                    </p>
                    <div className="mt-2.5 flex items-end justify-between gap-2 sm:mt-3.5">
                      <ProductPriceBlock price={product.price} originalPrice={product.originalPrice} size="sm" />
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-dark sm:size-9"
                        aria-label={`Thêm ${product.name}`}
                      >
                        <IconPlus />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  )
}

import { generatePath, useNavigate } from 'react-router-dom'
import { IconBell, IconPlus } from '../../../../components/ui/icons'
import { paths } from '../../../../routes/paths'
import { getDiscountPercent } from '../../../../lib/productPrice'
import ProductPriceBlock from './ProductPriceBlock'
import ProductThumbnail from './ProductThumbnail'
import StockBadge from './StockBadge'

export default function ProductCard({ product, onQuickView, onOpenDetail }) {
  const navigate = useNavigate()

  function handleOpenDetail() {
    onOpenDetail?.(product)
  }

  function handleAdd(e) {
    e.stopPropagation()
    if (onQuickView) {
      onQuickView(product)
    }
  }

  const discountPercent = getDiscountPercent(product.originalPrice, product.price)

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpenDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleOpenDetail()
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-cream">
        <ProductThumbnail
          src={product.image}
          name={product.name}
          categoryName={product.categoryName}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {product.categoryName && (
          <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-primary shadow-sm">
            {product.categoryName}
          </span>
        )}
        {discountPercent != null && (
          <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[0.65rem] font-bold text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/50 to-transparent p-2 transition duration-300 group-hover:translate-y-0">
          <p className="line-clamp-2 text-[0.65rem] leading-snug text-white/95">{product.desc}</p>
        </div>
        {!product.conHang && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
            <div className="rounded-full bg-white/95 px-4 py-2 shadow-lg">
              <span className="flex items-center gap-2 text-sm font-bold text-red-600">
                <IconBell className="size-4" />
                Hết hàng
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="line-clamp-2 min-h-[2rem] text-[0.8125rem] font-semibold leading-snug text-gray-800">{product.name}</h3>
        <div className="mt-1.5 flex items-end justify-between gap-1.5">
          <ProductPriceBlock price={product.price} originalPrice={product.originalPrice} size="sm" />
          <div className="flex shrink-0 items-center gap-1.5">
            <StockBadge conHang={product.conHang} coTheBan={product.coTheBan} />
            {product.conHang && (
              <button
                type="button"
                onClick={handleAdd}
                className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-white shadow-sm transition hover:bg-primary-dark sm:size-8"
                aria-label={`Thêm ${product.name}`}
              >
                <IconPlus />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

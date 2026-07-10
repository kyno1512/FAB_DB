import { Link, generatePath } from 'react-router-dom'
import { container, btnOutline, btnPrimary } from '../../../../lib/classes'
import { formatPrice } from '../../../../lib/formatPrice'
import { paths } from '../../../../routes/paths'
import { useHomeProducts } from '../../../../hooks/useHomeProducts'

export default function Hero() {
  const { products, loading } = useHomeProducts()
  const highlight = products[0]
  const secondary = products[1] ?? products[0]

  return (
    <section className="overflow-hidden bg-gradient-to-br from-primary-dark to-primary px-0 py-10 text-white sm:py-14 lg:py-[72px]">
      <div className={`${container} grid items-center gap-8 lg:grid-cols-2 lg:gap-12`}>
        <div className="max-w-xl">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/75 sm:text-xs">Flygo Bakery</p>
          <h1 className="mt-2 max-w-[11ch] font-display text-[2rem] font-bold leading-[1.08] sm:max-w-none sm:text-4xl lg:text-5xl">
            Bánh tươi & cà phê mỗi ngày
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed opacity-90 sm:text-base">
            Đặt online giao nhanh — thực đơn cập nhật trực tiếp từ tiệm, không qua nội dung mẫu.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Link to={paths.PRODUCTS} className={`${btnPrimary} inline-flex w-full justify-center px-7 no-underline sm:w-auto`}>
              Đặt hàng ngay
            </Link>
            <Link to={paths.PRODUCTS} className={`${btnOutline} inline-flex w-full justify-center no-underline sm:w-auto`}>
              Xem thực đơn
            </Link>
          </div>
          {!loading && products.length > 0 && (
            <p className="mt-5 text-sm text-white/80">
              {products.length}+ món đang bán · giao tại TP.HCM
            </p>
          )}
        </div>

        <div className="relative mx-auto h-[260px] w-full max-w-[420px] sm:h-[320px] lg:mx-0 lg:h-[340px] lg:max-w-none">
          {loading ? (
            <div className="size-full animate-pulse rounded-2xl bg-white/10" />
          ) : highlight ? (
            <>
              <Link
                to={generatePath(paths.PRODUCT_DETAIL, { id: highlight.id })}
                className="absolute left-3 top-4 z-20 block size-[160px] overflow-hidden rounded-2xl shadow-lg sm:left-8 sm:top-5 sm:size-[220px]"
              >
                <img src={highlight.image} alt={highlight.name} className="size-full object-cover" />
              </Link>
              {secondary && (
                <Link
                  to={generatePath(paths.PRODUCT_DETAIL, { id: secondary.id })}
                  className="absolute bottom-0 right-2 z-10 block size-[145px] overflow-hidden rounded-2xl shadow-lg sm:right-5 sm:size-[200px]"
                >
                  <img src={secondary.image} alt={secondary.name} className="size-full object-cover" />
                </Link>
              )}
              <div className="absolute right-3 top-0 z-30 max-w-[180px] rounded-[10px] bg-white px-3.5 py-2.5 text-gray-800 shadow-sm sm:right-[60px]">
                <p className="text-xs font-bold text-primary">Món nổi bật</p>
                <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug">{highlight.name}</p>
                <p className="mt-1 text-xs text-gray-500">{formatPrice(highlight.price)}</p>
              </div>
            </>
          ) : (
            <div className="grid size-full place-items-center rounded-2xl border border-dashed border-white/30 text-sm text-white/70">
              Thêm sản phẩm để hiển thị banner
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

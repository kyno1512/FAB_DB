import { Link, generatePath } from 'react-router-dom'
import { useMemo } from 'react'
import { btnPrimary, container, sectionTitle } from '../../../../lib/classes'
import { formatPrice } from '../../../../lib/formatPrice'
import { buildSuggestedCombo } from '../../../../lib/mapProduct'
import { useHomeProducts } from '../../../../hooks/useHomeProducts'
import { useCart } from '../../../../context/CartContext'
import { paths } from '../../../../routes/paths'

export default function AiCombo() {
  const { products, loading } = useHomeProducts()
  const { addItem } = useCart()
  const combo = useMemo(() => buildSuggestedCombo(products), [products])

  async function handleAddCombo() {
    if (!combo) return
    for (const item of combo.items) {
      await addItem(item)
    }
  }

  return (
    <section id="combo" className="scroll-mt-28 py-16">
      <div className={container}>
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className={`${sectionTitle} mb-0`}>Combo Gợi Ý Hôm Nay</h2>
          <Link to={paths.PRODUCTS} className="text-sm font-semibold text-primary no-underline hover:underline">
            Xem thực đơn →
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            Đang gợi ý combo...
          </div>
        ) : !combo ? (
          <div className="rounded-2xl border border-dashed border-cream-dark bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-600">Chưa có sản phẩm để gợi ý combo.</p>
            <Link
              to={paths.PRODUCTS}
              className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline"
            >
              Khám phá thực đơn
            </Link>
          </div>
        ) : (
          <div className="grid items-center gap-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8 lg:grid-cols-2 lg:gap-10 lg:p-10">
            <div>
              <span className="text-sm font-semibold text-primary">Gợi ý từ thực đơn Flygo</span>
              <h3 className="mt-2 font-display text-2xl font-semibold text-gray-800">{combo.title}</h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                {combo.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <Link
                      to={generatePath(paths.PRODUCT_DETAIL, { id: item.id })}
                      className="font-medium text-gray-800 no-underline hover:text-primary hover:underline"
                    >
                      1× {item.name}
                    </Link>
                    <span className="shrink-0 font-semibold text-primary">{formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 text-2xl font-bold text-primary">{formatPrice(combo.total)}</div>
              <button type="button" onClick={handleAddCombo} className={`${btnPrimary} mt-5 w-auto px-8`}>
                Thêm combo vào giỏ hàng
              </button>
            </div>

            <div className="relative mx-auto h-[240px] w-full max-w-[360px] sm:h-[260px]">
              {combo.items[0] && (
                <img
                  src={combo.items[0].image}
                  alt={combo.items[0].name}
                  className="absolute left-0 top-0 z-20 size-[180px] rounded-2xl object-cover shadow-lg sm:size-[200px]"
                />
              )}
              {combo.items[1] && (
                <img
                  src={combo.items[1].image}
                  alt={combo.items[1].name}
                  className="absolute bottom-0 right-0 z-10 size-[160px] rounded-2xl object-cover shadow-lg sm:size-[180px]"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

import { Link, generatePath } from 'react-router-dom'
import { container, sectionTitle } from '../../../../lib/classes'
import { useHomeProducts } from '../../../../hooks/useHomeProducts'
import { paths } from '../../../../routes/paths'

export default function InstagramGallery() {
  const { products, loading } = useHomeProducts()
  const gallery = products.filter((p) => p.image).slice(0, 6)

  return (
    <section className="pb-20 pt-16">
      <div className={container}>
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className={`${sectionTitle} mb-0`}>Thực Đơn Flygo</h2>
          <Link to={paths.PRODUCTS} className="text-sm font-semibold text-primary no-underline hover:underline">
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-[10px] bg-cream-dark" />
            ))}
          </div>
        ) : gallery.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Chưa có hình ảnh sản phẩm.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {gallery.map((product) => (
              <Link
                key={product.id}
                to={generatePath(paths.PRODUCT_DETAIL, { id: product.id })}
                className="group aspect-square overflow-hidden rounded-[10px] no-underline"
                title={product.name}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="size-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

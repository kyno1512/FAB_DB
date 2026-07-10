import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { container, sectionTitle } from '../../../../lib/classes'
import { IconStar } from '../../../../components/ui/icons'
import { fetchFeaturedReviews, useHomeProducts } from '../../../../hooks/useHomeProducts'
import { paths } from '../../../../routes/paths'

function ReviewCard({ review }) {
  return (
    <article className="rounded-2xl bg-cream p-6 text-left sm:p-8">
      <div className="mb-3 flex gap-1 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < review.rating ? '' : 'opacity-30'}>
            <IconStar />
          </span>
        ))}
      </div>
      <p className="text-sm italic leading-relaxed text-gray-600 sm:text-base">
        &ldquo;{review.content}&rdquo;
      </p>
      <div className="mt-5">
        <p className="font-semibold text-gray-800">{review.name}</p>
        <p className="text-xs text-gray-500">Mua {review.productName}</p>
      </div>
    </article>
  )
}

export default function Testimonials() {
  const { products, loading: loadingProducts } = useHomeProducts()
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  useEffect(() => {
    if (loadingProducts) return
    if (!products.length) {
      setReviews([])
      setLoadingReviews(false)
      return
    }

    fetchFeaturedReviews(products)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false))
  }, [loadingProducts, products])

  const loading = loadingProducts || loadingReviews

  return (
    <section className="bg-white py-16">
      <div className={container}>
        <h2 className={sectionTitle}>Khách Hàng Nói Gì Về Flygo</h2>

        {loading ? (
          <div className="mx-auto max-w-[640px] animate-pulse rounded-2xl bg-cream p-10">
            <div className="mx-auto h-4 w-32 rounded bg-cream-dark" />
            <div className="mx-auto mt-4 h-16 w-full rounded bg-cream-dark" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mx-auto max-w-[640px] rounded-2xl border border-dashed border-cream-dark bg-cream/60 p-10 text-center">
            <p className="text-sm text-gray-600">Chưa có đánh giá từ khách hàng.</p>
            <p className="mt-1 text-xs text-gray-500">Mua và đánh giá sản phẩm để chia sẻ trải nghiệm nhé!</p>
            <Link
              to={paths.PRODUCTS}
              className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-primary-dark"
            >
              Xem thực đơn
            </Link>
          </div>
        ) : reviews.length === 1 ? (
          <div className="mx-auto max-w-[640px]">
            <ReviewCard review={reviews[0]} />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

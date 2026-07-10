import { useEffect, useState } from 'react'
import { createProductReview, getProductReviews } from '../../../../services/productService'
import StarRating from './StarRating'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('vi-VN')
}

function getInitial(name) {
  const text = name?.trim()
  return text ? text.charAt(0).toUpperCase() : 'K'
}

export default function ProductReviewSection({ productId, onSummaryChange }) {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({ average: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')

  async function loadReviews() {
    setLoading(true)
    setError('')

    try {
      const data = await getProductReviews(productId)
      const nextSummary = {
        average: data.diemTrungBinh ?? 0,
        total: data.tongDanhGia ?? 0,
      }

      setReviews(data.items ?? [])
      setSummary(nextSummary)
      onSummaryChange?.(nextSummary)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [productId])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (rating < 1) {
      setError('Vui lòng chọn số sao trước khi gửi.')
      setSubmitting(false)
      return
    }

    try {
      await createProductReview(productId, {
        diem: rating,
        noiDung: content.trim(),
      })
      setContent('')
      setRating(0)
      setSuccess('Cảm ơn bạn đã đánh giá sản phẩm!')
      await loadReviews()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
      {/* Tổng quan đánh giá */}
      <div className="flex flex-col gap-4 border-b border-cream-dark px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary/10 font-display text-2xl font-bold text-primary">
            {summary.average.toFixed(1)}
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-gray-800 sm:text-xl">
              Đánh giá & bình luận
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StarRating value={summary.average} size="sm" />
              <span className="text-sm text-gray-500">{summary.total} đánh giá</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form gửi đánh giá */}
      <form onSubmit={handleSubmit} className="border-b border-cream-dark px-5 py-5 sm:px-6">
        <div className="flex gap-3 sm:gap-4">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white sm:size-11"
            aria-hidden="true"
          >
            
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800">Viết đánh giá của bạn</p>

            <div className="mt-3 rounded-xl bg-cream/50 px-4 py-3">
              <p className="mb-2 text-xs font-medium text-gray-600">Chọn số sao</p>
              <StarRating value={rating} size="lg" onChange={setRating} />
            </div>

            <textarea
              id="review-content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm về sản phẩm..."
              className="mt-3 w-full resize-none rounded-xl border border-cream-dark bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

            {(error || success) && (
              <p className={`mt-3 text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
                {error || success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </div>
      </form>

      {/* Danh sách đánh giá */}
      <div className="px-5 py-5 sm:px-6">
        <p className="mb-4 text-sm font-semibold text-gray-800">
          Bình luận ({summary.total})
        </p>

        {loading ? (
          <p className="py-6 text-center text-sm text-gray-400">Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cream-dark bg-cream/30 px-4 py-8 text-center">
            <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>
            <p className="mt-1 text-xs text-gray-400">Hãy là người đầu tiên chia sẻ nhé!</p>
          </div>
        ) : (
          <ul className="divide-y divide-cream-dark">
            {reviews.map((review) => (
              <li key={review.maDanhGia} className="flex gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
                <div
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-sm font-bold text-primary sm:size-11"
                  aria-hidden="true"
                >
                  {getInitial(review.hoTen)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{review.hoTen}</p>
                      <StarRating value={review.diem} size="sm" className="mt-1" />
                    </div>
                    <time className="text-xs text-gray-400">{formatDate(review.ngayTao)}</time>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{review.noiDung}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

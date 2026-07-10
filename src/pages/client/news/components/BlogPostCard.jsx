import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getNewsImageUrl, NEWS_PLACEHOLDER_IMAGE } from '../../../../lib/mediaUrl'
import { paths } from '../../../../routes/paths'

const CATEGORY_STYLES = {
  'bánh ngọt': 'bg-rose-500/90 text-white',
  'pha chế': 'bg-emerald-600/90 text-white',
  'kỹ thuật làm bánh': 'bg-sky-600/90 text-white',
  'công thức': 'bg-amber-500/90 text-white',
  'tin tức': 'bg-primary/90 text-white',
}

function getCategoryStyle(category) {
  if (!category) return 'bg-gray-800/80 text-white'
  return CATEGORY_STYLES[category.toLowerCase()] ?? 'bg-primary/90 text-white'
}

export function formatPostDate(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  const formatted = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function estimateReadMinutes(text) {
  if (!text) return 3
  const words = text.trim().split(/\s+/).length
  return Math.max(2, Math.min(8, Math.ceil(words / 40)))
}

function PostImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false)
  const imageSrc = failed ? NEWS_PLACEHOLDER_IMAGE : src

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function CategoryBadge({ category, className = '' }) {
  if (!category) return null
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm ${getCategoryStyle(category)} ${className}`}
    >
      {category}
    </span>
  )
}

export default function BlogPostCard({ post, featured = false }) {
  const imageSrc = getNewsImageUrl(post.image)
  const readMin = estimateReadMinutes(post.excerpt)

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_-24px_rgba(26,83,92,0.35)] ring-1 ring-black/[0.04] lg:grid lg:min-h-[420px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-full">
          <PostImage
            src={imageSrc}
            alt={post.title}
            className="size-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/10" />
          <div className="absolute left-5 top-5 lg:left-6 lg:top-6">
            <CategoryBadge category={post.category} />
          </div>
        </div>

        <div className="relative flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/[0.06] blur-2xl" aria-hidden />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-400">
              {post.date && <time dateTime={post.date}>{formatPostDate(post.date)}</time>}
              <span className="size-1 rounded-full bg-gray-300" />
              <span>{readMin} phút đọc</span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-gray-900 sm:text-[2rem] lg:text-[2.15rem]">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">{post.excerpt}</p>
            )}
            <Link
              to={paths.NEWS}
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white no-underline shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              Đọc bài viết
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-cream-dark/70 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/15 hover:shadow-[0_16px_40px_-20px_rgba(26,83,92,0.28)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <PostImage
          src={imageSrc}
          alt={post.title}
          className="size-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="absolute left-4 top-4">
          <CategoryBadge category={post.category} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {post.date && <time dateTime={post.date}>{formatPostDate(post.date)}</time>}
          <span className="size-1 rounded-full bg-gray-300" />
          <span>{readMin} phút</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-gray-900 sm:text-xl">{post.title}</h3>
        {post.excerpt && (
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">{post.excerpt}</p>
        )}
        <Link
          to={paths.NEWS}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline transition group-hover:gap-2.5"
        >
          Xem tiếp
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

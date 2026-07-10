import { useEffect, useMemo, useState } from 'react'
import PageHero from '../../../components/common/PageHero'
import { container } from '../../../lib/classes'
import { blogPosts as fallbackPosts } from '../../../data/clientData'
import { getPublishedNews } from '../../../services/newsService'
import { getNewsImageUrl } from '../../../lib/mediaUrl'
import BlogPostCard from './components/BlogPostCard'

function mapPost(row) {
  return {
    id: row.maTinTuc,
    title: row.tieuDe,
    category: row.danhMuc,
    date: row.ngayDang,
    excerpt: row.tomTat,
    image: getNewsImageUrl(row.anhDaiDien),
  }
}

function NewsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-[420px] rounded-[28px] bg-white/80" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-[22px] bg-white/80" />
        ))}
      </div>
    </div>
  )
}

export default function NewsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    setLoading(true)
    getPublishedNews()
      .then((data) => {
        const rows = Array.isArray(data) ? data.map(mapPost) : []
        setPosts(rows.length > 0 ? rows : fallbackPosts)
      })
      .catch(() => setPosts(fallbackPosts))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const unique = [...new Set(posts.map((p) => p.category).filter(Boolean))]
    return unique.sort((a, b) => a.localeCompare(b, 'vi'))
  }, [posts])

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return posts
    return posts.filter((p) => p.category === activeCategory)
  }, [posts, activeCategory])

  const showFeaturedLayout = filtered.length >= 2
  const featured = showFeaturedLayout ? filtered[0] : null
  const rest = showFeaturedLayout ? filtered.slice(1) : filtered

  return (
    <>
      <PageHero
        eyebrow="Flygo Blog"
        title="Tin tức & Bí quyết"
        description="Công thức, mẹo pha chế và câu chuyện từ bếp Flygo — cập nhật hàng tuần."
      />

      <div className="relative overflow-hidden bg-cream pb-16 pt-8 sm:pb-20 sm:pt-10">
        <div
          className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-primary/[0.05] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 bottom-0 size-80 rounded-full bg-amber-200/20 blur-3xl"
          aria-hidden
        />

        <div className={`${container} relative`}>
          {!loading && posts.length > 0 && (
            <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <FilterChip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
                  Tất cả
                </FilterChip>
                {categories.map((cat) => (
                  <FilterChip
                    key={cat}
                    active={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </FilterChip>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <strong className="font-semibold text-gray-700">{filtered.length}</strong> bài viết
              </p>
            </div>
          )}

          {loading ? (
            <NewsSkeleton />
          ) : filtered.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-cream-dark bg-white/70 px-6 py-16 text-center">
              <p className="font-display text-xl font-semibold text-gray-800">Chưa có bài viết</p>
              <p className="mt-2 text-sm text-gray-500">Flygo sẽ cập nhật tin tức mới sớm nhất.</p>
            </div>
          ) : (
            <>
              {featured && (
                <section className="mb-10 lg:mb-14">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                      Nổi bật
                    </span>
                  </div>
                  <BlogPostCard post={featured} featured />
                </section>
              )}

              {rest.length > 0 && (
                <section>
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mới nhất</p>
                      <h2 className="mt-1 font-display text-2xl font-bold text-gray-900">
                        {showFeaturedLayout ? 'Bài viết khác' : 'Tất cả bài viết'}
                      </h2>
                    </div>
                  </div>

                  {rest.length === 1 && !showFeaturedLayout ? (
                    <div className="mx-auto max-w-3xl">
                      <BlogPostCard post={rest[0]} featured />
                    </div>
                  ) : rest.length <= 2 ? (
                    <div className="grid gap-5 lg:grid-cols-2">
                      {rest.map((post) => (
                        <BlogPostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {rest.map((post) => (
                        <BlogPostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {!showFeaturedLayout && filtered.length === 1 && (
                <section className="mt-10">
                  <div className="rounded-[24px] border border-primary/10 bg-gradient-to-br from-white to-primary/[0.04] p-6 sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Gợi ý đọc thêm</p>
                    <p className="mt-2 font-display text-lg font-semibold text-gray-800">
                      Khám phá thêm công thức và mẹo từ bếp Flygo
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
                      Theo dõi trang tin tức để nhận bài viết mới về bánh ngọt, pha chế và kỹ thuật làm bánh mỗi tuần.
                    </p>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function FilterChip({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-primary text-white shadow-md shadow-primary/20'
          : 'border border-cream-dark bg-white text-gray-600 hover:border-primary/25 hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}

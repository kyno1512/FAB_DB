import { Link } from 'react-router-dom'
import { container, sectionTitle } from '../../../../lib/classes'
import { blogPosts } from '../../../../data/clientData'
import { paths } from '../../../../routes/paths'
import BlogPostCard from '../../news/components/BlogPostCard'

export default function BlogSection() {
  const previewPosts = blogPosts.slice(0, 3)

  return (
    <section className="py-16">
      <div className={container}>
        <div className="mb-9 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Flygo Blog</p>
            <h2 className={`${sectionTitle} mb-0 mt-1 text-left`}>Bí Quyết Từ Bếp Flygo</h2>
          </div>
          <Link
            to={paths.NEWS}
            className="rounded-full border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary no-underline transition hover:bg-primary-light"
          >
            Xem tất cả tin tức →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {previewPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

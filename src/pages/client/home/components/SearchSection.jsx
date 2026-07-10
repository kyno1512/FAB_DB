import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { container } from '../../../../lib/classes'
import { buildProductUrl } from '../../../../lib/productUrls'
import { IconSearch } from '../../../../components/ui/icons'
import { getSearchTags } from '../../../../services/productService'

export default function SearchSection() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(true)

  useEffect(() => {
    getSearchTags()
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => setTags([]))
      .finally(() => setLoadingTags(false))
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    const keyword = query.trim()
    if (!keyword) return
    navigate(buildProductUrl({ search: keyword }))
  }

  function handleTagClick(tag) {
    if (tag.maDanhMuc) {
      navigate(buildProductUrl({ danhMuc: tag.maDanhMuc }))
      return
    }

    navigate(buildProductUrl({ search: tag.search || tag.label }))
  }

  return (
    <section className="py-10 text-center sm:py-12">
      <div className={container}>
        <h2 className="font-display text-[1.35rem] font-semibold sm:text-[1.6rem]">Hôm nay bạn muốn thưởng thức gì?</h2>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-5 flex max-w-[640px] items-center gap-2.5 rounded-full bg-white px-4 py-3 shadow-sm sm:mt-6 sm:gap-3 sm:px-6 sm:py-4"
        >
          <span className="shrink-0 text-gray-500">
            <IconSearch />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bánh, cà phê, combo..."
            className="w-full border-none text-sm outline-none sm:text-base"
          />
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-5 sm:gap-2.5">
          {loadingTags ? (
            <span className="text-sm text-gray-400">Đang tải gợi ý...</span>
          ) : tags.length === 0 ? (
            <span className="text-sm text-gray-400">Chưa có gợi ý tìm kiếm</span>
          ) : (
            tags.map((tag) => (
              <button
                key={`${tag.maDanhMuc ?? tag.search ?? tag.label}`}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="cursor-pointer rounded-full border border-cream-dark bg-white px-3.5 py-1.5 text-[0.8rem] transition hover:border-primary hover:bg-primary-light sm:px-4 sm:py-2 sm:text-sm"
              >
                {tag.label}
                {tag.count > 0 && <span className="text-gray-500"> {tag.count}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

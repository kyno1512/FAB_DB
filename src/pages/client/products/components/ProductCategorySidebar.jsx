import { Link, useSearchParams } from 'react-router-dom'
import { buildProductUrl, parseProductParams } from '../../../../lib/productUrls'
import { useCategories } from '../../../../hooks/useCategories'

function useCategoryLinks() {
  const { categories, loading } = useCategories()
  const [searchParams] = useSearchParams()
  const { danhMuc, search, sort } = parseProductParams(searchParams)

  const items = [
    { id: 'all', label: 'Tất cả', to: buildProductUrl({ search, sort }), active: !danhMuc },
    ...categories.map((cat) => ({
      id: cat.maDanhMuc,
      label: cat.tenDanhMuc,
      to: buildProductUrl({ danhMuc: cat.maDanhMuc, search, sort }),
      active: String(cat.maDanhMuc) === danhMuc,
    })),
  ]

  return { items, loading }
}

function chipClass(active) {
  return `shrink-0 rounded-full px-4 py-2 text-sm font-medium no-underline transition ${
    active
      ? 'bg-primary text-white shadow-sm'
      : 'border border-cream-dark bg-white text-gray-600 hover:border-primary hover:text-primary'
  }`
}

function sidebarLinkClass(active) {
  return `block rounded-[10px] px-3.5 py-2.5 text-sm font-medium no-underline transition ${
    active
      ? 'bg-primary text-white'
      : 'text-gray-600 hover:bg-primary-light hover:text-primary'
  }`
}

export function ProductCategoryChips() {
  const { items, loading } = useCategoryLinks()

  return (
    <nav
      aria-label="Lọc danh mục"
      className="flex gap-2 overflow-x-auto px-4 pb-1 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {loading ? (
        <span className="px-3 py-2 text-sm text-gray-400">Đang tải...</span>
      ) : (
        items.map((item) => (
          <Link key={item.id} to={item.to} className={chipClass(item.active)}>
            {item.label}
          </Link>
        ))
      )}
    </nav>
  )
}

export default function ProductCategorySidebar() {
  const { items, loading } = useCategoryLinks()

  return (
    <aside className="rounded-2xl border border-cream-dark bg-white p-4 shadow-sm ring-1 ring-black/5">
      <p className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
        Danh mục
      </p>

      <nav className="flex flex-col gap-1">
        {loading ? (
          <p className="px-3 py-2 text-sm text-gray-400">Đang tải...</p>
        ) : (
          items.map((item) => (
            <Link key={item.id} to={item.to} className={sidebarLinkClass(item.active)}>
              {item.id === 'all' ? 'Tất cả sản phẩm' : item.label}
            </Link>
          ))
        )}
      </nav>
    </aside>
  )
}

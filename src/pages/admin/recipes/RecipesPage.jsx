import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'
import { showSuccess } from '../../../lib/swal'
import { getProductImageUrl } from '../../../lib/productImage'
import { IconSearch } from '../dashboard/components/adminIcons'
import MenuPagination from '../menu/components/MenuPagination'
import RecipeEditModal from './components/RecipeEditModal'
import { getRecipeStats, getRecipes } from '../../../services/recipeAdminService'

const PAGE_SIZE = 8

function StatCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'border-gray-200 bg-white',
    ok: 'border-emerald-200 bg-emerald-50/80',
    warn: 'border-amber-200 bg-amber-50/80',
  }
  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )
}

export default function RecipesPage() {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState({ tongMon: 0, daCoCongThuc: 0, chuaCoCongThuc: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [editProduct, setEditProduct] = useState(null)

  const debouncedSearch = useDebounce(search.trim(), 250)

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [listData, statsData] = await Promise.all([
        getRecipes({
          page,
          pageSize: PAGE_SIZE,
          search: debouncedSearch || undefined,
          filter: filter === 'all' ? undefined : filter,
        }),
        getRecipeStats(),
      ])
      setItems(listData.items ?? [])
      setTotalCount(listData.totalCount ?? 0)
      setTotalPages(Math.ceil((listData.totalCount ?? 0) / PAGE_SIZE) || 0)
      setStats(statsData ?? { tongMon: 0, daCoCongThuc: 0, chuaCoCongThuc: 0 })
    } catch (err) {
      setError(err.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filter])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filter])

  const filterLabel = useMemo(
    () => ({
      all: 'Tất cả món',
      hasBom: 'Đã có công thức',
      noBom: 'Chưa có công thức',
    }),
    [],
  )

  async function handleSaved() {
    setEditProduct(null)
    await showSuccess('Đã lưu công thức nguyên liệu.')
    await fetchList()
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-800">Công thức nguyên liệu</h1>
        <p className="mt-1 text-sm text-gray-500">
          Định mức nguyên liệu cho từng món — dùng để kiểm tra và trừ tồn kho khi khách đặt hàng.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Tổng món (trừ combo)" value={stats.tongMon} />
        <StatCard label="Đã có công thức" value={stats.daCoCongThuc} tone="ok" />
        <StatCard label="Chưa có công thức" value={stats.chuaCoCongThuc} tone="warn" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            placeholder="Tìm món..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {Object.entries(filterLabel).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-3">
          <span className="text-sm text-gray-500">{totalCount} món</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Món</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Công thức</th>
              <th className="px-4 py-3">Có thể bán</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  Không có món nào.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.maSanPham}
                  className={`border-b border-gray-50 transition ${
                    item.coCongThuc ? 'cursor-pointer hover:bg-gray-50/80' : ''
                  }`}
                  onClick={() => item.coCongThuc && setEditProduct(item)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getProductImageUrl({
                          hinhAnhChinh: item.hinhAnhChinh,
                          tenSanPham: item.tenSanPham,
                          tenDanhMuc: item.tenDanhMuc,
                        })}
                        alt=""
                        className="size-10 rounded-lg object-cover"
                      />
                      <span className="font-medium text-gray-800">{item.tenSanPham}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.tenDanhMuc}</td>
                  <td className="px-4 py-3">
                    {item.coCongThuc ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        {item.soDongCongThuc} nguyên liệu
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        Chưa khai báo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!item.coCongThuc ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : item.soLuongCoTheBan <= 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                        Hết hàng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        Còn {item.soLuongCoTheBan.toLocaleString('vi-VN')} phần
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${item.trangThai ? 'text-emerald-600' : 'text-gray-400'}`}
                    >
                      {item.trangThai ? 'Đang bán' : 'Ngưng bán'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title="Sửa công thức"
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditProduct(item)
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <MenuPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {editProduct && (
        <RecipeEditModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={handleSaved}
        />
      )}
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from '../../../../hooks/useDebounce'
import { deleteInventoryMovements, getInventoryMovements } from '../../../../services/inventoryAdminService'
import { confirmAction, showError, showSuccess } from '../../../../lib/swal'
import HistoryCreateModal from './HistoryCreateModal'
import MenuPagination from '../../menu/components/MenuPagination'

const QUICK_RANGES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: '7 ngày' },
  { id: 'month', label: 'Tháng này' },
]

const TYPE_FILTERS = [
  { id: '', label: 'Tất cả loại' },
  { id: 'Nhap', label: 'Nhập' },
  { id: 'Xuat', label: 'Xuất' },
]

const SEARCH_HINTS = [
  'Phiếu nhập',
  'Phiếu xuất',
  'Đơn hàng',
  'Tiêu thụ ngày',
  'PX',
  'PN',
]

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function resolveRange(rangeId) {
  const now = new Date()
  if (rangeId === 'today') return { from: startOfDay(now), to: endOfDay(now) }
  if (rangeId === 'week') {
    const from = new Date(now)
    from.setDate(from.getDate() - 6)
    return { from: startOfDay(from), to: endOfDay(now) }
  }
  if (rangeId === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: startOfDay(from), to: endOfDay(now) }
  }
  return { from: null, to: null }
}

export default function InventoryHistoryTab({ items, onCreateMovement, onChanged }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quickRange, setQuickRange] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loai, setLoai] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const debouncedSearch = useDebounce(search.trim(), 250)

  const suggestions = useMemo(() => {
    const names = items.map((item) => item.tenNguyenLieu)
    return [...new Set([...names, ...SEARCH_HINTS])]
  }, [items])

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const range = resolveRange(quickRange)
      const from = dateFrom ? startOfDay(dateFrom) : range.from
      const to = dateTo ? endOfDay(dateTo) : range.to
      const data = await getInventoryMovements({
        limit: 300,
        from: from ? from.toISOString() : undefined,
        to: to ? to.toISOString() : undefined,
        search: debouncedSearch || undefined,
        loai: loai || undefined,
      })
      setRows(Array.isArray(data) ? data : [])
      setSelectedIds([])
    } catch (err) {
      setError(err.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [quickRange, dateFrom, dateTo, debouncedSearch, loai])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    setPage(1)
  }, [quickRange, dateFrom, dateTo, debouncedSearch, loai])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, safePage, pageSize])

  const pageIds = useMemo(() => pagedRows.map((row) => row.maLichSu), [pagedRows])
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id))

  function toggleAllPage() {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)))
      return
    }
    setSelectedIds((prev) => [...new Set([...prev, ...pageIds])])
  }

  function toggleOne(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa ${selectedIds.length} bản ghi lịch sử?`,
      text: 'Tồn kho sẽ được hoàn tác theo từng dòng đã chọn.',
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    try {
      await deleteInventoryMovements(selectedIds)
      await showSuccess(`Đã xóa ${selectedIds.length} bản ghi.`)
      await onChanged?.()
      await loadHistory()
    } catch (err) {
      await showError(err.message)
    }
  }

  async function handleCreate(payload) {
    await onCreateMovement(payload)
    await onChanged?.()
    await loadHistory()
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {QUICK_RANGES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setQuickRange(item.id)
                if (item.id === 'all') {
                  setDateFrom('')
                  setDateTo('')
                }
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                quickRange === item.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            + Ghi biến động
          </button>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xóa đã chọn ({selectedIds.length})
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <label className="block lg:col-span-1">
          <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">Từ ngày</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setQuickRange('custom')
            }}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block lg:col-span-1">
          <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">Đến ngày</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              setQuickRange('custom')
            }}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block lg:col-span-1">
          <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">Loại</span>
          <select
            value={loai}
            onChange={(e) => setLoai(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {TYPE_FILTERS.map((item) => (
              <option key={item.id || 'all'} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block lg:col-span-1">
          <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">Tìm kiếm / gợi ý</span>
          <input
            list="history-search-suggestions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nguyên liệu, ghi chú..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <datalist id="history-search-suggestions">
            {suggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {SEARCH_HINTS.map((hint) => (
          <button
            key={hint}
            type="button"
            onClick={() => setSearch(hint)}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-primary hover:text-primary"
          >
            {hint}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-500">Đang tải lịch sử...</p>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">Không có bản ghi phù hợp bộ lọc.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAllPage}
                    aria-label="Chọn tất cả trang này"
                  />
                </th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Nguyên liệu</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Số lượng</th>
                <th className="px-4 py-3">Trước → Sau</th>
                <th className="px-4 py-3">Người thực hiện</th>
                <th className="px-4 py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {pagedRows.map((row) => (
                <tr key={row.maLichSu} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.maLichSu)}
                      onChange={() => toggleOne(row.maLichSu)}
                      aria-label={`Chọn ${row.tenNguyenLieu}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(row.ngayGhiNhan).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.tenNguyenLieu}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.loaiThayDoi === 'Nhap' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.loaiThayDoi === 'Nhap' ? 'Nhập' : 'Xuất'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {row.soLuongThayDoi > 0 ? '+' : ''}
                    {Number(row.soLuongThayDoi).toLocaleString('vi-VN')} {row.donVi}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {Number(row.soLuongTruoc).toLocaleString('vi-VN')} → {Number(row.soLuongSau).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.nguoiThucHien || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{row.ghiChu || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <MenuPagination
          page={safePage}
          totalPages={totalPages}
          totalCount={rows.length}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          itemLabel="bản ghi"
        />
      )}

      <HistoryCreateModal
        open={createOpen}
        items={items}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}

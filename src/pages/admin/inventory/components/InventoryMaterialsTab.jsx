import { useMemo, useState } from 'react'
import AdminTableActions, { AdminDeleteButton } from '../../../../components/AdminTableActions'
import { formatPrice } from '../../../../lib/formatPrice'
import { confirmAction, showSuccess } from '../../../../lib/swal'
import { IconSearch } from '../../dashboard/components/adminIcons'
import MenuPagination from '../../menu/components/MenuPagination'
import InventoryRecipeModal from './InventoryRecipeModal'
import LoModal from './LoModal'

const STATUS_LABELS = {
  DuHang: { label: 'Đủ hàng', className: 'bg-emerald-100 text-emerald-800' },
  SapHet: { label: 'Sắp hết', className: 'bg-amber-100 text-amber-800' },
  ThieuHang: { label: 'Thiếu hàng', className: 'bg-orange-100 text-orange-800' },
  HetHang: { label: 'Hết hàng', className: 'bg-red-100 text-red-800' },
}

const HSD_STATUS = {
  ConHan: { dot: 'bg-emerald-500', label: 'Còn hạn', textClass: 'text-emerald-600' },
  SapHetHan: { dot: 'bg-amber-500', label: 'Sắp hết hạn', textClass: 'text-amber-600' },
  DaHetHan: { dot: 'bg-red-500', label: 'Đã hết hạn', textClass: 'text-red-600' },
}

function getDaysRemaining(hanSuDung) {
  if (!hanSuDung) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(hanSuDung)
  expiry.setHours(0, 0, 0, 0)
  return Math.round((expiry - today) / (1000 * 60 * 60 * 24))
}

function formatDateOnly(value) {
  if (!value) return null
  const d = new Date(value)
  return d.toLocaleDateString('vi-VN')
}

function formatQty(value, unit) {
  const num = Number(value)
  if (Number.isNaN(num)) return `0 ${unit}`
  return `${num.toLocaleString('vi-VN')} ${unit}`
}

function formatDate(value) {
  if (!value) return null
  const parts = String(value).split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return String(value)
}


export default function InventoryMaterialsTab({
  items,
  loading,
  error,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  onCreate,
  page,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [deleting, setDeleting] = useState(false)
  const [recipeItem, setRecipeItem] = useState(null)
  const [batchItem, setBatchItem] = useState(null)

  const visibleIds = useMemo(() => items.map((item) => item.maNguyenLieu), [items])
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

  function toggleAll() {
    setSelectedIds(allSelected ? [] : visibleIds)
  }

  function toggleOne(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa ${selectedIds.length} nguyên liệu?`,
      text: 'Các mục đã chọn sẽ bị xóa khỏi kho.',
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    setDeleting(true)
    try {
      const count = selectedIds.length
      for (const id of selectedIds) {
        const item = items.find((x) => x.maNguyenLieu === id)
        if (item) await onDelete(item, { silent: true })
      }
      setSelectedIds([])
      await showSuccess(`Đã xóa ${count} nguyên liệu.`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-h-[42px] min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
          <IconSearch />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm nguyên liệu..."
            className="w-full border-none text-sm outline-none"
          />
        </label>

        <button
          type="button"
          onClick={onCreate}
          className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          + Thêm nguyên liệu
        </button>

        {selectedIds.length > 0 && (
          <AdminDeleteButton count={selectedIds.length} loading={deleting} onClick={handleDeleteSelected} />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-500">Đang tải nguyên liệu...</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">Chưa có nguyên liệu trong kho.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Chọn tất cả"
                      className="size-3.5 rounded border-gray-300 text-primary focus:ring-primary/30"
                    />
                  </th>
                  <th className="px-4 py-3">Nguyên liệu</th>
                  <th className="px-4 py-3">Tồn kho</th>
                  <th className="px-4 py-3">Tối thiểu</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hạn sử dụng</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((item) => {
                  const status = STATUS_LABELS[item.trangThaiTon] ?? STATUS_LABELS.DuHang
                  const isSelected = selectedIds.includes(item.maNguyenLieu)
                  return (
                    <tr
                      key={item.maNguyenLieu}
                      className={`hover:bg-gray-50/80 ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(item.maNguyenLieu)}
                          aria-label={`Chọn ${item.tenNguyenLieu}`}
                          className="size-3.5 rounded border-gray-300 text-primary focus:ring-primary/30"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setBatchItem(item)}
                            className="text-left"
                          >
                            <p className="font-semibold text-primary hover:underline">{item.tenNguyenLieu}</p>
                            {item.moTa && <p className="mt-0.5 text-xs text-gray-500">{item.moTa}</p>}
                          </button>
                          {item.tongSoLo > 0 && (
                            <button
                              type="button"
                              onClick={() => setBatchItem(item)}
                              className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20"
                              title="Xem danh sách lô"
                            >
                              {item.tongSoLo} lô
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatQty(item.soLuongTon, item.donVi)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatQty(item.mucTonToiThieu, item.donVi)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const hsd = HSD_STATUS[item.trangThaiHSD] ?? HSD_STATUS.ConHan
                          const days = item.soNgayConLai
                          const hsdDate = item.hanSuDungTu
                          return (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1">
                                <span className={`size-1.5 rounded-full ${hsd.dot}`} />
                                <span className={`text-xs font-semibold ${hsd.textClass}`}>{hsd.label}</span>
                              </div>
                              {hsdDate && (
                                <span className="text-xs text-gray-500">
                                  {formatDateOnly(hsdDate)} · {days != null ? (days >= 0 ? `${days}d` : `Qúa ${Math.abs(days)}d`) : '—'}
                                </span>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <AdminTableActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <InventoryRecipeModal open={Boolean(recipeItem)} item={recipeItem} onClose={() => setRecipeItem(null)} />

          <LoModal open={Boolean(batchItem)} item={batchItem} onClose={() => setBatchItem(null)} />

          {totalCount > 0 && (
            <MenuPagination
              page={page}
              totalPages={Math.ceil(totalCount / pageSize) || 1}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              itemLabel="nguyên liệu"
            />
          )}
        </>
      )}
    </div>
  )
}

import { useEffect, useState, useRef } from 'react'
import { getLosByMaterial, deleteLo, updateLo } from '../../../../services/inventoryAdminService'
import { showError, showSuccess } from '../../../../lib/swal'
import { confirmAction } from '../../../../lib/swal'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import vi from 'date-fns/locale/vi'

// Custom styles for react-datepicker to match app design
const customStyles = `
  .react-datepicker__wrapper {
    position: relative;
    display: block;
  }
  .react-datepicker {
    font-family: inherit;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    padding: 12px;
  }
  .react-datepicker__header {
    background: white;
    border: none;
    padding-bottom: 8px;
  }
  .react-datepicker__current-month {
    font-weight: 600;
    color: #374151;
    font-size: 14px;
  }
  .react-datepicker__day-name {
    color: #9ca3af;
    font-weight: 500;
    font-size: 12px;
  }
  .react-datepicker__day {
    width: 36px;
    line-height: 36px;
    border-radius: 10px;
    color: #374151;
    font-size: 13px;
    transition: all 0.2s;
  }
  .react-datepicker__day:hover {
    background: #f3f4f6;
    border-radius: 10px;
  }
  .react-datepicker__day--selected, 
  .react-datepicker__day--keyboard-selected {
    background: #2563eb !important;
    color: white !important;
    border-radius: 10px;
    font-weight: 600;
  }
  .react-datepicker__day--disabled {
    color: #d1d5db;
    cursor: not-allowed;
  }
  .react-datepicker__day--outside-month {
    color: #d1d5db;
  }
  .react-datepicker__navigation {
    top: 8px;
  }
  .react-datepicker__navigation-icon::before {
    border-color: #6b7280;
  }
  .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
    border-color: #2563eb;
  }
  .react-datepicker__year-dropdown {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  .react-datepicker__year-option {
    padding: 8px 16px;
  }
  .react-datepicker__year-option:hover {
    background: #f3f4f6;
  }
`

function formatDate(value) {
  if (!value) return '—'
  const str = String(value).split('T')[0]
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return `${match[3]}/${match[2]}/${match[1]}`
  return '—'
}

// ========== Date Input ==========
function DateInput({ value, onChange, min, max }) {
  const dateValue = value ? new Date(value + 'T00:00:00') : null
  
  function handleChange(date) {
    if (!date) return
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
  }
  
  return (
    <div className="relative">
      <style>{customStyles}</style>
      <DatePicker
        selected={dateValue}
        onChange={handleChange}
        minDate={min ? new Date(min + 'T00:00:00') : null}
        maxDate={max ? new Date(max + 'T00:00:00') : null}
        dateFormat="dd/MM/yyyy"
        locale={vi}
        className="w-full cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:outline-none"
        placeholderText="DD/MM/YYYY"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={15}
        popperProps={{ strategy: 'fixed' }}
      />
    </div>
  )
}

function formatCurrency(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  return `${number.toLocaleString('vi-VN')}đ`
}

export default function LoModal({ open, item, onClose, onDeleted, onUpdated }) {
  const [los, setLos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!open || !item) return
    setLoading(true)
    setLos([])
    setEditingId(null)
    getLosByMaterial(item.maNguyenLieu)
      .then((data) => setLos(Array.isArray(data) ? data : []))
      .catch(() => setLos([]))
      .finally(() => setLoading(false))
  }, [open, item])

  if (!open) return null

  const totalValue = los.reduce((sum, lo) => sum + (Number(lo.soLuongCon) || 0) * (Number(lo.donGia) || 0), 0)

  const stockStatus = item?.trangThaiTon
  const stockStatusConfig = {
    BinhThuong: { emoji: '🟢', label: 'Bình thường', color: 'text-emerald-600' },
    SapHet: { emoji: '🟡', label: 'Sắp hết', color: 'text-amber-600' },
    HetHang: { emoji: '🔴', label: 'Hết hàng', color: 'text-red-600' },
  }
  const stockInfo = stockStatusConfig[stockStatus] || stockStatusConfig.BinhThuong

  async function handleDelete(lo) {
    const confirmed = await confirmAction({
      icon: 'warning',
      title: 'Xóa lô?',
      text: `Lô ${item?.tenNguyenLieu} (HSD: ${formatDate(lo.hanSuDung)}) sẽ bị xóa và tồn kho sẽ được cập nhật.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    setDeletingId(lo.maLo)
    try {
      await deleteLo(lo.maLo)
      setLos((prev) => prev.filter((x) => x.maLo !== lo.maLo))
      onDeleted?.(lo)
      await showSuccess('Đã xóa lô.')
    } catch (err) {
      await showError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  function startEdit(lo) {
    setEditingId(lo.maLo)
    setEditForm({
      ngaySanXuat: lo.ngaySanXuat || '',
      hanSuDung: lo.hanSuDung || '',
      donGia: lo.donGia ?? '',
      ghiChu: lo.ghiChu || '',
    })
  }

  async function handleSave(lo) {
    if (editForm.ngaySanXuat && editForm.hanSuDung) {
      if (editForm.hanSuDung <= editForm.ngaySanXuat) {
        await showError('Hạn sử dụng phải lớn hơn ngày sản xuất.')
        return
      }
    }
    setSaving(true)
    try {
      const payload = {
        ngaySanXuat: editForm.ngaySanXuat || null,
        hanSuDung: editForm.hanSuDung,
        donGia: Number(editForm.donGia) || 0,
        ghiChu: editForm.ghiChu || null,
      }
      await updateLo(lo.maLo, payload)
      setLos((prev) =>
        prev.map((x) =>
          x.maLo === lo.maLo
            ? { ...x, ...payload, ngaySanXuat: payload.ngaySanXuat, hanSuDung: payload.hanSuDung, donGia: payload.donGia, ghiChu: payload.ghiChu }
            : x
        )
      )
      setEditingId(null)
      onUpdated?.()
      await showSuccess('Đã cập nhật lô.')
    } catch (err) {
      await showError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[400] grid place-items-center bg-gradient-to-br from-black/50 to-black/30 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/8 via-primary/3 to-transparent px-7 py-6">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-primary/30"></div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-gray-900">{item?.tenNguyenLieu}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Đơn vị:</span>
                  <span className="font-semibold text-gray-800">{item?.donVi}</span>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Tổng tồn kho:</span>
                  <span className="font-semibold text-gray-800">{Number(item?.soLuongTon || 0).toLocaleString('vi-VN')}{item?.donVi}</span>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Mức tối thiểu:</span>
                  <span className="font-semibold text-gray-800">{Number(item?.mucTonToiThieu || 0).toLocaleString('vi-VN')}{item?.donVi}</span>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className={`flex items-center gap-1.5 font-semibold ${stockInfo.color}`}>
                  <span>Trạng thái kho:</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-base">{stockInfo.emoji}</span>
                    <span>{stockInfo.label}</span>
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Số lô:</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-bold text-primary">{los.length}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto bg-gray-50/30 p-6" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <div className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
              <p className="text-sm text-gray-500">Đang tải lô...</p>
            </div>
          ) : los.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-gray-100">
                <svg className="size-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Chưa có lô nào cho nguyên liệu này.</p>
              <p className="mt-1 text-xs text-gray-400">Nhập kho để tạo lô mới.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {los.map((lo, index) => {
                const daysLeft = lo.soNgayConLai != null ? Math.max(0, lo.soNgayConLai) : 0
                const isExpired = lo.tinhTrang === 'DaHetHan' || daysLeft <= 0
                const isWarning = lo.tinhTrang === 'SapHetHan' && daysLeft > 0
                
                const statusConfig = isExpired 
                  ? { dot: '🔴', label: 'Hết hạn', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', accent: 'bg-red-500' }
                  : isWarning 
                  ? { dot: '🟡', label: 'Sắp hết hạn', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', accent: 'bg-amber-500' }
                  : { dot: '🟢', label: 'Còn hạn', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: 'bg-emerald-500' }
                
                const batchValue = (Number(lo.soLuongCon) || 0) * (Number(lo.donGia) || 0)

                return (
                  <div
                    key={lo.maLo}
                    className={`group relative overflow-hidden rounded-2xl border ${statusConfig.border} bg-white shadow-sm transition-all hover:shadow-md`}
                  >
                    {/* Accent bar */}
                    <div className={`absolute left-0 top-0 h-full w-1 ${statusConfig.accent}`}></div>
                    
                    {editingId === lo.maLo ? (
                      // Edit mode
                      <div className="p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-bold text-white">LÔ #{lo.maLo}</span>
                          <span className="text-sm font-semibold text-gray-700">Đang chỉnh sửa</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <label className="block">
                            <span className="mb-1 block text-xs font-medium text-gray-600">Ngày sản xuất</span>
                            <DateInput
                              value={editForm.ngaySanXuat || ''}
                              onChange={(v) => setEditForm({ ...editForm, ngaySanXuat: v })}
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-xs font-medium text-gray-600">Hạn sử dụng</span>
                            <DateInput
                              value={editForm.hanSuDung || ''}
                              onChange={(v) => setEditForm({ ...editForm, hanSuDung: v })}
                              required
                              min={editForm.ngaySanXuat || undefined}
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-xs font-medium text-gray-600">Đơn giá</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={editForm.donGia}
                              onChange={(e) => setEditForm({ ...editForm, donGia: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-xs font-medium text-gray-600">Ghi chú</span>
                            <input
                              type="text"
                              value={editForm.ghiChu}
                              onChange={(e) => setEditForm({ ...editForm, ghiChu: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                              placeholder="..."
                            />
                          </label>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleSave(lo)}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow disabled:opacity-60"
                          >
                            {saving ? 'Đang lưu...' : 'Lưu'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="p-5">
                        {/* Lô header */}
                        <div className="mb-3 flex items-center justify-between">
                          <span className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-bold tracking-wide text-white">
                            LÔ #{lo.maLo}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(lo)}
                              className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-primary/10 hover:text-primary"
                              title="Sửa lô"
                            >
                              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === lo.maLo}
                              onClick={() => handleDelete(lo)}
                              className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title="Xóa lô"
                            >
                              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="mb-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.text} px-3 py-1 text-sm font-semibold`}>
                            <span className="text-base">{statusConfig.dot}</span>
                            {statusConfig.label}
                            {!isExpired && <span className="font-normal opacity-80">(Còn {daysLeft} ngày)</span>}
                          </span>
                        </div>
                        
                        {/* Info grid */}
                        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-lg bg-gray-50/80 p-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Số lượng nhập</p>
                            <p className="mt-0.5 text-sm font-bold text-gray-900">{Number(lo.soLuong || 0).toLocaleString('vi-VN')}<span className="text-xs font-normal text-gray-500"> {item?.donVi}</span></p>
                          </div>
                          <div className="rounded-lg bg-gray-50/80 p-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Số lượng còn</p>
                            <p className="mt-0.5 text-sm font-bold text-gray-900">{Number(lo.soLuongCon || 0).toLocaleString('vi-VN')}<span className="text-xs font-normal text-gray-500"> {item?.donVi}</span></p>
                          </div>
                          <div className="rounded-lg bg-gray-50/80 p-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Đơn giá</p>
                            <p className="mt-0.5 text-sm font-bold text-gray-900">{formatCurrency(lo.donGia)}<span className="text-xs font-normal text-gray-500">/{item?.donVi}</span></p>
                          </div>
                          <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/70">Giá trị còn</p>
                            <p className="mt-0.5 text-sm font-bold text-primary">{formatCurrency(batchValue)}</p>
                          </div>
                        </div>
                        
                        {/* Date info */}
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-gray-100 pt-3 text-sm">
                          <div className="flex items-center gap-1.5">
                            <svg className="size-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-500">Nhập:</span>
                            <span className="font-semibold text-gray-800">{formatDate(lo.ngayTao)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="size-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-500">SX:</span>
                            <span className="font-semibold text-gray-800">{formatDate(lo.ngaySanXuat)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className={`size-3.5 ${isExpired ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-gray-500">HSD:</span>
                            <span className={`font-semibold ${isExpired ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-800'}`}>{formatDate(lo.hanSuDung)}</span>
                          </div>
                          {lo.ghiChu && (
                            <div className="flex w-full items-center gap-1.5 pt-1">
                              <svg className="size-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              <span className="text-gray-500">Ghi chú:</span>
                              <span className="font-medium text-gray-700">{lo.ghiChu}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && los.length > 0 && (
          <div className="border-t border-gray-100 bg-gradient-to-br from-primary/5 via-white to-primary/5 px-7 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/60">Tổng giá trị tồn kho</p>
                <p className="mt-0.5 text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Tổng cộng {los.length} lô</p>
                <p className="text-sm font-medium text-gray-700">
                  {los.reduce((sum, lo) => sum + (Number(lo.soLuongCon) || 0), 0).toLocaleString('vi-VN')} {item?.donVi}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

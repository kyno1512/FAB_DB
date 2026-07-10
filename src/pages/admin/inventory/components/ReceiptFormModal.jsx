import { useEffect, useMemo, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import vi from 'date-fns/locale/vi'

// Format date from YYYY-MM-DD to DD/MM/YYYY
function formatDateDisplay(value) {
  if (!value) return 'N/A'
  const str = String(value).split('T')[0]
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return `${match[3]}/${match[2]}/${match[1]}`
  return value
}

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

// ========== Helpers: parse và format ngày ==========
function parseDateString(value) {
  if (!value) return { day: '', month: '', year: '' }
  const str = String(value).split('T')[0]
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return { year: match[1], month: match[2], day: match[3] }
  // Fallback: try DD/MM/YYYY
  const parts = str.split('/')
  if (parts.length === 3) return { day: parts[0].padStart(2, '0'), month: parts[1].padStart(2, '0'), year: parts[2] }
  return { day: '', month: '', year: '' }
}

function toIsoFromParts(day, month, year) {
  if (!day || !month || !year) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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

const EMPTY_LINE = { 
  maNguyenLieu: '', 
  soLuong: '', 
  donGia: '', 
  ngaySanXuat: '', 
  hanSuDung: '' 
}

export default function ReceiptFormModal({ open, mode = 'import', items, allMaterials, onClose, onSubmit }) {
  const [lines, setLines] = useState([{ ...EMPTY_LINE }])
  const [ghiChu, setGhiChu] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isImport = mode === 'import'
  const title = isImport ? 'Tạo phiếu nhập kho (theo lô)' : 'Tạo phiếu xuất kho (FIFO)'

  useEffect(() => {
    if (!open) return
    setLines([{ ...EMPTY_LINE }])
    setGhiChu('')
    setError('')
  }, [open, mode])

  const totalValue = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const qty = Number(line.soLuong) || 0
        const price = Number(line.donGia) || 0
        return sum + qty * price
      }, 0),
    [lines],
  )

  function updateLine(index, patch) {
    setLines((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addLine() {
    setLines((prev) => [...prev, { ...EMPTY_LINE }])
  }

  function removeLine(index) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validLines = lines.filter((line) => line.maNguyenLieu && Number(line.soLuong) > 0)
    if (validLines.length === 0) {
      setError('Thêm ít nhất một dòng nguyên liệu hợp lệ.')
      return
    }

    if (isImport) {
      const missingHSD = validLines.some((line) => !line.hanSuDung)
      if (missingHSD) {
        setError('Vui lòng nhập Hạn sử dụng cho tất cả nguyên liệu.')
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const invalidHSD = validLines.some((line) => line.hanSuDung <= today)
      if (invalidHSD) {
        setError('Hạn sử dụng phải lớn hơn ngày hiện tại.')
        return
      }
      const hsdtBeforeNSX = validLines.some((line) => line.ngaySanXuat && line.hanSuDung && line.hanSuDung <= line.ngaySanXuat)
      if (hsdtBeforeNSX) {
        setError('Hạn sử dụng phải lớn hơn ngày sản xuất.')
        return
      }
    }

    setSaving(true)
    setError('')
    try {
      await onSubmit({
        ghiChu: ghiChu.trim() || null,
        lines: validLines.map((line) => ({
          maNguyenLieu: Number(line.maNguyenLieu),
          soLuong: Number(line.soLuong),
          donGia: isImport ? Number(line.donGia) || null : null,
          ngaySanXuat: isImport && line.ngaySanXuat ? line.ngaySanXuat : null,
          hanSuDung: isImport && line.hanSuDung ? line.hanSuDung : null,
        })),
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isImport ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {isImport ? (
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-gray-800">{title}</h3>
              <p className="mt-0.5 text-sm text-gray-500">
                {isImport 
                  ? 'Mỗi dòng = 1 lô riêng với NSX và HSD.' 
                  : 'Hệ thống tự động xuất theo FIFO: lô có HSD gần nhất xuất trước.'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="space-y-4">
            {lines.map((line, index) => {
              const item = items.find((x) => x.maNguyenLieu === Number(line.maNguyenLieu))
              const qty = Number(line.soLuong) || 0
              const price = Number(line.donGia) || 0
              const thanhTien = qty * price
              const hasItem = line.maNguyenLieu && item
              return (
                <div key={index} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                  {/* Header with number badge and delete */}
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary font-bold text-white text-xs shadow-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-600">Nguyên liệu</span>
                    </div>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Ingredient selector */}
                    <div className="mb-4">
                      <InlineSelect
                        value={line.maNguyenLieu}
                        onChange={(value) => updateLine(index, { maNguyenLieu: value })}
                        options={allMaterials}
                      />
                      {hasItem && (
                        <div className="mt-2.5 flex items-center gap-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 py-2.5 border border-gray-100">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="text-xs text-gray-500">Tồn kho:</span>
                            <span className="text-sm font-semibold text-gray-700">
                              {Number(item.soLuongTon).toLocaleString('vi-VN')} {item.donVi}
                            </span>
                          </div>
                          {item.moTa && (
                            <span className="text-xs text-gray-400 italic">| {item.moTa}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Row 2: Quantity, Price, Total */}
                    {isImport && (
                      <div className="mb-4 grid grid-cols-3 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">Số lượng</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={line.soLuong}
                            onChange={(e) => updateLine(index, { soLuong: e.target.value })}
                            placeholder="0"
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">Đơn giá (đ)</label>
                          <input
                            type="number"
                            min="0"
                            value={line.donGia}
                            onChange={(e) => updateLine(index, { donGia: e.target.value })}
                            placeholder="0"
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">Thành tiền</label>
                          <div className="flex h-[42px] items-center rounded-xl border border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-3">
                            <span className={`text-sm font-bold ${thanhTien > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {thanhTien > 0 ? thanhTien.toLocaleString('vi-VN') + ' đ' : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Row 3: Dates */}
                    {isImport && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">Ngày sản xuất</label>
                          <DateInput
                            value={line.ngaySanXuat || ''}
                            onChange={(v) => updateLine(index, { ngaySanXuat: v })}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">
                            HSD <span className="text-red-500">*</span>
                          </label>
                          <DateInput
                            value={line.hanSuDung || ''}
                            onChange={(v) => updateLine(index, { hanSuDung: v })}
                            required
                            min={line.ngaySanXuat || undefined}
                          />
                        </div>
                      </div>
                    )}

                    {/* Lot info banner */}
                    {isImport && line.maNguyenLieu && line.hanSuDung && (
                      <div className="mt-4 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-white">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className="text-sm font-semibold">Lô mới sẽ được tạo</span>
                        </div>
                        <div className="mt-1.5 flex gap-6 text-xs text-emerald-100">
                          <span>NSX: <strong className="text-white">{formatDateDisplay(line.ngaySanXuat)}</strong></span>
                          <span>HSD: <strong className="text-white">{formatDateDisplay(line.hanSuDung)}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={addLine}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 px-4 py-3.5 text-sm font-semibold text-gray-500 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm nguyên liệu
          </button>

          {/* Notes */}
          <div className="mt-6">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">Ghi chú phiếu</label>
            <input
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder={isImport ? 'Nhà cung cấp, lý do nhập...' : 'Lý do xuất kho...'}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Total value */}
          {isImport && totalValue > 0 && (
            <div className="mt-5 flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 px-6 py-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-emerald-100">Tổng giá trị phiếu</span>
                  <p className="text-xs text-emerald-200">{lines.filter(l => l.maNguyenLieu).length} nguyên liệu</p>
                </div>
              </div>
              <span className="text-3xl font-bold">{totalValue.toLocaleString('vi-VN')}đ</span>
            </div>
          )}

          {/* FIFO notice */}
          {!isImport && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-amber-700">Xuất kho FIFO</span>
                  <p className="mt-0.5 text-sm text-amber-600">
                    Hệ thống tự động trừ số lượng từ các lô theo thứ tự <strong>HSD gần nhất xuất trước</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <p className="text-sm text-gray-500">
            {lines.filter(l => l.maNguyenLieu).length} / {lines.length} dòng đã chọn
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                isImport 
                  ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md' 
                  : 'bg-red-600 hover:bg-red-700 hover:shadow-md'
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang lưu...
                </span>
              ) : isImport ? 'Nhập kho' : 'Xuất kho (FIFO)'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// Inline Select Component
function InlineSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef(null)
  const listRef = useRef(null)

  const selected = options.find((x) => x.maNguyenLieu === Number(value))

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return options
    return options.filter((row) => (row.tenNguyenLieu || '').toLowerCase().includes(q))
  }, [options, keyword])

  const pick = useCallback(
    (row) => {
      onChange(String(row.maNguyenLieu))
      setOpen(false)
      setKeyword('')
    },
    [onChange],
  )

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    const handleClickOutside = (event) => {
      const dropdown = listRef.current
      const button = buttonRef.current
      if ((dropdown && dropdown.contains(event.target)) || (button && button.contains(event.target))) {
        return
      }
      setOpen(false)
      setKeyword('')
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((prev) => !prev)
          setKeyword('')
        }}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm transition-all hover:border-gray-300 hover:shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className={`truncate ${selected ? 'text-gray-800' : 'text-gray-400'}`}>
          {selected ? `${selected.tenNguyenLieu}` : 'Chọn nguyên liệu...'}
        </span>
        <svg className="ml-2 h-5 w-5 shrink-0 text-gray-400 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={listRef}
          className="fixed z-[400] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
          }}
        >
          <div className="border-b border-gray-100 p-3">
            <input
              autoFocus
              type="text"
              placeholder="Tìm kiếm nguyên liệu..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-all outline-none focus:border-primary focus:bg-white"
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                <svg className="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Không tìm thấy
              </div>
            ) : (
              <>
                {filtered.map((row) => {
                  const active = Number(value) === Number(row.maNguyenLieu)
                  return (
                    <div
                      key={row.maNguyenLieu}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(row)}
                      className={`flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-colors ${
                        active 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{row.tenNguyenLieu}</span>
                      <span className={`text-xs ${active ? 'text-primary/70' : 'text-gray-400'}`}>
                        {Number(row.soLuongTon).toLocaleString('vi-VN')} {row.donVi}
                      </span>
                    </div>
                  )
                })}
                <div className="sticky bottom-0 border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-500">
                  Hiển thị {filtered.length} / {options.length} nguyên liệu
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

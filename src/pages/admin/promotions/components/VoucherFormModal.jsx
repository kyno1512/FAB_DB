import { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import vi from 'date-fns/locale/vi'
import { formatPrice } from '../../../../lib/formatPrice'

// Custom styles for react-datepicker
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
  .react-datepicker__navigation {
    top: 8px;
  }
  .react-datepicker__navigation-icon::before {
    border-color: #6b7280;
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

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm'

const emptyForm = {
  tenVoucher: '',
  maCode: '',
  loaiGiam: 'PhanTram',
  giaTri: '0',
  dieuKienToiThieu: '0',
  soLuongToiDa: '0',
  gioiHanMotEmail: false,
  ngayBatDau: '',
  ngayKetThuc: '',
  trangThai: true,
}

function toDateTimeLocal(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  if (isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDateTimeLabel(value) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (match) return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`
  return ''
}

// ========== DateTime Input với DatePicker ==========
function DateTimeInput({ value, onChange, required, min }) {
  const dateValue = value ? new Date(value) : null
  const minDate = min ? new Date(min) : null
  
  function handleChange(date) {
    if (!date) return
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    onChange(`${y}-${m}-${d}T${h}:${min}`)
  }
  
  return (
    <div className="relative">
      <style>{customStyles}</style>
      <DatePicker
        selected={dateValue}
        onChange={handleChange}
        minDate={minDate}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="dd/MM/yyyy HH:mm"
        locale={vi}
        className="w-full cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:outline-none"
        placeholderText="DD/MM/YYYY HH:mm"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={15}
        popperProps={{ strategy: 'fixed' }}
        required={required}
      />
    </div>
  )
}

function randomCode() {
  return `FLYGO${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function FormRow({ label, children, className = '' }) {
  return (
    <div className={`grid gap-2 sm:grid-cols-[148px_minmax(0,1fr)] sm:items-center sm:gap-4 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function FormRowPair({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(({ label, children }) => (
        <div
          key={label}
          className="grid gap-2 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center sm:gap-3"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
          <div className="min-w-0">{children}</div>
        </div>
      ))}
    </div>
  )
}

function OverviewItem({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 last:border-0">
      <span className="shrink-0 text-xs text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-800">{value}</span>
    </div>
  )
}

function OverviewPanel({ form }) {
  const discountValue =
    form.loaiGiam === 'SoTien'
      ? formatPrice(Number(form.giaTri || 0))
      : `${Number(form.giaTri || 0)}%`

  const minOrder = Number(form.dieuKienToiThieu || 0)
  const maxUses = Number(form.soLuongToiDa || 0)

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <OverviewItem label="Mã khuyến mãi" value={form.maCode.trim() || '—'} />
      <OverviewItem label="Tên chương trình" value={form.tenVoucher.trim() || '—'} />
      <OverviewItem
        label="Loại giảm"
        value={form.loaiGiam === 'SoTien' ? 'Theo số tiền' : 'Theo phần trăm'}
      />
      <OverviewItem
        label={form.loaiGiam === 'SoTien' ? 'Số tiền giảm' : 'Phần trăm giảm'}
        value={discountValue}
      />
      <OverviewItem
        label="Số tiền tối thiểu"
        value={minOrder > 0 ? formatPrice(minOrder) : 'Không yêu cầu'}
      />
      <OverviewItem
        label="Lượt dùng tối đa"
        value={maxUses > 0 ? maxUses.toLocaleString('vi-VN') : 'Không giới hạn'}
      />
      <OverviewItem
        label="Giới hạn email"
        value={form.gioiHanMotEmail ? '1 lần / email' : 'Không giới hạn'}
      />
      <OverviewItem
        label="Bắt đầu"
        value={form.ngayBatDau ? formatDateTimeLabel(form.ngayBatDau) : '—'}
      />
      <OverviewItem
        label="Kết thúc"
        value={form.ngayKetThuc ? formatDateTimeLabel(form.ngayKetThuc) : '—'}
      />
      <OverviewItem label="Trạng thái" value={form.trangThai ? 'Đang bật' : 'Tắt'} />
    </div>
  )
}

export default function VoucherFormModal({ open, voucher, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return

    if (voucher) {
      setForm({
        tenVoucher: voucher.tenVoucher ?? '',
        maCode: voucher.maCode ?? '',
        loaiGiam: voucher.loaiGiam ?? 'PhanTram',
        giaTri: String(voucher.giaTri ?? 0),
        dieuKienToiThieu: String(voucher.dieuKienToiThieu ?? 0),
        soLuongToiDa: voucher.soLuongToiDa != null ? String(voucher.soLuongToiDa) : '0',
        gioiHanMotEmail: Boolean(voucher.gioiHanMotEmail),
        ngayBatDau: toDateTimeLocal(voucher.ngayBatDau),
        ngayKetThuc: toDateTimeLocal(voucher.ngayKetThuc),
        trangThai: Boolean(voucher.trangThai),
      })
    } else {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setMonth(end.getMonth() + 3)
      end.setHours(23, 59, 0, 0)
      setForm({
        ...emptyForm,
        ngayBatDau: toDateTimeLocal(start),
        ngayKetThuc: toDateTimeLocal(end),
      })
    }
    setError('')
  }, [open, voucher])

  const overview = useMemo(() => <OverviewPanel form={form} />, [form])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleLoaiChange(loaiGiam) {
    setForm((prev) => ({ ...prev, loaiGiam, giaTri: prev.giaTri || '0' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const giaTri = Number(form.giaTri || 0)
    if (giaTri <= 0) {
      setError(form.loaiGiam === 'SoTien' ? 'Số tiền giảm phải lớn hơn 0.' : 'Phần trăm giảm phải lớn hơn 0.')
      return
    }

    if (form.loaiGiam === 'PhanTram' && giaTri > 100) {
      setError('Phần trăm giảm không được vượt quá 100.')
      return
    }

    setSaving(true)
    setError('')

    const soLuong = Number(form.soLuongToiDa || 0)

    try {
      await onSubmit({
        tenVoucher: form.tenVoucher.trim(),
        maCode: form.maCode.trim(),
        loaiGiam: form.loaiGiam,
        giaTri,
        giamToiDa: null,
        dieuKienToiThieu: Number(form.dieuKienToiThieu || 0),
        soLuongToiDa: soLuong > 0 ? soLuong : null,
        gioiHanMotEmail: form.gioiHanMotEmail,
        ngayBatDau: new Date(form.ngayBatDau).getTime(),
        ngayKetThuc: new Date(form.ngayKetThuc).getTime(),
        trangThai: form.trangThai,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl lg:max-h-[85vh] lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} autoComplete="off" className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
            <h2 className="font-display text-lg font-semibold text-gray-800 sm:text-xl">
              {voucher ? 'Sửa khuyến mãi' : 'Thêm mới khuyến mãi'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div className="mb-5 lg:hidden">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">Tổng quan chương trình khuyến mại</h3>
              {overview}
            </div>

            <div className="space-y-4">
              <FormRow label="Mã khuyến mãi">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className={inputClass}
                    value={form.maCode}
                    onChange={(e) => updateField('maCode', e.target.value.toUpperCase())}
                    placeholder="Nhập mã"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => updateField('maCode', randomCode())}
                    className="shrink-0 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Sinh mã
                  </button>
                </div>
              </FormRow>

              <FormRow label="Tên chương trình">
                <input
                  className={inputClass}
                  value={form.tenVoucher}
                  onChange={(e) => updateField('tenVoucher', e.target.value)}
                  placeholder="Tên hiển thị"
                  required
                />
              </FormRow>

              <FormRowPair
                items={[
                  {
                    label: 'Loại khuyến mãi',
                    children: (
                      <select
                        className={inputClass}
                        value={form.loaiGiam}
                        onChange={(e) => handleLoaiChange(e.target.value)}
                      >
                        <option value="PhanTram">Theo phần trăm (%)</option>
                        <option value="SoTien">Theo số tiền (đ)</option>
                      </select>
                    ),
                  },
                  {
                    label: form.loaiGiam === 'SoTien' ? 'Số tiền giảm (đ)' : 'Phần trăm giảm (%)',
                    children: (
                      <input
                        type="number"
                        min="0"
                        max={form.loaiGiam === 'PhanTram' ? 100 : undefined}
                        className={inputClass}
                        value={form.giaTri}
                        onChange={(e) => updateField('giaTri', e.target.value)}
                        required
                      />
                    ),
                  },
                ]}
              />

              <FormRowPair
                items={[
                  {
                    label: 'Số tiền tối thiểu (đ)',
                    children: (
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={form.dieuKienToiThieu}
                        onChange={(e) => updateField('dieuKienToiThieu', e.target.value)}
                      />
                    ),
                  },
                  {
                    label: 'Lượt dùng tối đa',
                    children: (
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={form.soLuongToiDa}
                        onChange={(e) => updateField('soLuongToiDa', e.target.value)}
                      />
                    ),
                  },
                ]}
              />

              <FormRow label="Giới hạn email">
                <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={form.gioiHanMotEmail}
                    onChange={(e) => updateField('gioiHanMotEmail', e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">Mỗi email chỉ dùng 1 lần</span>
                </label>
              </FormRow>

              <FormRowPair
                items={[
                  {
                    label: 'Ngày bắt đầu',
                    children: (
                      <DateTimeInput
                        value={form.ngayBatDau}
                        onChange={(v) => updateField('ngayBatDau', v)}
                        required
                      />
                    ),
                  },
                  {
                    label: 'Ngày kết thúc',
                    children: (
                      <DateTimeInput
                        value={form.ngayKetThuc}
                        onChange={(v) => updateField('ngayKetThuc', v)}
                        required
                        min={form.ngayBatDau || undefined}
                      />
                    ),
                  },
                ]}
              />

              <FormRow label="Trạng thái">
                <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={form.trangThai}
                    onChange={(e) => updateField('trangThai', e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">Đang kích hoạt</span>
                </label>
              </FormRow>
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </form>

        <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-gray-100 bg-gray-50 p-6 lg:block">
          <h3 className="text-sm font-semibold text-gray-800">Tổng quan chương trình khuyến mại</h3>
          <div className="mt-4">{overview}</div>
        </aside>
      </div>
    </div>
  )
}

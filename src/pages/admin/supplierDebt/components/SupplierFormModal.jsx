import { useEffect, useState } from 'react'
import { getInitials } from './SupplierDetailModal'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10'

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700'

const emptyForm = {
  tenNhaCungCap: '',
  nguoiLienHe: '',
  soDienThoai: '',
  email: '',
  diaChi: '',
  maSoThue: '',
  trangThai: true,
}

function FormSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/40 p-4">{children}</div>
    </section>
  )
}

export default function SupplierFormModal({ open, supplier, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    if (supplier) {
      setForm({
        tenNhaCungCap: supplier.tenNhaCungCap ?? '',
        nguoiLienHe: supplier.nguoiLienHe ?? '',
        soDienThoai: supplier.soDienThoai ?? '',
        email: supplier.email ?? '',
        diaChi: supplier.diaChi ?? '',
        maSoThue: supplier.maSoThue ?? '',
        trangThai: supplier.trangThai ?? true,
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, supplier])

  if (!open) return null

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSaved(form, supplier?.maNhaCungCap)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const isEdit = Boolean(supplier?.maNhaCungCap)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(90vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 border-b border-gray-100 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/90 text-lg text-gray-500 shadow-sm transition hover:bg-white hover:text-gray-800"
            aria-label="Đóng"
          >
            ×
          </button>
          <div className="flex items-center gap-3 pr-10">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary font-display text-sm font-bold text-white shadow-md shadow-primary/20">
              {getInitials(form.tenNhaCungCap || 'NCC')}
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
                {isEdit ? 'Cập nhật' : 'Thêm mới'}
              </p>
              <h2 className="font-display text-xl font-bold text-gray-800">
                {isEdit ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
              </h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 [scrollbar-gutter:stable]">
            <FormSection title="Thông tin cơ bản">
              <label className="block">
                <span className={labelClass}>
                  Tên nhà cung cấp <span className="text-red-500">*</span>
                </span>
                <input
                  className={inputClass}
                  value={form.tenNhaCungCap}
                  onChange={(e) => update('tenNhaCungCap', e.target.value)}
                  placeholder="VD: Công ty Bột Mì ABC"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Người liên hệ</span>
                <input
                  className={inputClass}
                  value={form.nguoiLienHe}
                  onChange={(e) => update('nguoiLienHe', e.target.value)}
                  placeholder="Họ tên người phụ trách"
                />
              </label>
            </FormSection>

            <FormSection title="Liên hệ">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Số điện thoại</span>
                  <input
                    className={inputClass}
                    value={form.soDienThoai}
                    onChange={(e) => update('soDienThoai', e.target.value)}
                    placeholder="0901234567"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Email</span>
                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="contact@company.vn"
                  />
                </label>
              </div>
              <label className="block">
                <span className={labelClass}>Địa chỉ</span>
                <input
                  className={inputClass}
                  value={form.diaChi}
                  onChange={(e) => update('diaChi', e.target.value)}
                  placeholder="Quận, thành phố"
                />
              </label>
            </FormSection>

            <FormSection title="Pháp lý & trạng thái">
              <label className="block">
                <span className={labelClass}>Mã số thuế</span>
                <input
                  className={inputClass}
                  value={form.maSoThue}
                  onChange={(e) => update('maSoThue', e.target.value)}
                  placeholder="0123456789"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 transition hover:bg-emerald-50">
                <input
                  type="checkbox"
                  checked={form.trangThai}
                  onChange={(e) => update('trangThai', e.target.checked)}
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                />
                <span className="text-sm font-medium text-gray-700">Đang hợp tác với Flygo</span>
              </label>
            </FormSection>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-w-[100px] rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

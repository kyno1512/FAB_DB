import { useEffect, useState } from 'react'

const EMPTY = {
  tenNguyenLieu: '',
  donVi: '',
  mucTonToiThieu: 0,
  moTa: '',
}

// Đơn vị được nhóm theo loại
const UNIT_GROUPS = [
  {
    label: 'Khối lượng',
    units: ['kg', 'g', 'mg'],
  },
  {
    label: 'Thể tích',
    units: ['l', 'ml', 'lít', 'cc'],
  },
  {
    label: 'Số lượng',
    units: ['cái', 'phần', 'quả', 'trái', 'quả'],
  },
  {
    label: 'Đóng gói',
    units: ['chai', 'hộp', 'túi', 'gói', 'lon', 'vé', 'cuốn', 'tấm'],
  },
]

// Flat list để search
const ALL_UNITS = UNIT_GROUPS.flatMap((g) => g.units)

export default function InventoryFormModal({ open, item, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [unitOpen, setUnitOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setUnitOpen(false)
    if (item) {
      setForm({
        tenNguyenLieu: item.tenNguyenLieu ?? '',
        donVi: item.donVi ?? '',
        mucTonToiThieu: item.mucTonToiThieu ?? 0,
        moTa: item.moTa ?? '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [open, item])

  if (!open) return null

  // Filter units theo giá trị đã gõ
  const search = form.donVi.toLowerCase()
  const filteredGroups = UNIT_GROUPS.map((g) => ({
    ...g,
    units: g.units.filter((u) => u.includes(search)),
  })).filter((g) => g.units.length > 0)

  const hasMatch = filteredGroups.length > 0
  const showDropdown = unitOpen && (hasMatch || form.donVi.trim() === '')

  function selectUnit(unit) {
    setForm({ ...form, donVi: unit })
    setUnitOpen(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit({
        tenNguyenLieu: form.tenNguyenLieu.trim(),
        donVi: form.donVi.trim(),
        mucTonToiThieu: Number(form.mucTonToiThieu) || 0,
        moTa: form.moTa.trim() || null,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="font-display text-xl font-semibold text-gray-800">
          {item ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}
        </h3>

        <div className="mt-5 grid gap-4">
          <Field label="Tên nguyên liệu">
            <input
              required
              value={form.tenNguyenLieu}
              onChange={(e) => setForm({ ...form, tenNguyenLieu: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Đơn vị</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.donVi}
                  onChange={(e) => {
                    setForm({ ...form, donVi: e.target.value })
                    setUnitOpen(true)
                  }}
                  onFocus={() => setUnitOpen(true)}
                  placeholder="Chọn hoặc nhập đơn vị..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setUnitOpen(!unitOpen)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    {filteredGroups.map((group) => (
                      <div key={group.label}>
                        <div className="bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {group.label}
                        </div>
                        <div className="p-1">
                          {group.units.map((unit) => (
                            <button
                              key={unit}
                              type="button"
                              onClick={() => selectUnit(unit)}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/5 ${
                                form.donVi.toLowerCase() === unit.toLowerCase()
                                  ? 'bg-primary/10 font-medium text-primary'
                                  : 'text-gray-700'
                              }`}
                            >
                              {unit}
                              {form.donVi.toLowerCase() === unit.toLowerCase() && (
                                <svg className="size-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Field label="Mức tồn tối thiểu">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.mucTonToiThieu}
                onChange={(e) => setForm({ ...form, mucTonToiThieu: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </Field>
          </div>
          <Field label="Mô tả">
            <textarea
              rows={3}
              value={form.moTa}
              onChange={(e) => setForm({ ...form, moTa: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
            
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      {children}
    </label>
  )
}

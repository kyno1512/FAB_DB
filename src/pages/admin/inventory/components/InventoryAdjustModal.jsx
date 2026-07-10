import { useEffect, useState } from 'react'

export default function InventoryAdjustModal({ open, item, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setAmount('')
    setNote('')
    setError('')
  }, [open, item])

  if (!open || !item) return null

  async function handleSubmit(e) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || Number.isNaN(value)) {
      setError('Nhập số lượng hợp lệ.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSubmit({ soLuongThayDoi: value, ghiChu: note.trim() || null })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="font-display text-xl font-semibold text-gray-800">Nhập / Xuất kho</h3>
        <p className="mt-1 text-sm text-gray-500">
          {item.tenNguyenLieu} · hiện có {Number(item.soLuongTon).toLocaleString('vi-VN')} {item.donVi}
        </p>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Số lượng (+ nhập, − xuất)
            </span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ví dụ: 10 hoặc -5"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Ghi chú</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lý do điều chỉnh..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
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
            {saving ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </form>
    </div>
  )
}

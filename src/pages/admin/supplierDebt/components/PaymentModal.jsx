import { useEffect, useState } from 'react'
import { formatPrice } from '../../../../lib/formatPrice'
import { inputField } from '../../../../lib/classes'

const fieldClass = `${inputField} w-full bg-white text-gray-800`
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'

export default function PaymentModal({ open, debt, onClose, onPaid }) {
  const [soTienTra, setSoTienTra] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !debt) return
    setSoTienTra(String(debt.conNo ?? ''))
    setGhiChu('')
    setError('')
  }, [open, debt])

  if (!open || !debt) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onPaid(debt.maPhieuNhap, {
        soTienTra: Number(soTienTra),
        ghiChu: ghiChu.trim() || null,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-display text-xl font-bold text-gray-800">Thanh toán công nợ</h2>
        <p className="mt-1 text-sm text-gray-500">
          Phiếu #{debt.maPhieuNhap} · {debt.tenNhaCungCap ?? 'Chưa gán NCC'}
        </p>
        <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Tổng phiếu</span>
            <span className="font-semibold">{formatPrice(debt.tongTien)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-gray-500">Đã trả</span>
            <span>{formatPrice(debt.soDaTra)}</span>
          </div>
          <div className="mt-1 flex justify-between text-primary">
            <span className="font-medium">Còn nợ</span>
            <span className="font-bold">{formatPrice(debt.conNo)}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>Số tiền trả (VND)</span>
            <input
              type="number"
              min="1"
              max={debt.conNo}
              className={fieldClass}
              value={soTienTra}
              onChange={(e) => setSoTienTra(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className={labelClass}>Ghi chú</span>
            <input className={fieldClass} value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="Chuyển khoản, tiền mặt..." />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Đang lưu...' : 'Xác nhận trả'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

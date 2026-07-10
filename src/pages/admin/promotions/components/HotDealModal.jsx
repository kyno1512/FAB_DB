import { useEffect, useMemo, useState } from 'react'
import { formatPrice } from '../../../../lib/formatPrice'

function getHotDealPercent(product) {
  if (!product?.giaGoc || product.giaBan >= product.giaGoc) return null
  return Math.round((1 - product.giaBan / product.giaGoc) * 100)
}

export default function HotDealModal({ open, product, onClose, onSubmit, onRemove }) {
  const [percent, setPercent] = useState('')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')

  const currentPercent = useMemo(() => (product ? getHotDealPercent(product) : null), [product])
  const hasDeal = currentPercent != null

  useEffect(() => {
    if (!open || !product) return
    setPercent(currentPercent != null ? String(currentPercent) : '')
    setError('')
  }, [open, product, currentPercent])

  if (!open || !product) return null

  async function handleSubmit(e) {
    e.preventDefault()
    const value = Number(percent)
    if (value < 1 || value > 100) {
      setError('Nhập số từ 1 đến 100')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSubmit(value)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    setError('')
    try {
      const removed = await onRemove()
      if (removed) onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-lg font-bold text-white">%</span>
            <h2 className="font-display text-xl font-semibold text-gray-800">
              {hasDeal ? 'Chỉnh giảm giá' : 'Thiết lập giảm giá'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase text-gray-500">Sản phẩm</p>
          <p className="mt-2 rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">{product.tenSanPham}</p>
        </div>

        {hasDeal && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-600">Giá gốc</span>
              <span className="font-medium text-gray-800">{formatPrice(product.giaGoc)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-gray-600">Giá đang bán</span>
              <span className="font-semibold text-red-600">{formatPrice(product.giaBan)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-gray-600">Đang giảm</span>
              <span className="font-semibold text-red-600">-{currentPercent}%</span>
            </div>
          </div>
        )}

        <label className="mt-5 block">
          <span className="text-sm font-medium text-gray-700">Phần trăm giảm giá (%)</span>
          <input
            type="number"
            min="1"
            max="100"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="Nhập % giảm (1-100)"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            required
          />
          <p className="mt-1 text-xs text-gray-400">
            {hasDeal ? 'Nhập % mới để thay đổi giảm giá' : 'Nhập số từ 1 đến 100'}
          </p>
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {hasDeal ? (
            <button
              type="button"
              disabled={removing || saving}
              onClick={handleRemove}
              className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {removing ? 'Đang gỡ...' : 'Gỡ giảm giá'}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || removing}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : hasDeal ? 'Cập nhật' : 'Lưu'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

import { useState } from 'react'
import { useVoucher } from '../../../../context/VoucherContext'

export default function PromoCodeBox({ subtotal, email = '' }) {
  const { applied, applyVoucher, clearVoucher } = useVoucher()
  const [code, setCode] = useState(applied?.maCode ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply(e) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) {
      setError('Vui lòng nhập mã khuyến mãi.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await applyVoucher(trimmed, subtotal, email.trim() || undefined)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleRemove() {
    clearVoucher()
    setCode('')
    setError('')
  }

  return (
    <div className="border-t border-cream-dark px-5 py-4">
      <p className="mb-3 text-sm font-semibold text-gray-800">Mã khuyến mãi</p>

      {applied ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-800">{applied.maCode}</p>
              <p className="mt-0.5 text-xs text-emerald-700">{applied.tenVoucher}</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-medium text-red-500 hover:underline"
            >
              Gỡ
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã khuyến mãi"
            className="min-w-0 flex-1 rounded-xl border border-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? '...' : 'Áp dụng'}
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

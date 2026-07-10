import { useState } from 'react'
import { confirmAction, showError, showSuccess } from '../../../../lib/swal'
import { formatOrderCode } from '../../../../lib/orderStatus'

export default function CancelOrderButton({ maDonHang, onCancelled, cancelFn, className = '' }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    const confirmed = await confirmAction({
      title: `Hủy ${formatOrderCode(maDonHang)}?`,
      text: 'Đơn chỉ hủy được khi chưa vào bếp. Bạn có chắc muốn hủy?',
      confirmText: 'Hủy đơn',
      cancelText: 'Giữ lại',
      icon: 'warning',
    })

    if (!confirmed) return

    setLoading(true)
    try {
      const result = await cancelFn()
      await showSuccess(result?.message || 'Đã hủy đơn hàng.')
      onCancelled?.()
    } catch (err) {
      await showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        className ||
        'rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60'
      }
    >
      {loading ? 'Đang hủy...' : 'Hủy đơn'}
    </button>
  )
}

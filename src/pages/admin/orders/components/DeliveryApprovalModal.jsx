import { useEffect, useMemo, useState } from 'react'
import { formatPrice } from '../../../../lib/formatPrice'
import { getInternalShippers } from '../../../../services/orderAdminService'

const DEFAULT_SHIP_FEE = 0

function PaymentBadge({ method }) {
  const isCod = method === 'COD'
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isCod ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
      }`}
    >
      {isCod ? 'COD' : 'VNPay'}
    </span>
  )
}

function ShipperAvatar({ name }) {
  const initial = (name?.trim()?.[0] || '?').toUpperCase()
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
      {initial}
    </span>
  )
}

export default function DeliveryApprovalModal({ order, onConfirm, onClose }) {
  const isCod = order.phuongThucThanhToan === 'COD'
  const [shippers, setShippers] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [shipFee, setShipFee] = useState(String(DEFAULT_SHIP_FEE))
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const feeNumber = useMemo(() => {
    const n = Number(shipFee.replace(/\D/g, '') || 0)
    return Number.isFinite(n) ? n : 0
  }, [shipFee])

  const codTotal = useMemo(
    () => Math.max(0, Number(order.tongThanhToan || 0) + feeNumber),
    [order.tongThanhToan, feeNumber],
  )

  useEffect(() => {
    getInternalShippers()
      .then((data) => setShippers(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (/404|not found/i.test(err.message)) {
          setError('API shipper chưa có — restart FAB.Server (Stop → Run F5) rồi thử lại.')
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const selectedShipper = shippers.find((s) => String(s.maNguoiDung) === selectedId)

  async function handleConfirm() {
    if (!selectedId) {
      setError('Vui lòng chọn shipper nội bộ.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onConfirm({
        maShipper: Number(selectedId),
        phiGiaoHang: feeNumber,
        ghiChuGiao: note.trim() || undefined,
      })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Duyệt giao hàng
              </p>
              <h3 className="mt-1 font-display text-xl font-bold text-gray-800">
                Đơn #{order.maDonHang}
                <span className="mx-2 font-normal text-gray-300">·</span>
                {order.nguoiNhan || order.tenKhachHang || 'Khách hàng'}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <PaymentBadge method={order.phuongThucThanhToan} />
                <span className="text-sm text-gray-500">
                  Tạm tính {formatPrice(order.tongThanhToan)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-full text-xl text-gray-400 hover:bg-gray-100"
              aria-label="Đóng"
            >
              ×
            </button>
          </div>
          {order.diaChiGiao && (
            <p className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-sm text-indigo-800">
              📍 {order.diaChiGiao}
            </p>
          )}
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {loading && (
            <p className="py-6 text-center text-sm text-gray-400">Đang tải shipper...</p>
          )}

          {!loading && shippers.length === 0 && !error && (
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Chưa có nhân viên/shipper nội bộ. Tạo tài khoản vai trò Shipper hoặc NhanVien trước.
            </p>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="shipper-select" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Shipper <span className="text-red-500">*</span>
              </label>
              <select
                id="shipper-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="">-- Chọn shipper --</option>
                {shippers.map((s) => (
                  <option key={s.maNguoiDung} value={s.maNguoiDung}>
                    {s.hoTen}
                    {s.soDienThoai ? ` · ${s.soDienThoai}` : ''} ({s.tenVaiTro})
                  </option>
                ))}
              </select>
              {selectedShipper && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                  <ShipperAvatar name={selectedShipper.hoTen} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{selectedShipper.hoTen}</p>
                    <p className="text-xs text-gray-500">
                      {selectedShipper.tenVaiTro}
                      {selectedShipper.soDienThoai ? ` · ${selectedShipper.soDienThoai}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="ship-fee" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Phí giao hàng (VND)
              </label>
              <input
                id="ship-fee"
                type="text"
                inputMode="numeric"
                value={shipFee}
                onChange={(e) => setShipFee(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="Nhập phí giao hàng"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <p className="mt-1 text-xs text-gray-400">Phí ship đã được cộng vào lúc khách thanh toán — mặc định 0đ</p>
            </div>

            {isCod && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <p className="text-sm font-semibold text-emerald-800">Thu hộ COD</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{formatPrice(codTotal)}</p>
                <p className="mt-1 text-xs text-emerald-700/80">
                  Tự động = Tổng đơn ({formatPrice(order.tongThanhToan)}) + Phí ship ({formatPrice(feeNumber)})
                </p>
              </div>
            )}

            {!isCod && feeNumber > 0 && (
              <p className="rounded-xl bg-sky-50 px-3.5 py-2.5 text-xs text-sky-800">
                Khách đã thanh toán VNPay. Phí ship {formatPrice(feeNumber)} chỉ để shipper nắm thông tin giao hàng.
              </p>
            )}

            <div>
              <label htmlFor="ship-note" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Ghi chú giao hàng
              </label>
              <textarea
                id="ship-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Gọi trước 10 phút, giao giờ trưa..."
                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={submitting || loading}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận & giao hàng'}
          </button>
        </div>
      </div>
    </div>
  )
}

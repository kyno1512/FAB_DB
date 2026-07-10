import { useEffect, useState } from 'react'
import { formatPrice } from '../../../../lib/formatPrice'
import { resolveMediaUrl, NEWS_PLACEHOLDER_IMAGE } from '../../../../lib/mediaUrl'
import { getAdminOrderDetail, processRefund, getRefundHistory, updateOrderCustomerInfo } from '../../../../services/orderAdminService'
import { showError, showSuccess, confirmAction } from '../../../../lib/swal'
import OrderStatusTimeline from '../../../client/orders/components/OrderStatusTimeline'
import { getOrderStatusColor, getOrderStatusLabel, formatOrderCode, formatOrderDate } from '../../../../lib/orderStatus'

const PAYMENT_METHOD_LABELS = {
  COD: 'COD (nhận tiền khi giao)',
  VNPAY: 'VNPay (thanh toán online)',
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120&auto=format&fit=crop'

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  )
}

function PaymentBadge({ order }) {
  const isCod = order.phuongThucThanhToan === 'COD'
  const paid = order.trangThaiThanhToan === 'DaThanhToan' || order.trangThaiThanhToan === 'COD'

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        isCod ? 'bg-amber-100 text-amber-800' : paid ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
      }`}
    >
      {isCod ? 'COD' : paid ? 'VNPay · Đã thanh toán' : 'VNPay · Chờ thanh toán'}
    </span>
  )
}

function CustomerEditSection({ order, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [soDienThoai, setSoDienThoai] = useState(order.soDienThoai || '')
  const [email, setEmail] = useState(order.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setSoDienThoai(order.soDienThoai || '')
    setEmail(order.email || '')
  }, [order.soDienThoai, order.email])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')

    const sdt = soDienThoai.trim()
    const em = email.trim()

    if (!sdt) {
      setError('SĐT không được để trống.')
      return
    }

    setLoading(true)
    try {
      const updated = await updateOrderCustomerInfo(order.maDonHang, {
        soDienThoai: sdt,
        email: em || null,
      })
      onUpdated(updated)
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  if (!editing) {
    return (
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 min-w-0 rounded-xl border border-cream-dark bg-white p-3">
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-x-4">
              <span className="text-gray-500 shrink-0">SĐT:</span>
              <span className="font-medium text-gray-800 break-all">{order.soDienThoai || '—'}</span>
            </div>
            <div className="flex flex-wrap gap-x-4">
              <span className="text-gray-500 shrink-0">Email:</span>
              <span className="font-medium text-gray-800 break-all">{order.email || '—'}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
        >
          Sửa
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="mb-3 text-sm font-semibold text-blue-700">Chỉnh sửa thông tin</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">SĐT</label>
          <input
            type="text"
            value={soDienThoai}
            onChange={(e) => setSoDienThoai(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="0xxx..."
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="email@example.com"
          />
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setError('') }}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
        >
          Hủy
        </button>
      </div>
    </form>
  )
}

function RefundInfoSection({ order }) {
  const isVnpayDaThanhToan = order.trangThai === 'DaHuy' &&
    order.phuongThucThanhToan === 'VNPAY' &&
    order.trangThaiThanhToan === 'DaThanhToan'

  if (!isVnpayDaThanhToan) return null

  return (
    <div className="mb-5">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Thông tin hoàn tiền
      </h4>
      <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 shadow-sm">
        {order.trangThaiHuy === 'DaHoanTien' ? (
          <>
            <div className="mb-3 flex items-center gap-2 text-green-700">
              <span className="text-xl">✓</span>
              <span className="font-semibold">Đã hoàn tiền</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <InfoRow label="Số tiền hoàn" value={order.soTienHoan ? formatPrice(order.soTienHoan) : '-'} />
              <InfoRow label="Ngày hoàn" value={order.ngayHoanTien ? new Date(order.ngayHoanTien).toLocaleDateString('vi-VN') : '-'} />
              <InfoRow label="Mã giao dịch" value={order.maGiaoDichHoan || '-'} />
              <InfoRow label="Người xử lý" value={order.nguoiXuLyHoan || '-'} />
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2 text-purple-700">
              <span className="text-xl">⏳</span>
              <span className="font-semibold">Chờ hoàn tiền</span>
            </div>
            <InfoRow label="Ngày yêu cầu" value={order.ngayYeuCauHuy ? new Date(order.ngayYeuCauHuy).toLocaleString('vi-VN') : '-'} />
            {order.lyDoHuy && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">Lý do: </span>
                <span className="text-sm text-gray-700">{order.lyDoHuy}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function RefundHistorySection({ orderId, history, loading }) {
  if (!history || history.length === 0) return null

  return (
    <div className="mb-5">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Lịch sử hoàn tiền
      </h4>
      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.maLichSu} className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">{item.hoTenNguoiXuLy}</span>
              <span className="text-sm font-bold text-green-600">{formatPrice(item.soTienHoan)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <span>{new Date(item.ngayXuLy).toLocaleString('vi-VN')}</span>
              {item.maGiaoDichHoan && (
                <>
                  <span>•</span>
                  <span>Mã GD: {item.maGiaoDichHoan}</span>
                </>
              )}
            </div>
            {item.ghiChu && (
              <p className="mt-2 text-sm text-gray-600">{item.ghiChu}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RefundForm({ order, onSuccess }) {
  const [soTienHoan, setSoTienHoan] = useState(order.tongThanhToan.toString())
  const [maGiaoDichHoan, setMaGiaoDichHoan] = useState('')
  const [nguoiXuLyHoan, setNguoiXuLyHoan] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const soTien = parseFloat(soTienHoan)
    if (isNaN(soTien) || soTien < 0) {
      setError('Số tiền hoàn không hợp lệ.')
      return
    }

    const confirmed = await confirmAction(
      'Xác nhận hoàn tiền',
      `Bạn có chắc muốn xử lý hoàn tiền cho đơn #${order.maDonHang}?`
    )
    if (!confirmed) return

    setLoading(true)
    try {
      await processRefund(order.maDonHang, {
        soTienHoan: soTien,
        maGiaoDichHoan: maGiaoDichHoan.trim() || null,
        nguoiXuLyHoan: nguoiXuLyHoan.trim() || null,
        ghiChu: ghiChu.trim() || null,
      })
      showSuccess(`Đã xử lý hoàn tiền cho đơn #${order.maDonHang}`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-800">
        <span className="text-lg">🔄</span> Xử lý hoàn tiền
      </h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Số tiền hoàn (VND) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={soTienHoan}
            onChange={(e) => setSoTienHoan(e.target.value)}
            min="0"
            step="1000"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Tổng thanh toán: {formatPrice(order.tongThanhToan)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Mã giao dịch hoàn</label>
            <input
              type="text"
              value={maGiaoDichHoan}
              onChange={(e) => setMaGiaoDichHoan(e.target.value)}
              placeholder="VD: REF123456"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Người xử lý</label>
            <input
              type="text"
              value={nguoiXuLyHoan}
              onChange={(e) => setNguoiXuLyHoan(e.target.value)}
              placeholder="Tên người xử lý"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Ghi chú</label>
          <textarea
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            rows={2}
            placeholder="Ghi chú thêm (tuỳ chọn)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
        </button>
      </form>
    </div>
  )
}

export default function OrderDetailModal({ orderId, onClose, onSuccess }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refundHistory, setRefundHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getAdminOrderDetail(orderId)
        if (!cancelled) setOrder(data)

        if (data.yeuCauHuy) {
          setHistoryLoading(true)
          try {
            const history = await getRefundHistory(orderId)
            if (!cancelled) setRefundHistory(history)
          } catch {
            // ignore
          } finally {
            if (!cancelled) setHistoryLoading(false)
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [orderId])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleCustomerUpdated = (updatedOrder) => {
    setOrder(updatedOrder)
    onSuccess?.(updatedOrder)
  }

  const handleRefundSuccess = async () => {
    try {
      const history = await getRefundHistory(orderId)
      setRefundHistory(history)
    } catch {
      // ignore
    }
    try {
      const data = await getAdminOrderDetail(orderId)
      setOrder(data)
      onSuccess?.(data)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[20px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
      >
        {/* Header - Gradient style */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-amber-50/50 px-6 pb-5 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/80 text-xl text-gray-400 shadow-sm transition hover:bg-white hover:text-gray-700"
            aria-label="Đóng"
          >
            ×
          </button>

          {loading ? (
            <div className="h-10 w-56 animate-pulse rounded-xl bg-gray-200" />
          ) : error ? (
            <p className="font-display text-xl font-bold text-red-500">Không thể tải chi tiết</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 pr-10">
                <h3 id="order-detail-title" className="font-display text-2xl font-bold text-gray-800">
                  {formatOrderCode(order?.maDonHang)}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getOrderStatusColor(order?.trangThai)}`}
                >
                  {getOrderStatusLabel(order?.trangThai)}
                </span>
                {order && <PaymentBadge order={order} />}
              </div>
              <p className="mt-1.5 text-sm text-gray-500">
                Đặt lúc {order ? formatOrderDate(order.ngayTao) : ''}
              </p>
            </>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && order && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column - 2 cols */}
              <div className="lg:col-span-2 space-y-5">
                {/* Timeline trạng thái */}
                <div className="rounded-2xl border border-cream-dark bg-cream/20 p-4">
                  <OrderStatusTimeline status={order.trangThai} />
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getOrderStatusColor(order?.trangThai)}`}
                  >
                    {getOrderStatusLabel(order?.trangThai)}
                  </span>
                  <PaymentBadge order={order} />
                </div>

                {/* Thông tin hoàn tiền */}
                <RefundInfoSection order={order} />

                {/* Lịch sử hoàn tiền */}
                <RefundHistorySection orderId={orderId} history={refundHistory} loading={historyLoading} />

                {/* Form hoàn tiền */}
                {order.trangThai === 'DaHuy' &&
                  order.yeuCauHuy === true &&
                  order.trangThaiHuy === 'ChoHoanTien' && (
                    <RefundForm order={order} onSuccess={handleRefundSuccess} />
                  )}

                {/* Thông tin giao hàng */}
                {order.giaoHang && (
                  <div>
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Thông tin giao hàng
                    </h4>
                    <div className="rounded-2xl border border-cream-dark bg-white p-4 shadow-sm">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoRow label="Người nhận" value={order.giaoHang.nguoiNhan} />
                        <InfoRow label="SĐT nhận" value={order.giaoHang.sdtNguoiNhan} />
                        <div className="sm:col-span-2">
                          <InfoRow label="Địa chỉ" value={order.giaoHang.diaChiGiao} />
                        </div>
                        <InfoRow label="Phí ship" value={formatPrice(order.giaoHang.phiGiaoHang)} />
                        <InfoRow label="Shipper" value={order.giaoHang.tenShipper || 'Chưa gán'} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sản phẩm */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Sản phẩm ({order.items?.length ?? 0} món)
                  </h4>
                  <ul className="space-y-3">
                    {(order.items || []).map((item) => (
                      <li key={`${item.maSanPham}-${item.donGia}`} className="flex items-center gap-3 rounded-2xl border border-cream-dark bg-white p-3 shadow-sm">
                        <img
                          src={resolveMediaUrl(item.hinhAnh) || PLACEHOLDER_IMAGE}
                          alt={item.tenSanPham}
                          className="size-16 shrink-0 rounded-xl border border-cream-dark object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800">{item.tenSanPham}</p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {item.soLuong} × {formatPrice(item.donGia)}
                          </p>
                          {item.ghiChu && (
                            <p className="mt-0.5 text-xs text-gray-400 italic">{item.ghiChu}</p>
                          )}
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-gray-800">
                          {formatPrice(item.thanhTien)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column - 1 col */}
              <div className="space-y-5">
                {/* Tóm tắt thanh toán */}
                <div className="rounded-2xl border border-cream-dark bg-cream/30 p-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Tóm tắt thanh toán
                  </h4>
                  <div className="space-y-2 text-sm">
                    <InfoRow label="Tạm tính" value={formatPrice(order.tongTamTinh)} />
                    {order.soTienGiam > 0 && (
                      <InfoRow label="Giảm giá" value={`-${formatPrice(order.soTienGiam)}`} />
                    )}
                    <InfoRow
                      label="Phí giao hàng"
                      value={order.giaoHang?.phiGiaoHang > 0 ? formatPrice(order.giaoHang.phiGiaoHang) : 'Miễn phí'}
                    />
                    <div className="flex justify-between gap-4 border-t border-cream-dark pt-2 text-base">
                      <span className="font-semibold text-gray-800">Tổng thanh toán</span>
                      <span className="font-bold text-primary">{formatPrice(order.tongThanhToan)}</span>
                    </div>
                  </div>
                </div>

                {/* Thông tin khách hàng */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Khách hàng
                  </h4>
                  <div className="rounded-2xl border border-cream-dark bg-white p-4 shadow-sm">
                    <div className="space-y-2 text-sm">
                      <InfoRow label="Tên" value={order.tenKhachHang || 'Khách vãng lai'} />
                      <InfoRow label="Kênh" value="Đặt web · Giao tận nơi" />
                      <InfoRow label="Thanh toán" value={PAYMENT_METHOD_LABELS[order.phuongThucThanhToan] || order.phuongThucThanhToan} />
                      <InfoRow label="Hóa đơn" value={order.soHoaDon || '—'} />
                      {order.ghiChu && (
                        <InfoRow label="Ghi chú" value={order.ghiChu} />
                      )}
                    </div>
                    <CustomerEditSection order={order} onUpdated={handleCustomerUpdated} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-cream-dark bg-cream/20 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

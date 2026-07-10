import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../../lib/formatPrice'
import {
  formatOrderCode,
  formatOrderDate,
  getOrderStatusColor,
  getOrderStatusDescription,
  getOrderStatusLabel,
} from '../../../lib/orderStatus'
import { paths } from '../../../routes/paths'
import { requestCancelOrder, getMyOrders, getMyOrderDetail } from '../../../services/orderService'
import OrderDetailModal from './OrderDetailModal'
import { showError, showSuccess } from '../../../lib/swal'

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

function RefundStatusBadge({ order }) {
  if (!order.yeuCauHuy) return null

  if (order.trangThaiHuy === 'DaHoanTien') {
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
        Đã hoàn tiền
      </span>
    )
  }

  return (
    <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800">
      Chờ hoàn tiền
    </span>
  )
}

function CancelOrderModal({ order, onClose, onSuccess }) {
  const [lyDoHuy, setLyDoHuy] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!lyDoHuy.trim()) {
      setError('Vui lòng nhập lý do hủy.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await requestCancelOrder(order.maDonHang, lyDoHuy.trim())
      showSuccess(result.thongBao || 'Yêu cầu hủy đã được ghi nhận.')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Yêu cầu hủy đơn hàng</h2>

        <div className="mb-4 rounded-xl bg-amber-50 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Mã đơn:</span> {formatOrderCode(order.maDonHang)}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Số tiền:</span> {formatPrice(order.tongThanhToan)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Lý do hủy <span className="text-red-500">*</span>
          </label>
          <textarea
            value={lyDoHuy}
            onChange={(e) => setLyDoHuy(e.target.value)}
            placeholder="VD: Đặt nhầm, thay đổi địa chỉ, không còn nhu cầu..."
            rows={3}
            className="mb-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <div className="mb-4 rounded-xl bg-blue-50 p-4">
            <p className="mb-2 text-sm font-semibold text-blue-800">Sau khi gửi yêu cầu:</p>
            <ul className="space-y-1 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <span className="text-primary">📱</span> Zalo: <span className="font-semibold">0769472076</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✉️</span> Email: <span className="font-semibold">support@flygo.vn</span>
              </li>
            </ul>
            <p className="mt-2 text-xs text-blue-600">
              Liên hệ để được hoàn tiền trong 24-48h
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RefundContactInfo({ order }) {
  return (
    <div className="mt-3 rounded-xl bg-purple-50 p-4">
      <p className="mb-2 text-sm font-semibold text-purple-800">Thông tin hoàn tiền</p>
      <ul className="space-y-1 text-sm text-purple-700">
        <li className="flex items-center gap-2">
          <span>📱</span> Zalo: <span className="font-semibold">0769472076</span>
        </li>
        <li className="flex items-center gap-2">
          <span>✉️</span> Email: <span className="font-semibold">support@flygo.vn</span>
        </li>
      </ul>
      <p className="mt-2 text-xs text-purple-600">
        Liên hệ để được hoàn tiền trong 24-48h
      </p>
    </div>
  )
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [detailOrder, setDetailOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const [cancelModalOrder, setCancelModalOrder] = useState(null)

  const loadOrders = useCallback(() => {
    setLoading(true)
    setError('')

    getMyOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const openDetail = useCallback((order) => {
    setDetailOrder(null)
    setDetailError('')
    setDetailLoading(true)
    setDetailOrder(order)

    getMyOrderDetail(order.maDonHang)
      .then((data) => setDetailOrder(data))
      .catch((err) => {
        setDetailError(err.message)
        setDetailOrder(null)
      })
      .finally(() => setDetailLoading(false))
  }, [])

  const canRequestCancel = (order) => {
    if (order.trangThaiHuy) return false
    return order.trangThai === 'ChoBep' || order.trangThai === 'ChoThanhToan'
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
        Đang tải đơn hàng...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border border-cream-dark bg-white shadow-sm">
        <div className="border-b border-cream-dark px-6 py-5">
          <h1 className="font-display text-2xl font-semibold text-gray-800">Đơn hàng của tôi</h1>
          <p className="mt-1 text-sm text-gray-500">{orders.length} đơn trong lịch sử</p>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-gray-700">Chưa có đơn hàng nào</p>
            <p className="mt-1 text-sm text-gray-500">Đặt món từ thực đơn để theo dõi tại đây</p>
            <Link
              to={paths.PRODUCTS}
              className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-primary-dark"
            >
              Xem thực đơn
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-cream-dark">
            {orders.map((order) => (
              <article key={order.maDonHang} className="px-6 py-5 transition hover:bg-cream/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-800">{formatOrderCode(order.maDonHang)}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getOrderStatusColor(order.trangThai)}`}>
                        {getOrderStatusLabel(order.trangThai)}
                      </span>
                      <PaymentBadge order={order} />
                      <RefundStatusBadge order={order} />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{formatOrderDate(order.ngayTao)}</p>
                    <p className="mt-1 text-sm text-primary/90">{getOrderStatusDescription(order.trangThai)}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.soMon} món · {order.nguoiNhan || 'Người nhận'}
                    </p>
                    {order.diaChiGiao && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{order.diaChiGiao}</p>
                    )}

                    {order.yeuCauHuy && order.trangThaiHuy === 'ChoHoanTien' && (
                      <RefundContactInfo order={order} />
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <p className="text-lg font-bold text-primary">{formatPrice(order.tongThanhToan)}</p>
                    <button
                      type="button"
                      onClick={() => openDetail(order)}
                      className="rounded-full border border-primary/30 bg-white px-4 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:border-primary/60 hover:bg-primary/5"
                    >
                      Xem chi tiết
                    </button>
                    {canRequestCancel(order) && (
                      <button
                        type="button"
                        onClick={() => setCancelModalOrder(order)}
                        className="rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-100"
                      >
                        Yêu cầu hủy
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {(detailOrder !== null || detailLoading) && (
        <OrderDetailModal
          order={detailOrder}
          loading={detailLoading}
          error={detailError}
          onClose={() => {
            setDetailOrder(null)
            setDetailError('')
          }}
        />
      )}

      {cancelModalOrder && (
        <CancelOrderModal
          order={cancelModalOrder}
          onClose={() => setCancelModalOrder(null)}
          onSuccess={loadOrders}
        />
      )}
    </>
  )
}

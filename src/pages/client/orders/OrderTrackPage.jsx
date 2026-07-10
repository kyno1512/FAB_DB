import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHero from '../../../components/common/PageHero'
import { container } from '../../../lib/classes'
import { formatPrice } from '../../../lib/formatPrice'
import { resolveMediaUrl, NEWS_PLACEHOLDER_IMAGE } from '../../../lib/mediaUrl'
import {
  canCancelOrder,
  formatOrderCode,
  formatOrderDate,
  getOrderStatusColor,
  getOrderStatusDescription,
  getOrderStatusLabel,
} from '../../../lib/orderStatus'
import { paths } from '../../../routes/paths'
import { STORE } from '../../../constants/store'
import { cancelOrderByToken, trackOrder } from '../../../services/orderService'
import CancelOrderButton from './components/CancelOrderButton'
import OrderStatusTimeline from './components/OrderStatusTimeline'

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

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  )
}

function RefundContactInfo({ order }) {
  return (
    <div className="mt-3 rounded-xl bg-purple-50 p-4">
      <p className="mb-2 text-sm font-semibold text-purple-800">Thông tin hoàn tiền</p>
      <ul className="space-y-1 text-sm text-purple-700">
        <li className="flex items-center gap-2">
          <span>📱</span> Zalo: <a href={STORE.zaloUrl} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{STORE.zaloPhoneDisplay}</a>
        </li>
        <li className="flex items-center gap-2">
          <span>✉️</span> Email: <a href={`mailto:${STORE.supportEmail}`} className="font-semibold hover:underline">{STORE.supportEmail}</a>
        </li>
      </ul>
      <p className="mt-2 text-xs text-purple-600">
        Liên hệ để được hoàn tiền trong 24-48h
      </p>
    </div>
  )
}

export default function OrderTrackPage() {
  const [params] = useSearchParams()
  const token = params.get('t')?.trim() ?? ''

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState('')

  const loadOrder = useCallback(() => {
    if (!token) {
      setOrder(null)
      setLoading(false)
      setError('')
      return
    }

    setLoading(true)
    setError('')

    trackOrder(token)
      .then((data) => setOrder(data))
      .catch((err) => {
        setOrder(null)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const delivery = order?.giaoHang
  const shipFee = delivery?.phiGiaoHang ?? 0

  return (
    <>
      <PageHero
        eyebrow="Theo dõi đơn hàng"
        title="Tra cứu đơn hàng"
        description="Mở link trong email xác nhận hoặc dán mã theo dõi để xem trạng thái đơn."
      />

      <div className={`${container} py-10 sm:py-12`}>
        {!token ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-cream-dark bg-white p-8 text-center shadow-sm">
            <p className="font-medium text-gray-800">Thiếu mã theo dõi</p>
            <p className="mt-2 text-sm text-gray-500">
              Kiểm tra email xác nhận từ Flygo và bấm nút &quot;THEO DÕI ĐƠN HÀNG&quot;.
            </p>
            <Link
              to={paths.PRODUCTS}
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-primary-dark"
            >
              Về thực đơn
            </Link>
          </div>
        ) : loading ? (
          <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            Đang tải đơn hàng...
          </div>
        ) : error ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <p className="font-medium text-red-600">{error}</p>
            <p className="mt-2 text-sm text-gray-500">Link có thể hết hạn hoặc không đúng. Kiểm tra lại email xác nhận.</p>
            <p className="mt-4 text-sm text-gray-600">
              Cần hỗ trợ? Gọi{' '}
              <a href={`tel:${STORE.hotlineTel}`} className="font-semibold text-primary">
                {STORE.hotline}
              </a>{' '}
              hoặc{' '}
              <a href={STORE.zaloUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">
                Zalo {STORE.zaloPhoneDisplay}
              </a>
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="rounded-3xl border border-cream-dark bg-white shadow-sm">
              <div className="border-b border-cream-dark px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold text-gray-800">
                    {formatOrderCode(order.maDonHang)}
                  </h1>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getOrderStatusColor(order.trangThai)}`}>
                    {getOrderStatusLabel(order.trangThai)}
                  </span>
                  <PaymentBadge order={order} />
                </div>
                <p className="mt-2 text-sm text-gray-500">Đặt lúc {formatOrderDate(order.ngayTao)}</p>
                <p className="mt-2 text-sm text-gray-600">{getOrderStatusDescription(order.trangThai)}</p>
              </div>

              <div className="border-b border-cream-dark px-6 py-5">
                <OrderStatusTimeline status={order.trangThai} />
              </div>

              <div className="space-y-3 px-6 py-5">
                <InfoRow label="Người nhận" value={delivery?.nguoiNhan || order.tenKhachHang || '—'} />
                <InfoRow label="Số điện thoại" value={delivery?.sdtNguoiNhan || order.soDienThoai || '—'} />
                <InfoRow label="Địa chỉ giao" value={delivery?.diaChiGiao || '—'} />
                <InfoRow label="Thanh toán" value={order.phuongThucThanhToan === 'COD' ? 'COD' : 'VNPay'} />
              </div>

              <div className="border-t border-cream-dark px-6 py-5">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Sản phẩm</h2>
                <ul className="space-y-3">
                  {order.items?.map((item) => (
                    <li key={item.maSanPham} className="flex items-center gap-3">
                      <img
                        src={resolveMediaUrl(item.hinhAnh) || NEWS_PLACEHOLDER_IMAGE}
                        alt=""
                        className="size-14 rounded-xl border border-cream-dark object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800">{item.tenSanPham}</p>
                        <p className="text-sm text-gray-500">
                          {item.soLuong} × {formatPrice(item.donGia)}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-gray-800">{formatPrice(item.thanhTien)}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 border-t border-cream-dark bg-cream/30 px-6 py-5 text-sm">
                <InfoRow label="Tạm tính" value={formatPrice(order.tongTamTinh)} />
                <InfoRow label="Giảm giá" value={`-${formatPrice(order.soTienGiam)}`} />
                {shipFee > 0 ? (
                  <InfoRow label="Phí giao hàng" value={formatPrice(shipFee)} />
                ) : (
                  <InfoRow label="Phí giao hàng" value="Miễn phí (Quận 1)" />
                )}
                <div className="flex justify-between gap-4 pt-2 text-base">
                  <span className="font-semibold text-gray-800">Tổng thanh toán</span>
                  <span className="font-bold text-primary">{formatPrice(order.tongThanhToan)}</span>
                </div>
              </div>

              {canCancelOrder(order.trangThai) && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream-dark px-6 py-5">
                  <p className="text-sm text-gray-500">Bạn có thể hủy đơn khi chưa vào bếp.</p>
                  <CancelOrderButton
                    maDonHang={order.maDonHang}
                    cancelFn={() => cancelOrderByToken(token)}
                    onCancelled={loadOrder}
                  />
                </div>
              )}

              {order.trangThai === 'DaHuy' && (
                <div className="border-t border-purple-200 bg-purple-50 px-6 py-5 text-sm">
                  {order.trangThaiThanhToan === 'DaThanhToan' ? (
                    <>
                      <p className="mb-2 font-semibold text-purple-800">Đơn hàng đã được hủy.</p>
                      <p className="mb-3 text-purple-700">Đơn đã thanh toán qua VNPAY. Vui lòng liên hệ để được hoàn tiền trong 24-48h.</p>
                    </>
                  ) : order.phuongThucThanhToan === 'VNPay' ? (
                    <>
                      <p className="mb-2 font-semibold text-purple-800">Đơn hàng đã được hủy.</p>
                      <p className="mb-3 text-purple-700">Đơn chưa thanh toán hoặc đang chờ thanh toán VNPAY. Nếu cần hỗ trợ, vui lòng liên hệ:</p>
                    </>
                  ) : (
                    <>
                      <p className="mb-2 font-semibold text-purple-800">Đơn hàng đã được hủy.</p>
                      <p className="mb-3 text-purple-700">Nếu cần hỗ trợ, vui lòng liên hệ:</p>
                    </>
                  )}
                  <RefundContactInfo order={order} />
                </div>
              )}
            </div>

            <p className="text-center text-sm text-gray-500">
              Có tài khoản?{' '}
              <Link to={paths.ACCOUNT_ORDERS} className="font-semibold text-primary no-underline hover:underline">
                Xem tất cả đơn hàng
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  )
}

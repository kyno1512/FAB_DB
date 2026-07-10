import { formatPrice } from '../../../lib/formatPrice'
import { resolveMediaUrl, NEWS_PLACEHOLDER_IMAGE } from '../../../lib/mediaUrl'
import {
  formatOrderCode,
  formatOrderDate,
  getOrderStatusColor,
  getOrderStatusLabel,
} from '../../../lib/orderStatus'
import OrderStatusTimeline from '../orders/components/OrderStatusTimeline'

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

function RefundInfo({ order }) {
  if (!order.yeuCauHuy) return null

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
              <span className="font-semibold">Đang chờ hoàn tiền</span>
            </div>
            <InfoRow label="Ngày yêu cầu" value={order.ngayYeuCauHuy ? new Date(order.ngayYeuCauHuy).toLocaleDateString('vi-VN') : '-'} />
            {order.lyDoHuy && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">Lý do: </span>
                <span className="text-sm text-gray-700">{order.lyDoHuy}</span>
              </div>
            )}
            <div className="mt-4 rounded-xl bg-white p-3">
              <p className="mb-2 text-sm font-semibold text-purple-800">Liên hệ để được hoàn tiền:</p>
              <ul className="space-y-1 text-sm text-purple-700">
                <li className="flex items-center gap-2">
                  <span>📱</span> Zalo: <span className="font-semibold">0769472076</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>✉️</span> Email: <span className="font-semibold">support@flygo.vn</span>
                </li>
              </ul>
              <p className="mt-2 text-xs text-purple-600">
                Thời gian hoàn tiền: 24-48h sau khi liên hệ
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value || '—'}</span>
    </div>
  )
}

export default function OrderDetailModal({ order, loading, error, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[20px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-200" />
          ) : error ? (
            <p className="font-display text-xl font-bold text-red-500">Không thể tải chi tiết</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 pr-10">
                <h3 className="font-display text-2xl font-bold text-gray-800">
                  {formatOrderCode(order?.maDonHang)}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getOrderStatusColor(order?.trangThai)}`}
                >
                  {getOrderStatusLabel(order?.trangThai)}
                </span>
                {order && <PaymentBadge order={order} />}
                {order && <RefundStatusBadge order={order} />}
              </div>
              {order && (
                <p className="mt-1.5 text-sm text-gray-500">Đặt lúc {formatOrderDate(order.ngayTao)}</p>
              )}
            </>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : (
            <>
              {/* Trạng thái timeline */}
              <div className="mb-5 rounded-2xl border border-cream-dark bg-cream/20 p-4">
                <OrderStatusTimeline status={order.trangThai} />
              </div>

              {/* Thông tin hoàn tiền */}
              <RefundInfo order={order} />

              {/* Sản phẩm */}
              <div className="mb-5">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Sản phẩm ({order.soMon ?? order.items?.length ?? 0} món)
                </h4>
                <ul className="space-y-3">
                  {(order.items || []).map((item) => (
                    <li key={item.maSanPham} className="flex items-center gap-3 rounded-2xl border border-cream-dark bg-white p-3 shadow-sm">
                      <img
                        src={resolveMediaUrl(item.hinhAnh) || NEWS_PLACEHOLDER_IMAGE}
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

              {/* Thông tin giao hàng */}
              {(order.giaoHang?.nguoiNhan || order.tenKhachHang) && (
                <div className="mb-5">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Thông tin giao hàng
                  </h4>
                  <div className="rounded-2xl border border-cream-dark bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoRow label="Người nhận" value={order.giaoHang?.nguoiNhan || order.tenKhachHang} />
                      <InfoRow label="Số điện thoại" value={order.giaoHang?.sdtNguoiNhan || order.soDienThoai} />
                      <div className="sm:col-span-2">
                        <InfoRow label="Địa chỉ giao" value={order.giaoHang?.diaChiGiao} />
                      </div>
                      <InfoRow label="Phương thức" value={order.phuongThucThanhToan === 'COD' ? 'COD (nhận tiền khi giao)' : 'VNPay (thanh toán online)'} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tổng kết thanh toán */}
              <div className="rounded-2xl border border-cream-dark bg-cream/30 p-4 text-sm">
                <div className="space-y-2">
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
            </>
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

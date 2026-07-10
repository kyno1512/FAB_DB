export const ORDER_STATUS_LABELS = {
  ChoThanhToan: 'Chờ thanh toán',
  ChoBep: 'Chờ bếp',
  DangChuanBi: 'Đang chuẩn bị',
  ChoGiaoHang: 'Chờ giao hàng',
  DangGiao: 'Đang giao',
  HoanThanh: 'Hoàn thành',
  DaHuy: 'Đã hủy',
  DaHoanTien: 'Đã hoàn tiền',
}

export const ORDER_STATUS_COLORS = {
  ChoThanhToan: 'bg-yellow-100 text-yellow-800',
  ChoBep: 'bg-orange-100 text-orange-800',
  DangChuanBi: 'bg-blue-100 text-blue-800',
  ChoGiaoHang: 'bg-indigo-100 text-indigo-800',
  DangGiao: 'bg-cyan-100 text-cyan-800',
  HoanThanh: 'bg-green-100 text-green-800',
  DaHuy: 'bg-red-100 text-red-800',
  DaHoanTien: 'bg-purple-100 text-purple-800',
}

export function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] ?? status
}

export function getOrderStatusColor(status) {
  return ORDER_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
}

export function formatOrderCode(maDonHang) {
  return `#ORD-${String(maDonHang).padStart(4, '0')}`
}

export function formatOrderDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Khách được tự hủy khi đơn còn ở giai đoạn sớm */
export function canCancelOrder(status) {
  return status === 'ChoThanhToan' || status === 'ChoBep'
}

/** Các bước hiển thị cho khách theo dõi đơn */
export const ORDER_STATUS_TIMELINE = [
  {
    key: 'placed',
    label: 'Đã đặt hàng',
    statuses: ['ChoThanhToan', 'ChoBep'],
    doneHint: 'Flygo đã nhận đơn của bạn.',
  },
  {
    key: 'kitchen',
    label: 'Chờ bếp / Đang làm',
    statuses: ['DangChuanBi'],
    doneHint: 'Bếp đã nhận và xử lý đơn.',
  },
  {
    key: 'ready',
    label: 'Chờ giao hàng',
    statuses: ['ChoGiaoHang'],
    doneHint: 'Món đã sẵn sàng để giao.',
  },
  {
    key: 'shipping',
    label: 'Đang giao hàng',
    statuses: ['DangGiao'],
    doneHint: 'Shipper đã nhận đơn đi giao.',
  },
  {
    key: 'done',
    label: 'Đã giao thành công',
    statuses: ['HoanThanh'],
    doneHint: 'Đơn hàng đã hoàn tất.',
  },
]

const ORDER_STATUS_DESCRIPTIONS = {
  ChoThanhToan: 'Đơn đang chờ thanh toán VNPay. Sau khi thanh toán, bếp sẽ bắt đầu làm món.',
  ChoBep: 'Flygo đã nhận đơn. Bếp sẽ sớm bắt đầu chuẩn bị món cho bạn.',
  DangChuanBi: 'Đầu bếp đang hoàn thiện món. Vui lòng chờ trong giây lát.',
  ChoGiaoHang: 'Món đã xong, đang chờ shipper nhận đi giao.',
  DangGiao: 'Shipper đang trên đường giao tới địa chỉ của bạn.',
  HoanThanh: 'Đơn hàng đã giao thành công. Cảm ơn bạn đã mua tại Flygo!',
  DaHuy: 'Đơn hàng đã được hủy.',
  DaHoanTien: 'Đơn hàng đã hủy và hoàn tiền thành công. Cảm ơn bạn đã mua tại Flygo!',
}

export function getOrderStatusDescription(status) {
  return ORDER_STATUS_DESCRIPTIONS[status] ?? 'Đang cập nhật trạng thái đơn hàng.'
}

export function getOrderStatusStepIndex(status) {
  if (status === 'ChoThanhToan' || status === 'ChoBep') return 0
  if (status === 'DangChuanBi') return 1
  if (status === 'ChoGiaoHang') return 2
  if (status === 'DangGiao') return 3
  if (status === 'HoanThanh') return 4
  return 0
}

export const POINT_TIERS = [
  { id: 'regular', label: 'Thành viên thường', min: 0, max: 499 },
  { id: 'vip', label: 'Thành viên VIP', min: 500, max: null },
]

export function getMemberTier(points) {
  return points >= 500 ? POINT_TIERS[1] : POINT_TIERS[0]
}

export function getNextTierProgress(points) {
  if (points >= 500) {
    return { current: points, target: 500, label: 'VIP', remaining: 0, percent: 100 }
  }

  return {
    current: points,
    target: 500,
    label: 'VIP',
    remaining: 500 - points,
    percent: Math.min(100, Math.round((points / 500) * 100)),
  }
}

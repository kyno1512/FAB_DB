import { getProductImageUrl } from './productImage'
import { formatPrice } from './formatPrice'
import { aiSuggestions as demoAiSuggestions } from '../data/adminData'

const AVATAR_COLORS = ['#1e6b6b', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981']

function toInputDate(d) {
  return new Date(d).toISOString().slice(0, 10)
}

function pctChange(current, previous) {
  const cur = Number(current) || 0
  const prev = Number(previous) || 0
  if (prev === 0) return cur > 0 ? { trend: '+100%', up: true } : { trend: '—', up: true }
  const pct = ((cur - prev) / prev) * 100
  return {
    trend: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
    up: pct >= 0,
  }
}

function isDrinkCategory(name = '') {
  const n = name.toLowerCase()
  return (
    n.includes('cà phê') ||
    n.includes('ca phe') ||
    n.includes('đồ uống') ||
    n.includes('do uong') ||
    n.includes('coffee') ||
    n.includes('trà') ||
    n.includes('tra ')
  )
}

function isPastryCategory(name = '') {
  const n = name.toLowerCase()
  return n.includes('bánh') || n.includes('banh') || n.includes('ngọt') || n.includes('bakery')
}

export function buildRevenueChartData(weekReport, period = '7d') {
  let drinks = 0
  let pastry = 0
  let other = 0

  for (const item of weekReport?.revenueByCategory ?? []) {
    const value = Number(item.doanhThu) || 0
    if (isDrinkCategory(item.tenDanhMuc)) drinks += value
    else if (isPastryCategory(item.tenDanhMuc)) pastry += value
    else other += value
  }

  const compareItems = [
    { name: 'Cà phê & đồ uống', value: drinks, barClass: 'bg-primary' },
    { name: 'Bánh ngọt', value: pastry, barClass: 'bg-[#b0b8c4]' },
  ]
  if (other > 0) {
    compareItems.push({ name: 'Khác', value: other, barClass: 'bg-amber-400' })
  }

  const maxCategory = Math.max(...compareItems.map((item) => item.value), 1)
  const categoryCompare = compareItems.map((item) => ({
    ...item,
    pct: item.value > 0 ? Math.max(8, Math.round((item.value / maxCategory) * 100)) : 0,
    display: formatPrice(item.value),
  }))

  const series = [...(weekReport?.revenueSeries ?? [])]
    .map((point) => ({
      date: new Date(point.periodStart || point.label),
      value: Number(point.doanhThu) || 0,
      orders: Number(point.soDon) || 0,
    }))
    .filter((point) => !Number.isNaN(point.date.getTime()))
    .sort((a, b) => a.date - b.date)

  const limit =
    period === '12m'
      ? 12
      : period === '30d'
        ? 30
        : 7

  const sliced = series.slice(-limit)

  const points = sliced.map((point) => ({
    label:
      period === '12m'
        ? point.date.toLocaleDateString('vi-VN', { month: 'short' })
        : point.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    value: point.value,
    orders: point.orders,
    display: formatPrice(point.value),
  }))

  const maxDaily = Math.max(...points.map((item) => item.value), 1)
  const dailyBars = points.map((item) => ({
    ...item,
    pct: item.value > 0 ? Math.max(8, Math.round((item.value / maxDaily) * 100)) : 0,
  }))

  const hasData =
    categoryCompare.some((item) => item.value > 0) || dailyBars.some((item) => item.value > 0)

  return { categoryCompare, dailyBars, hasData, areaPoints: points }
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'KH'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function mapOrderStatus(trangThai) {
  if (trangThai === 'HoanThanh') return 'done'
  if (trangThai === 'DaHuy') return 'cancelled'
  return 'processing'
}

function formatOrderTime(ngayTao) {
  const date = new Date(ngayTao)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function buildAiSuggestions(inventory) {
  const suggestions = []
  const lowStock = inventory?.nguyenLieuSapHet ?? []

  if (lowStock.length > 0) {
    const item = lowStock[0]
    suggestions.push({
      type: 'warning',
      title: 'Cảnh báo kho hàng',
      desc: `${item.tenNguyenLieu} sắp hết (còn ${item.soLuongTon} ${item.donVi}). Nên chuẩn bị thêm trước giờ cao điểm.`,
    })
  }

  const staticItems = demoAiSuggestions.filter((item) => item.type !== 'warning')
  return [...suggestions, ...staticItems].slice(0, 3)
}

export function buildDashboardViewModel({ current, previous, weekReport, orders, periodLabel, period }) {
  const revenueTrend = pctChange(current?.revenue?.tongDoanhThu, previous?.revenue?.tongDoanhThu)
  const ordersTrend = pctChange(current?.orders?.tongDon, previous?.orders?.tongDon)
  const customersTrend = pctChange(current?.soKhachHangMoi, previous?.soKhachHangMoi)

  // Hiệu suất = tỷ lệ hoàn thành từ backend (TyLeHoanThanh), fallback tính tay nếu cần
  const totalOrders = current?.orders?.tongDon ?? 0
  const completedOrders = current?.orders?.hoanThanh ?? 0
  const tyLeHoanThanh = current?.orders?.tyLeHoanThanh ?? 0
  const efficiencyRate = tyLeHoanThanh > 0 ? Math.round(tyLeHoanThanh) : (totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0)
  const efficiencyTrend = pctChange(efficiencyRate, previous?.efficiency ?? 0)

  const statCards = [
    {
      label: 'Doanh thu tổng',
      value: formatPrice(current?.revenue?.tongDoanhThu ?? 0),
      trend: revenueTrend.trend,
      up: revenueTrend.up,
    },
    {
      label: 'Tổng đơn hàng',
      value: String(current?.orders?.tongDon ?? 0),
      trend: ordersTrend.trend,
      up: ordersTrend.up,
    },
    {
      label: 'Khách hàng mới',
      value: String(current?.soKhachHangMoi ?? 0),
      trend: customersTrend.trend,
      up: customersTrend.up,
    },
    {
      label: 'Hiệu suất',
      value: `${efficiencyRate}%`,
      trend: efficiencyTrend.trend,
      up: efficiencyTrend.up,
      progress: efficiencyRate,
    },
  ]

  const recentOrders = (orders ?? [])
    .filter((o) => o.trangThai !== 'DaHuy')
    .slice(0, 4)
    .map((order, index) => ({
      id: `#ORD-${order.maDonHang}`,
      customer: order.tenKhachHang || order.nguoiNhan || 'Khách lẻ',
      initials: getInitials(order.tenKhachHang || order.nguoiNhan || 'Khách lẻ'),
      color: AVATAR_COLORS[index % AVATAR_COLORS.length],
      time: formatOrderTime(order.ngayTao),
      total: formatPrice(order.tongThanhToan),
      status: mapOrderStatus(order.trangThai),
    }))

  const bestSellers = (current?.bestSellers ?? []).slice(0, 3).map((item) => ({
    id: item.maSanPham,
    name: item.tenSanPham,
    category: item.tenDanhMuc,
    sold: item.soLuongBan,
    trend: item.soLuongBan > 0 ? `+${Math.min(99, item.soLuongBan)}%` : '—',
    image: getProductImageUrl({
      hinhAnhChinh: item.hinhAnhChinh,
      tenSanPham: item.tenSanPham,
      tenDanhMuc: item.tenDanhMuc,
    }),
  }))

  return {
    statCards,
    revenueChart: buildRevenueChartData(weekReport, period),
    aiSuggestions: buildAiSuggestions(current?.inventory),
    recentOrders,
    bestSellers,
    periodLabel: periodLabel ?? `${new Date(current?.from).toLocaleDateString('vi-VN')} – ${new Date(current?.to).toLocaleDateString('vi-VN')}`,
  }
}

export function getDashboardDateRanges() {
  const today = new Date()
  const to = toInputDate(today)
  const from30 = toInputDate(new Date(today.getTime() - 29 * 86400000))
  const from60 = toInputDate(new Date(today.getTime() - 59 * 86400000))
  const to30 = toInputDate(new Date(today.getTime() - 30 * 86400000))
  const from7 = toInputDate(new Date(today.getTime() - 6 * 86400000))
  return { to, from30, from60, to30, from7 }
}

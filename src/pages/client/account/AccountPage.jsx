import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { getUser } from '../../../lib/authStorage'
import { formatPrice } from '../../../lib/formatPrice'
import {
  formatOrderCode,
  formatOrderDate,
  getOrderStatusColor,
  getOrderStatusLabel,
} from '../../../lib/orderStatus'
import { paths } from '../../../routes/paths'
import { getProfile, getRedirectPath, getRoleLabel, logout } from '../../../services/authService'
import { getMyOrders } from '../../../services/orderService'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN')
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      Email đã xác minh
    </span>
  )
}

function StatusPill({ children }) {
  return (
    <span className="rounded-full border border-cream-dark bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
      {children}
    </span>
  )
}

export default function AccountPage() {
  const storedUser = getUser()
  const userId = storedUser?.maNguoiDung
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return

    Promise.all([getProfile(userId), getMyOrders()])
      .then(([profileData, orderData]) => {
        setProfile(profileData)
        setOrders(Array.isArray(orderData) ? orderData.slice(0, 3) : [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  async function handleLogout() {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Đăng xuất?',
      text: 'Bạn có chắc muốn đăng xuất khỏi tài khoản?',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Ở lại',
      confirmButtonColor: '#1e6b6b',
    })

    if (!result.isConfirmed) return
    logout()
    window.location.href = paths.CLIENT_HOME
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
        Đang tải thông tin tài khoản...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
        <Link to={paths.CLIENT_HOME} className="mt-4 inline-block text-sm font-semibold text-primary no-underline">
          Về trang chủ
        </Link>
      </div>
    )
  }

  const isStaff = ['Admin', 'QuanLy', 'NhanVien'].includes(profile.tenVaiTro)
  const memberTier = profile.diemTichLuy >= 500 ? 'Thành viên VIP' : 'Thành viên thường'

  return (
    <div className="flex flex-col gap-5">
      {/* Header tổng quan */}
      <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-gray-800">{profile.hoTen}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý thông tin cá nhân, bảo mật, điểm tích lũy và đơn hàng
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusPill>{memberTier}</StatusPill>
              <Link to={paths.ACCOUNT_POINTS} className="no-underline">
                <StatusPill>{profile.diemTichLuy} điểm</StatusPill>
              </Link>
              <VerifiedBadge />
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 self-start rounded-full border border-cream-dark px-5 py-2 text-sm font-semibold text-gray-600 transition hover:border-primary/30 hover:bg-primary-light hover:text-primary"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Thẻ tài khoản */}
      <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Tài khoản</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary-light text-lg font-bold text-primary">
              {profile.anhDaiDien ? (
                <img src={profile.anhDaiDien} alt={profile.hoTen} className="size-full rounded-xl object-cover" />
              ) : (
                getInitials(profile.hoTen)
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{profile.hoTen}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <p className="mt-0.5 text-xs text-gray-400">{getRoleLabel(profile.tenVaiTro)}</p>
            </div>
          </div>
          <VerifiedBadge />
        </div>

        <div className="mt-5 grid gap-3 border-t border-cream-dark pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCell label="Số điện thoại" value={profile.soDienThoai} />
          <InfoCell label="Ngày sinh" value={profile.ngaySinh} />
          <InfoCell label="Ngày tham gia" value={formatDate(profile.ngayTao)} />
          <InfoCell label="Địa chỉ" value={profile.diaChi} className="sm:col-span-2 lg:col-span-3" />
        </div>

        {isStaff && (
          <Link
            to={getRedirectPath(profile.tenVaiTro)}
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-primary-dark"
          >
            Vào trang quản trị
          </Link>
        )}
      </div>

      {/* Đơn hàng gần đây */}
      <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-gray-800">Đơn hàng gần đây</h2>
          <Link
            to={paths.ACCOUNT_ORDERS}
            className="text-sm font-semibold text-primary no-underline hover:underline"
          >
            Xem tất cả đơn hàng
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cream-dark bg-cream/50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-gray-600">Chưa có đơn hàng nào</p>
            <p className="mt-1 text-xs text-gray-400">Đặt món từ thực đơn để xem lịch sử tại đây</p>
            <Link
              to={paths.PRODUCTS}
              className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white no-underline transition hover:bg-primary-dark"
            >
              Khám phá thực đơn
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-cream-dark rounded-xl border border-cream-dark">
            {orders.map((order) => (
              <div key={order.maDonHang} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-800">{formatOrderCode(order.maDonHang)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getOrderStatusColor(order.trangThai)}`}>
                      {getOrderStatusLabel(order.trangThai)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{formatOrderDate(order.ngayTao)} · {order.soMon} món</p>
                </div>
                <p className="font-bold text-primary">{formatPrice(order.tongThanhToan)}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function InfoCell({ label, value, className = '' }) {
  return (
    <div className={`rounded-[10px] bg-cream/60 px-4 py-3 ${className}`}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
  )
}

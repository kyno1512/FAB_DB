export const ROLE_LABELS = {
  Admin: 'Quản trị viên',
  QuanLy: 'Quản lý',
  NhanVien: 'Nhân viên',
  Shipper: 'Shipper giao hàng',
  KhachHang: 'Khách hàng',
}

export function getRoleLabel(tenVaiTro) {
  return ROLE_LABELS[tenVaiTro] ?? tenVaiTro
}

export const ROLE_COLORS = {
  Admin: 'bg-purple-100 text-purple-700',
  QuanLy: 'bg-blue-100 text-blue-700',
  NhanVien: 'bg-teal-100 text-teal-700',
  Shipper: 'bg-indigo-100 text-indigo-700',
}

import { paths } from '../routes/paths'

export const accountMenu = [
  { id: 'overview', label: 'Tổng quan', path: paths.ACCOUNT },
  { id: 'orders', label: 'Đơn hàng', path: paths.ACCOUNT_ORDERS },
  { id: 'points', label: 'Điểm tích lũy', path: paths.ACCOUNT_POINTS },
  { id: 'security', label: 'Bảo mật', path: paths.ACCOUNT_SECURITY },
  { id: 'profile', label: 'Hồ sơ', path: paths.ACCOUNT_PROFILE },
]

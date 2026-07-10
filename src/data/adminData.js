import { paths } from '../routes/paths'

export const adminMenu = [
  { id: 'overview', label: 'Tổng quan', path: paths.ADMIN_DASHBOARD },

  // Bán hàng
  { id: 'orders', label: 'Đơn hàng', path: paths.ADMIN_ORDERS, module: 'DonHang' },
  { id: 'menu', label: 'Thực đơn', path: paths.ADMIN_MENU, module: 'SanPham' },

  // Quản lý sản phẩm
  { id: 'recipes', label: 'Công thức', path: paths.ADMIN_RECIPES, module: 'SanPham' },

  // Quản lý kho
  { id: 'inventory', label: 'Kho hàng', path: paths.ADMIN_INVENTORY, module: 'Kho' },
  { id: 'suppliers', label: 'Nhà cung cấp', path: paths.ADMIN_SUPPLIER_DEBT, module: 'Kho' },

  // Quản lý khách hàng & nhân sự
  { id: 'customers', label: 'Khách hàng', path: paths.ADMIN_CUSTOMERS, module: 'KhachHang' },
  { id: 'staff', label: 'Nhân sự', path: paths.ADMIN_STAFF, module: 'NguoiDung' },

  // Marketing
  { id: 'promotions', label: 'Khuyến mãi', path: paths.ADMIN_PROMOTIONS, module: 'KhuyenMai' },
  { id: 'news', label: 'Tin tức', path: paths.ADMIN_NEWS, module: 'KhuyenMai' },

  // Thống kê
  { id: 'reports', label: 'Báo cáo', path: paths.ADMIN_REPORTS, module: 'ThongKe' },
]

export const statCards = [
  { label: 'Doanh thu tổng', value: '320.000.000đ', trend: '+12.4%', up: true },
  { label: 'Tổng đơn hàng', value: '1.240', trend: '+8.2%', up: true },
  { label: 'Khách hàng mới', value: '285', trend: '+15%', up: true },
  { label: 'Hiệu suất', value: '94%', trend: '+4%', up: true, progress: 94 },
]

export const chartLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']
export const chartCoffee = [42, 55, 48, 62, 70, 85, 78]
export const chartPastry = [30, 38, 45, 40, 52, 60, 55]

export const aiSuggestions = [
  {
    type: 'warning',
    title: 'Cảnh báo kho hàng',
    desc: 'Bánh sừng bò sắp hết (còn 8 cái). Nên chuẩn bị thêm lô mới trước giờ cao điểm.',
  },
  {
    type: 'forecast',
    title: 'Dự báo nhu cầu',
    desc: 'Dự kiến nhu cầu Cold Brew tăng 88% vào chiều nay (14h–17h).',
  },
  {
    type: 'tip',
    title: 'Mẹo doanh thu',
    desc: 'Gợi ý combo Biscotti + Cappuccino để tăng giá trị đơn hàng trung bình.',
  },
]

export const recentOrders = [
  { id: '#ORD-2041', customer: 'Trần Hoàng', initials: 'TH', color: '#1e6b6b', time: '10:42', total: '125.000đ', status: 'done' },
  { id: '#ORD-2040', customer: 'Nguyễn Lan', initials: 'NL', color: '#3b82f6', time: '10:38', total: '89.000đ', status: 'processing' },
  { id: '#ORD-2039', customer: 'Mai Khôi', initials: 'MK', color: '#8b5cf6', time: '10:31', total: '210.000đ', status: 'done' },
  { id: '#ORD-2038', customer: 'Lê Văn B', initials: 'LB', color: '#f59e0b', time: '10:25', total: '55.000đ', status: 'processing' },
]

export const bestSellers = [
  {
    name: 'Cappuccino Đặc Biệt',
    category: 'Đồ uống',
    sold: 412,
    trend: '+18%',
    image: 'https://images.unsplash.com/photo-1534778102505-7fc5b646dcef?w=120&auto=format&fit=crop',
  },
  {
    name: 'Bánh Sừng Bò Hạnh Nhân',
    category: 'Bánh ngọt',
    sold: 328,
    trend: '+12%',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120&auto=format&fit=crop',
  },
  {
    name: 'Nitro Cold Brew',
    category: 'Đồ uống',
    sold: 256,
    trend: '+24%',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=120&auto=format&fit=crop',
  },
]

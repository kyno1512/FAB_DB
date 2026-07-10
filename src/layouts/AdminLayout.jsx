import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getUser } from '../lib/authStorage'
import { paths } from '../routes/paths'
import AdminSidebar from '../pages/admin/dashboard/components/AdminSidebar'
import AdminTopBar from '../pages/admin/dashboard/components/AdminTopBar'

const ADMIN_ROLES = ['Admin', 'QuanLy', 'NhanVien', 'Shipper']
const SIDEBAR_KEY = 'flygo_admin_sidebar_collapsed'

function readSidebarCollapsed() {
  try {
    return sessionStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

export default function AdminLayout() {
  const user = getUser()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)

  useEffect(() => {
    sessionStorage.setItem(SIDEBAR_KEY, sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  if (!user?.token || !ADMIN_ROLES.includes(user.tenVaiTro)) {
    return (
      <Navigate
        to={paths.LOGIN}
        replace
        state={{ message: 'Vui lòng đăng nhập tài khoản nội bộ (Admin / Nhân viên ).' }}
      />
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f8] font-sans">
      <AdminSidebar collapsed={sidebarCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopBar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-7">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

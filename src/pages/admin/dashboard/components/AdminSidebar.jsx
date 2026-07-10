import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { adminMenu } from '../../../../data/adminData'
import { confirmAction } from '../../../../lib/swal'
import { paths } from '../../../../routes/paths'
import { logout } from '../../../../services/authService'
import { getMenuIcon } from './adminIcons'
import { usePermissions } from '../../../../hooks/usePermissions'
import { getUser } from '../../../../lib/authStorage'

export default function AdminSidebar({ collapsed = false }) {
  const navigate = useNavigate()
  const { hasModule, isAdmin, loading } = usePermissions()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const user = getUser()

  // Close menu when click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    const confirmed = await confirmAction({
      title: 'Đăng xuất?',
      text: 'Bạn sẽ quay về trang chủ Flygo.',
      confirmText: 'Đăng xuất',
      cancelText: 'Ở lại',
    })
    if (!confirmed) return

    logout()
    navigate(paths.CLIENT_HOME, { replace: true })
  }

  function handleChangePassword() {
    setShowMenu(false)
    navigate(paths.ADMIN_CHANGE_PASSWORD)
  }

  function handleProfile() {
    setShowMenu(false)
    navigate(paths.ADMIN_CHANGE_PASSWORD)
  }

  return (
    <aside
      className={`flex h-full shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white py-7 transition-[width,padding] duration-200 ${
        collapsed ? 'w-[72px] px-2' : 'w-60 px-4'
      }`}
    >
      <div className={collapsed ? 'text-center' : ''}>
        <h1 className={`font-display font-bold ${collapsed ? 'text-xl' : 'text-[1.6rem]'}`}>Flygo</h1>
        {!collapsed && (
          <span className="text-[0.65rem] font-semibold tracking-[0.12em] text-gray-500">
            NGHỆ NHÂN HIỆN ĐẠI
          </span>
        )}
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {adminMenu.map((item) => {
          // Kiểm tra quyền: nếu có module property và user không có quyền thì ẩn
          if (item.module && !isAdmin && !loading) {
            if (!hasModule(item.module)) return null
          }

          const className = ({ isActive }) =>
            `flex w-full items-center rounded-[10px] text-left text-[0.92rem] transition ${
              collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
            } ${
              isActive
                ? 'bg-primary-light font-semibold text-primary'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`

          if (item.path) {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.id === 'overview'}
                className={className}
                title={collapsed ? item.label : undefined}
              >
                {getMenuIcon(item.id)}
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.badge === 'ai' && <span className="ml-auto text-xs text-primary">✦</span>}
                  </>
                )}
              </NavLink>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              disabled
              title={collapsed ? `${item.label} (sắp có)` : 'Sắp có'}
              className={`flex cursor-not-allowed items-center rounded-[10px] text-left text-[0.92rem] text-gray-300 ${
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
              }`}
            >
              {getMenuIcon(item.id)}
              {!collapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge === 'ai' && <span className="ml-auto text-xs text-gray-300">✦</span>}
                </>
              )}
            </button>
          )
        })}
      </nav>

      {/* User info + Dropdown menu */}
      <div className="mt-4 relative" ref={menuRef}>
        {/* User info button */}
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className={`flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-2 transition hover:border-primary/30 hover:bg-primary-light ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Tài khoản' : undefined}
        >
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white text-sm">
            {user?.hoTen?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          
          {!collapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                {user?.hoTen || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[120px]">
                {user?.tenVaiTro || 'Nhân viên'}
              </p>
            </div>
          )}
          
          {!collapsed && (
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={handleChangePassword}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Thông tin
            </button>
            
            <div className="border-t border-gray-100" />
            
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

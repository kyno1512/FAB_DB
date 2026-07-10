import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import { accountMenu } from '../../../../data/accountData'
import { getUser } from '../../../../lib/authStorage'
import { paths } from '../../../../routes/paths'
import { logout } from '../../../../services/authService'
import { getAccountIcon, IconLogout } from './accountIcons'
import AccountDropdown from './AccountDropdown'

export default function AccountSidebar() {
  const navigate = useNavigate()
  const user = getUser()

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
    navigate(paths.CLIENT_HOME, { replace: true })
  }

  const location = useLocation()

  const linkClass = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-left text-[0.92rem] transition ${
      isActive
        ? 'bg-primary font-semibold text-white shadow-sm'
        : 'text-gray-500 hover:bg-primary-light hover:text-primary'
    }`

  return (
    <aside className="w-full shrink-0 lg:flex lg:w-60 lg:flex-col lg:rounded-2xl lg:border lg:border-cream-dark lg:bg-white lg:p-4 lg:shadow-sm">
      <div className="hidden mb-6 px-1 lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Tài khoản</p>
        <h2 className="font-display text-lg font-semibold text-gray-800">{user?.hoTen ?? 'Flygo'}</h2>
      </div>

      {/* Mobile Dropdown Nav */}
      <div className="lg:hidden">
        <AccountDropdown
          menu={accountMenu}
          currentPath={location.pathname}
          onSelect={(path) => navigate(path)}
          onLogout={handleLogout}
        />
      </div>

      {/* Desktop Sidebar Nav */}
      <nav className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-1">
        {accountMenu.map((item) => {
          if (item.path) {
            return (
              <NavLink key={item.id} to={item.path} end className={linkClass}>
                {({ isActive }) => (
                  <>
                    {getAccountIcon(item.id)}
                    <span className="flex-1">{item.label}</span>
                    <span className={`size-1.5 rounded-full ${isActive ? 'bg-white/80' : 'bg-gray-300'}`} />
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
              title="Sắp có"
              className="flex cursor-not-allowed items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-left text-[0.92rem] text-gray-300"
            >
              {getAccountIcon(item.id)}
              <span className="flex-1">{item.label}</span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 rounded-[10px] border border-cream-dark px-3.5 py-2.5 text-left text-[0.92rem] text-gray-600 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <IconLogout />
          <span>Đăng xuất</span>
        </button>
      </nav>
    </aside>
  )
}

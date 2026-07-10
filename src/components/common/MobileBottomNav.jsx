import { NavLink } from 'react-router-dom'
import { paths } from '../../routes/paths'
import { IconHome, IconCart, IconHistory, IconUser } from '../ui/icons'
import { useCart } from '../../context/CartContext'

export function IconList2() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  )
}

export default function MobileBottomNav() {
  const { totalCount } = useCart()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] flex items-center justify-between rounded-t-[18px] border-t border-gray-200 bg-white px-2 py-2 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] md:hidden">
      <NavItem to={paths.CLIENT_HOME} icon={<IconHome />} label="TRANG CHỦ" />
      <NavItem to={paths.PRODUCTS} icon={<IconList2 />} label="SẢN PHẨM" />
      <NavLink
        to={paths.CART}
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center justify-center gap-1 relative ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`
        }
      >
        <div className="relative">
          <IconCart />
          {totalCount > 0 && (
            <span className="absolute -right-2 -top-1.5 grid min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold text-white ring-2 ring-white">
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </div>
        <span className="text-[0.6rem] font-bold tracking-tight">GIỎ HÀNG</span>
      </NavLink>
      <NavItem to={paths.ACCOUNT_ORDERS} icon={<IconHistory />} label="ĐƠN HÀNG" />
      <NavItem to={paths.ACCOUNT} icon={<IconUser />} label="THÔNG TIN" />
    </div>
  )
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center justify-center gap-1 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`
      }
    >
      <span className="grid size-[24px] place-items-center">{icon}</span>
      <span className="text-[0.6rem] font-bold tracking-tight">{label}</span>
    </NavLink>
  )
}

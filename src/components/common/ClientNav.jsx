import { Link, useLocation } from 'react-router-dom'
import { clientNavItems } from '../../data/clientNav'
import { paths } from '../../routes/paths'

function NavItem({ to, label, active, mobile = false }) {
  return (
    <Link
      to={to}
      className={`relative no-underline transition ${
        mobile
          ? `flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[0.95rem] font-medium ${
              active ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-cream hover:text-primary'
            }`
          : `shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.82rem] font-medium sm:px-0 sm:py-0 sm:text-[0.9rem] md:text-[0.95rem] ${
              active
                ? 'bg-primary/10 text-primary sm:bg-transparent sm:after:absolute sm:after:inset-x-0 sm:after:-bottom-1 sm:after:h-0.5 sm:after:rounded-full sm:after:bg-primary'
                : 'text-gray-600 hover:bg-primary/8 hover:text-primary sm:hover:bg-transparent'
            }`
      }`}
    >
      {label}
    </Link>
  )
}

export default function ClientNav({ mobile = false }) {
  const { pathname, hash } = useLocation()

  function isActive(item) {
    if (item.matchHome) return pathname === paths.CLIENT_HOME && !hash
    if (item.matchPath) return pathname.startsWith(item.matchPath)
    if (item.matchHash) return pathname === paths.CLIENT_HOME && hash === `#${item.matchHash}`
    return false
  }

  return (
    <nav
      aria-label="Menu chính"
      className={mobile ? 'flex flex-col gap-2' : '-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:mx-0 sm:gap-3 sm:pb-0 md:gap-5 lg:gap-8 [&::-webkit-scrollbar]:hidden'}
    >
      {clientNavItems.map((item) => (
        <NavItem key={item.id} to={item.to} label={item.label} active={isActive(item)} mobile={mobile} />
      ))}
    </nav>
  )
}

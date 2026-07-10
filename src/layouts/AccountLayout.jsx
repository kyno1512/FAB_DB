import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { container } from '../lib/classes'
import { getUser } from '../lib/authStorage'
import { paths } from '../routes/paths'
import AccountSidebar from '../pages/client/account/components/AccountSidebar'

export default function AccountLayout() {
  const navigate = useNavigate()
  const user = getUser()

  useEffect(() => {
    if (!user) navigate(paths.LOGIN, { replace: true })
  }, [navigate, user])

  if (!user) return null

  return (
    <div className="bg-cream py-8">
      <div className={`${container} flex flex-col gap-6 lg:flex-row lg:items-start`}>
        <AccountSidebar />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

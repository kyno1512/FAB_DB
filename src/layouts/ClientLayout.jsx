import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import ChatButton from '../components/common/ChatButton'
import CartToast from '../pages/client/cart/components/CartToast'
import MobileBottomNav from '../components/common/MobileBottomNav'
import { paths } from '../routes/paths'

export default function ClientLayout() {
  const { pathname } = useLocation()
  const isAccount = pathname.startsWith(paths.ACCOUNT)

  return (
    <div className="min-h-screen bg-cream font-sans text-gray-800 pb-[70px] md:pb-0 relative">
      <Header />
      <main>
        <Outlet />
      </main>
      {!isAccount && <Footer />}
      {!isAccount && <ChatButton />}
      <CartToast />
      <MobileBottomNav />
    </div>
  )
}

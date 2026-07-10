import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ClientNav from './ClientNav'
import { container, iconBtn } from '../../lib/classes'
import { getUser } from '../../lib/authStorage'
import { getProfile, logout } from '../../services/authService'
import { resolveMediaUrl } from '../../lib/mediaUrl'
import { useCart } from '../../context/CartContext'
import { paths } from '../../routes/paths'
import { STORE } from '../../constants/store'
import ZaloIcon from '../icons/ZaloIcon'
import {
  IconBlog,
  IconCart,
  IconChevronRight,
  IconClose,
  IconEmail,
  IconHome,
  IconLogout,
  IconMapPin,
  IconPhone,
  IconSearch,
  IconUser,
} from '../ui/icons'

function getInitials(name) {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

function MenuBarsIcon() {
  return (
    <span className="flex flex-col gap-1.5">
      <span className="block h-0.5 w-6 rounded-full bg-gray-800" />
      <span className="block h-0.5 w-6 rounded-full bg-gray-800" />
      <span className="block h-0.5 w-6 rounded-full bg-gray-800" />
    </span>
  )
}

function MobileNavPanel({ onClose, onLogout, open, userInfo }) {
  const panelRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) onClose()
    }

    if (!open) return undefined

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose, open])

  if (!open) return null

  const displayName = userInfo?.hoTen || 'Khách hàng'
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const avatarUrl = resolveMediaUrl(userInfo?.anhDaiDien)
  const pointText = Number.isFinite(Number(userInfo?.diemTichLuy)) ? Number(userInfo.diemTichLuy).toLocaleString('vi-VN') : '0'

  return (
    <>
      <button
        type="button"
        aria-label="Đóng menu"
        className="fixed inset-0 z-40 bg-primary/15 backdrop-blur-[1px] lg:hidden"
        onClick={onClose}
      />

      <aside
        id="mobile-nav-panel"
        ref={panelRef}
        className="fixed left-0 top-0 z-50 flex h-dvh w-[min(78vw,280px)] flex-col bg-white shadow-2xl ring-1 ring-primary/15 lg:hidden"
        aria-label="Menu di động"
      >
        <div className="flex items-start justify-between border-b border-cream-dark px-4 py-4">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="font-display text-xl font-semibold italic text-primary">Flygo</span>

            <div className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="size-4 rounded-full object-cover" />
              ) : (
                <span className="grid size-4 place-items-center rounded-full bg-white/20 text-[0.65rem] font-bold">{initials || <IconUser />}</span>
              )}
              <span className="max-w-[130px] truncate">{displayName}</span>
            </div>

            <p className="text-xs text-gray-500">
              Điểm tích lũy: <span className="font-semibold text-primary">{pointText}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
            aria-label="Đóng menu"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <nav className="space-y-0.5">
            <Link
              to={paths.CLIENT_HOME}
              onClick={onClose}
              className="flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-[0.9rem] text-gray-600 transition hover:bg-gray-50"
            >
              <span className="grid size-4 place-items-center text-gray-500">
                <IconHome />
              </span>
              <span className="flex-1">Trang chủ</span>
              <IconChevronRight />
            </Link>

            <Link
              to={paths.PRODUCTS}
              onClick={onClose}
              className="flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-[0.9rem] text-gray-600 transition hover:bg-gray-50"
            >
              <span className="grid size-4 place-items-center text-gray-500">
                <IconCart />
              </span>
              <span className="flex-1">Sản phẩm</span>
              <IconChevronRight />
            </Link>

            <Link
              to={paths.NEWS}
              onClick={onClose}
              className="flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-[0.9rem] text-gray-600 transition hover:bg-gray-50"
            >
              <span className="grid size-4 place-items-center text-gray-500">
                <IconBlog />
              </span>
              <span className="flex-1">Tin tức</span>
              <IconChevronRight />
            </Link>

            <Link
              to={paths.ADDRESS}
              onClick={onClose}
              className="flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-[0.9rem] text-gray-600 transition hover:bg-gray-50"
            >
              <span className="grid size-4 place-items-center text-gray-500">
                <IconMapPin />
              </span>
              <span className="flex-1">Địa chỉ</span>
              <IconChevronRight />
            </Link>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-[0.9rem] text-gray-600 transition hover:bg-gray-50"
            >
              <span className="grid size-4 place-items-center text-gray-500">
                <IconLogout />
              </span>
              <span className="flex-1 text-left">Đăng Xuất</span>
            </button>
          </nav>

          <div className="my-4 border-t border-gray-100" />

          <div className="space-y-2 px-1">
            <a
              href={`tel:${STORE.hotlineTel}`}
              className="flex items-center gap-2.5 rounded-[4px] px-2 py-2 text-left text-sm font-semibold text-[#c26a20] transition hover:bg-orange-50"
            >
              <IconPhone />
              <span>HOTLINE: {STORE.hotline}</span>
            </a>
            <a
              href={STORE.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-[4px] px-2 py-2 text-left text-sm font-semibold text-[#0068ff] transition hover:bg-blue-50"
            >
              <ZaloIcon size={18} />
              <span>ZALO: {STORE.zaloPhoneDisplay}</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  )
}

function CartButton({ totalCount, accountPath, user }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link to={paths.CART} className={iconBtn} aria-label="Giỏ hàng">
        <span className="relative grid size-full place-items-center">
          <IconCart />
          {totalCount > 0 && (
            <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-white ring-2 ring-white">
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </span>
      </Link>

      <Link
        to={accountPath}
        className={`${iconBtn} ${user ? 'bg-primary-light text-primary' : ''}`}
        aria-label={user ? 'Tài khoản' : 'Đăng nhập'}
        title={user ? user.hoTen : 'Đăng nhập'}
      >
        {user ? <span className="text-xs font-bold">{getInitials(user.hoTen)}</span> : <IconUser />}
      </Link>
    </div>
  )
}

export default function Header() {
  const user = getUser()
  const navigate = useNavigate()
  const { totalCount } = useCart()
  const accountPath = user ? paths.ACCOUNT : paths.LOGIN
  const headerRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const logoutTriggerRef = useRef(false)

  useEffect(() => {
    if (logoutTriggerRef.current && !menuOpen) {
      logoutTriggerRef.current = false
      logout()
      navigate(paths.CLIENT_HOME, { replace: true })
    }
  }, [menuOpen, navigate])

  useEffect(() => {
    if (!user?.maNguoiDung) return

    let alive = true

    getProfile(user.maNguoiDung)
      .then((data) => {
        if (alive) setProfile(data)
      })
      .catch(() => {
        if (alive) setProfile(null)
      })

    return () => {
      alive = false
    }
  }, [user?.maNguoiDung])

  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return

    function syncHeight() {
      document.documentElement.style.setProperty('--client-header-height', `${el.offsetHeight}px`)
    }

    syncHeight()
    const observer = new ResizeObserver(syncHeight)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate(paths.CLIENT_HOME, { replace: true })
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-cream-dark bg-white/95 backdrop-blur-sm">
      <div className={`${container} py-2 sm:py-3`}>
        <div className="flex items-center justify-between gap-2 lg:hidden">
          <Link to={paths.CLIENT_HOME} className="inline-flex min-w-0 items-center gap-2 text-inherit no-underline sm:gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-primary text-base font-bold text-white sm:size-9 sm:text-lg">
              F
            </span>
            <span className="truncate font-display text-base font-semibold text-gray-800 sm:text-[1.15rem]">Flygo</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <CartButton totalCount={totalCount} accountPath={accountPath} user={user} />
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="grid size-9 place-items-center rounded-full bg-cream text-gray-800 transition hover:bg-cream-dark"
              aria-label="Mở menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
            >
              <MenuBarsIcon />
            </button>
          </div>
        </div>

        <MobileNavPanel open={menuOpen} onClose={() => setMenuOpen(false)} userInfo={profile || user} onLogout={handleLogout} />

        <div className="hidden lg:flex lg:items-center lg:gap-4 xl:gap-5">
          <Link to={paths.CLIENT_HOME} className="inline-flex shrink-0 items-center gap-2 text-inherit no-underline sm:gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary text-lg font-bold text-white">
              F
            </span>
            <span className="truncate font-display text-[1.15rem] font-semibold text-gray-800">Flygo</span>
          </Link>

          <div className="min-w-0 flex-1 overflow-hidden rounded-full bg-cream/60 px-1.5 py-1">
            <ClientNav />
          </div>

          <label className="flex w-[220px] shrink-0 items-center gap-2 rounded-full bg-cream px-4 py-2 text-gray-500 xl:w-[260px]">
            <IconSearch />
            <input
              type="search"
              placeholder="Tìm kiếm..."
              className="w-full min-w-0 border-none bg-transparent text-sm outline-none"
              aria-label="Tìm kiếm"
            />
          </label>

          <Link
            to={paths.CART}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-primary-dark xl:px-6"
          >
            Đặt Hàng Ngay
          </Link>

          <CartButton totalCount={totalCount} accountPath={accountPath} user={user} />
        </div>
      </div>
    </header>
  )
}

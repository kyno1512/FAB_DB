import { Link } from 'react-router-dom'
import { container } from '../../lib/classes'
import { STORE } from '../../constants/store'
import { paths } from '../../routes/paths'

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white/85">
      <div className={`${container} grid gap-10 py-12 lg:grid-cols-[2fr_1fr_1fr]`}>
        <div>
          <Link to={paths.CLIENT_HOME} className="flex items-center gap-2.5 text-white no-underline">
            <span className="grid size-9 place-items-center rounded-[10px] bg-primary text-lg font-bold">F</span>
            <span className="font-semibold">{STORE.name}</span>
          </Link>
          <p className="mt-3.5 max-w-xs text-sm leading-relaxed">{STORE.tagline}</p>
          <address className="mt-4 max-w-xs not-italic text-sm leading-relaxed text-white/80">
            <p className="font-semibold text-white">{STORE.address}</p>
            <p className="mt-1">
              Hotline:{' '}
              <a href={`tel:${STORE.hotlineTel}`} className="text-white no-underline hover:underline">
                {STORE.hotline}
              </a>
            </p>
            <p className="mt-1">
              Giờ mở cửa: {STORE.hours}
            </p>
            <Link
              to={paths.ADDRESS}
              className="mt-3 inline-block text-sm font-semibold text-white no-underline hover:underline"
            >
              Xem bản đồ & liên hệ →
            </Link>
          </address>
        </div>

        <nav className="flex flex-col gap-2.5">
          <Link to={paths.PRODUCTS} className="text-sm text-white/80 no-underline hover:text-white">
            Sản phẩm
          </Link>
          <Link to={paths.NEWS} className="text-sm text-white/80 no-underline hover:text-white">
            Tin tức
          </Link>
          <Link to={paths.ADDRESS} className="text-sm text-white/80 no-underline hover:text-white">
            Địa chỉ
          </Link>
        </nav>

        <div className="flex justify-start gap-3 lg:justify-end">
          {['FB', 'IG', 'TT'].map((label) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="grid size-10 place-items-center rounded-full bg-white/12 text-xs font-bold text-white no-underline hover:bg-white/22"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm opacity-70">
        <div className={container}>© 2026 {STORE.name}. All rights reserved.</div>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import { paths } from '../../../routes/paths'

export default function AuthLayout({ title, subtitle, backTo = paths.CLIENT_HOME, backLabel = 'Về trang chủ', children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-dark via-[#123838] to-[#0b2424] p-4 sm:p-6">
      <div className="w-full max-w-[440px]">
        <div className="rounded-3xl border border-white/10 bg-[#162e2e]/90 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
          <div className="mb-8 text-center">
            <Link to={paths.CLIENT_HOME} className="inline-flex flex-col items-center gap-2 no-underline">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-lg shadow-primary/30">
                F
              </span>
              <span className="font-display text-lg font-semibold text-primary-light">Flygo</span>
            </Link>
            <h1 className="mt-5 font-display text-2xl font-bold text-white sm:text-[1.65rem]">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-white/55">{subtitle}</p>}
          </div>

          {children}

          {footer && <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-white/55">{footer}</div>}
        </div>

        <p className="mt-6 text-center text-xs text-white/35">
          <Link to={backTo} className="text-white/45 no-underline transition hover:text-primary-light">
            ← {backLabel}
          </Link>
          <span className="mx-2">·</span>
          © {new Date().getFullYear()} Flygo Bakery
        </p>
      </div>
    </div>
  )
}

export function AuthAlert({ type = 'error', children }) {
  const styles =
    type === 'success'
      ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30'
      : 'bg-red-500/15 text-red-200 ring-1 ring-red-400/30'

  return <p className={`mb-5 rounded-xl px-4 py-3 text-sm ${styles}`}>{children}</p>
}

export function AuthSubmitButton({ loading, loadingText, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? loadingText : children}
      {!loading && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  )
}

export function AuthLink({ to, children }) {
  return (
    <Link to={to} className="font-medium text-primary-light no-underline transition hover:text-white hover:underline">
      {children}
    </Link>
  )
}

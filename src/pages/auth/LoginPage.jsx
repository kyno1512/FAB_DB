import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { paths } from '../../routes/paths'
import { consumeGoogleLoginResult, getRedirectPath, login, loginWithGoogle } from '../../services/authService'
import { saveUser } from '../../lib/authStorage'
import AuthField from './components/AuthField'
import AuthLayout, { AuthAlert, AuthLink, AuthSubmitButton } from './components/AuthLayout'
import { IconLock, IconMail } from './components/authIcons'

const REMEMBER_KEY = 'flygo_remember_email'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message ?? ''
  const expiredMessage = new URLSearchParams(location.search).get('reason') === 'expired'
    ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    : ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      setEmail(saved)
      setRemember(true)
    }

    const result = consumeGoogleLoginResult()
    if (result?.token) {
      localStorage.removeItem(REMEMBER_KEY)
      saveUser(result)
      window.history.replaceState({}, document.title, '/login')
      navigate(getRedirectPath(result.tenVaiTro), { replace: true })
    }
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)
      if (remember) localStorage.setItem(REMEMBER_KEY, email)
      else localStorage.removeItem(REMEMBER_KEY)
      navigate(getRedirectPath(user.tenVaiTro))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleLogin() {
    setError('')
    loginWithGoogle()
  }

  return (
    <AuthLayout
      title="Chào mừng trở lại!"
      subtitle="Đăng nhập Flygo Bakery"
      backLabel="Về trang chủ"
      footer={
        <>
          Chưa có tài khoản? <AuthLink to={paths.REGISTER}>Đăng ký ngay</AuthLink>
        </>
      }
    >
      {successMessage && <AuthAlert type="success">{successMessage}</AuthAlert>}
      {expiredMessage && <AuthAlert type="warning">{expiredMessage}</AuthAlert>}
      {error && <AuthAlert>{error}</AuthAlert>}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthField
          label="Email"
          icon={<IconMail />}
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthField
          label="Mật khẩu"
          icon={<IconLock />}
          togglePassword
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-white/60">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded border-white/30 accent-primary"
            />
            Ghi nhớ đăng nhập
          </label>
          <AuthLink to={paths.FORGOT_PASSWORD}>Quên mật khẩu?</AuthLink>
        </div>

        <AuthSubmitButton loading={loading} loadingText="Đang đăng nhập...">
          Đăng nhập
        </AuthSubmitButton>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Đăng nhập bằng Google
        </button>
      </form>
    </AuthLayout>
  )
}

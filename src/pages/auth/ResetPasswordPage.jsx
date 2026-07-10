import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { paths } from '../../routes/paths'
import { resetPassword } from '../../services/authService'
import AuthField from './components/AuthField'
import AuthLayout, { AuthLink, AuthSubmitButton } from './components/AuthLayout'
import { IconKey, IconLock, IconMail } from './components/authIcons'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      await Swal.fire({
        icon: 'error',
        title: 'OTP không hợp lệ',
        text: 'Mã OTP phải gồm đúng 6 chữ số.',
        confirmButtonColor: '#1e6b6b',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Mật khẩu xác nhận không khớp.',
        confirmButtonColor: '#1e6b6b',
      })
      return
    }

    setLoading(true)

    try {
      await resetPassword({ email, token: otp, newPassword, confirmPassword })

      await Swal.fire({
        icon: 'success',
        title: 'Đổi mật khẩu thành công!',
        text: 'Mật khẩu mới đã được lưu. Vui lòng đăng nhập lại.',
        confirmButtonText: 'Đăng nhập',
        confirmButtonColor: '#1e6b6b',
      })

      navigate(paths.LOGIN, { state: { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập.' } })
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Đổi mật khẩu thất bại',
        text: err.message,
        confirmButtonColor: '#1e6b6b',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Nhập OTP từ email và mật khẩu mới do bạn tự chọn"
      backTo={paths.LOGIN}
      backLabel="Quay lại đăng nhập"
      footer={
        <>
          Chưa có OTP? <AuthLink to={paths.FORGOT_PASSWORD}>Gửi lại OTP</AuthLink>
        </>
      }
    >
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
          label="Mã OTP (6 số)"
          icon={<IconKey />}
          type="text"
          inputMode="numeric"
          maxLength={6}
          pattern="\d{6}"
          className="tracking-[0.35em]"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
        />
        <AuthField
          label="Mật khẩu mới"
          icon={<IconLock />}
          togglePassword
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
        <AuthField
          label="Xác nhận mật khẩu mới"
          icon={<IconLock />}
          togglePassword
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />

        <AuthSubmitButton loading={loading} loadingText="Đang xử lý...">
          Xác nhận & đổi mật khẩu
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  )
}

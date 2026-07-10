import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { paths } from '../../routes/paths'
import { forgotPassword } from '../../services/authService'
import AuthField from './components/AuthField'
import AuthLayout, { AuthLink, AuthSubmitButton } from './components/AuthLayout'
import { IconMail } from './components/authIcons'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await forgotPassword(email)

      if (!data.otpSent) return

      await Swal.fire({
        icon: 'success',
        title: 'Đã gửi OTP!',
        html: `${data.message}<br/><br/><small class="text-gray-500">Bạn sẽ dùng OTP để <strong>tự đặt mật khẩu mới</strong>, hệ thống không cấp sẵn mật khẩu.</small>`,
        confirmButtonText: 'Nhập OTP & đổi mật khẩu',
        confirmButtonColor: '#1e6b6b',
      })

      navigate(paths.RESET_PASSWORD, { state: { email } })
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Không gửi được OTP',
        text: err.message,
        confirmButtonColor: '#1e6b6b',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận mã OTP và tự đặt mật khẩu mới"
      backTo={paths.LOGIN}
      backLabel="Quay lại đăng nhập"
      footer={
        <>
          Nhớ mật khẩu rồi? <AuthLink to={paths.LOGIN}>Đăng nhập</AuthLink>
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

        <AuthSubmitButton loading={loading} loadingText="Đang gửi OTP...">
          Gửi mã OTP
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  )
}

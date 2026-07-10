import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { paths } from '../../routes/paths'
import { register } from '../../services/authService'
import AuthField from './components/AuthField'
import AuthLayout, { AuthLink, AuthSubmitButton } from './components/AuthLayout'
import { IconLock, IconMail, IconPhone, IconUser } from './components/authIcons'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [hoTen, setHoTen] = useState('')
  const [email, setEmail] = useState('')
  const [soDienThoai, setSoDienThoai] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (password !== confirmPassword) {
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
      await register({ hoTen, email, soDienThoai, password, confirmPassword })

      await Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công!',
        text: 'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.',
        confirmButtonText: 'Đăng nhập ngay',
        confirmButtonColor: '#1e6b6b',
      })

      navigate(paths.LOGIN)
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Đăng ký thất bại',
        text: err.message,
        confirmButtonColor: '#1e6b6b',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Đăng ký để đặt hàng nhanh hơn"
      backTo={paths.LOGIN}
      backLabel="Quay lại đăng nhập"
      footer={
        <>
          Đã có tài khoản? <AuthLink to={paths.LOGIN}>Đăng nhập</AuthLink>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthField
          label="Họ tên"
          icon={<IconUser />}
          type="text"
          placeholder="Nguyễn Văn A"
          value={hoTen}
          onChange={(e) => setHoTen(e.target.value)}
          required
        />
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
          label="Số điện thoại"
          icon={<IconPhone />}
          type="tel"
          placeholder="0909123456"
          value={soDienThoai}
          onChange={(e) => setSoDienThoai(e.target.value)}
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
          minLength={6}
        />
        <AuthField
          label="Xác nhận mật khẩu"
          icon={<IconLock />}
          togglePassword
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />

        <AuthSubmitButton loading={loading} loadingText="Đang xử lý...">
          Đăng ký
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  )
}

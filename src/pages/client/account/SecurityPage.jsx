import { useState } from 'react'
import Swal from 'sweetalert2'
import { btnPrimary, inputField } from '../../../lib/classes'
import { getUser } from '../../../lib/authStorage'
import { changePassword } from '../../../services/authService'

const fieldClass = `${inputField} w-full bg-white text-gray-800`
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500'

export default function SecurityPage() {
  const storedUser = getUser()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Mật khẩu xác nhận không khớp.',
        confirmButtonColor: '#1e6b6b',
      })
      return
    }

    setSaving(true)

    try {
      await changePassword(storedUser.maNguoiDung, {
        currentPassword,
        newPassword,
        confirmPassword,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      await Swal.fire({
        icon: 'success',
        title: 'Đổi mật khẩu thành công!',
        text: 'Mật khẩu mới đã được lưu.',
        confirmButtonColor: '#1e6b6b',
      })
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Đổi mật khẩu thất bại',
        text: err.message,
        confirmButtonColor: '#1e6b6b',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-gray-800">Bảo mật</h1>
        <p className="mt-1 text-sm text-gray-500">Đổi mật khẩu đăng nhập tài khoản Flygo</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm"
      >
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
          Đổi mật khẩu
        </p>

        <div className="grid max-w-lg gap-4">
          <label>
            <span className={labelClass}>Mật khẩu hiện tại</span>
            <input
              type="password"
              className={fieldClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>

          <label>
            <span className={labelClass}>Mật khẩu mới</span>
            <input
              type="password"
              className={fieldClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          <label>
            <span className={labelClass}>Xác nhận mật khẩu mới</span>
            <input
              type="password"
              className={fieldClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
        </div>

        <p className="mt-4 text-xs text-gray-400">Mật khẩu tối thiểu 6 ký tự</p>

        <div className="mt-6">
          <button type="submit" className={`${btnPrimary} !w-auto px-8`} disabled={saving}>
            {saving ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '../../../routes/paths'
import { getProfile, updateProfile, changePassword } from '../../../services/authService'
import { getUser } from '../../../lib/authStorage'
import { confirmAction } from '../../../lib/swal'
import AvatarUpload from '../../../components/AvatarUpload'

const sectionClass = 'rounded-2xl border border-gray-200 bg-white shadow-sm'
const inputField = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-700'

export default function AdminAccountPage() {
  const navigate = useNavigate()
  const storedUser = getUser()
  const userId = storedUser?.maNguoiDung

  const emptyForm = {
    hoTen: '',
    email: '',
    soDienThoai: '',
    ngaySinh: '',
    diaChi: '',
    anhDaiDien: '',
    tenVaiTro: '',
    ngayTao: '',
  }

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    if (!userId) return

    getProfile(userId)
      .then((p) => {
        setForm((prev) => ({
          ...prev,
          hoTen: p.hoTen ?? '',
          email: p.email ?? '',
          soDienThoai: p.soDienThoai ?? '',
          ngaySinh: p.ngaySinh ? formatDateForInput(p.ngaySinh) : '',
          diaChi: p.diaChi ?? '',
          anhDaiDien: p.anhDaiDien ?? '',
          tenVaiTro: p.tenVaiTro ?? '',
          ngayTao: p.ngayTao ?? '',
        }))
      })
      .catch((err) => {
        confirmAction({
          title: 'Lỗi',
          text: err.message,
          confirmText: 'OK',
          showCancel: false,
        })
      })
      .finally(() => setLoading(false))
  }, [userId])

  function formatDateForInput(ngaySinh) {
    if (!ngaySinh) return ''
    const parts = ngaySinh.split('/')
    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    return ngaySinh
  }

  function formatDisplayDate(value) {
    if (!value) return '—'
    return value
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)

    try {
      await updateProfile(userId, {
        hoTen: form.hoTen,
        soDienThoai: form.soDienThoai,
        diaChi: form.diaChi || null,
        ngaySinh: form.ngaySinh || null,
        anhDaiDien: form.anhDaiDien || null,
      })

      await confirmAction({
        title: 'Đã lưu!',
        text: 'Thông tin tài khoản đã được cập nhật.',
        confirmText: 'OK',
        showCancel: false,
        icon: 'success',
      })
    } catch (err) {
      await confirmAction({
        title: 'Lỗi',
        text: err.message,
        confirmText: 'OK',
        showCancel: false,
        icon: 'error',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  function validatePassword() {
    const errs = {}
    if (!passwordData.currentPassword) errs.currentPassword = 'Vui lòng nhập mật khẩu hiện tại'
    if (!passwordData.newPassword) errs.newPassword = 'Vui lòng nhập mật khẩu mới'
    else if (passwordData.newPassword.length < 6) errs.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự'
    if (passwordData.newPassword !== passwordData.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp'
    if (passwordData.currentPassword === passwordData.newPassword) errs.newPassword = 'Mật khẩu mới phải khác mật khẩu cũ'
    setPasswordErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (!validatePassword()) return

    setSavingPassword(true)
    try {
      await changePassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      const result = await confirmAction({
        title: 'Đổi mật khẩu thành công!',
        text: 'Bạn cần đăng nhập lại để tiếp tục.',
        confirmText: 'Đăng nhập lại',
        cancelText: 'Ở lại',
        icon: 'success',
      })

      if (result) {
        navigate(paths.LOGIN)
      } else {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setActiveTab('info')
      }
    } catch (err) {
      await confirmAction({
        title: 'Lỗi',
        text: err.message || 'Không thể đổi mật khẩu.',
        confirmText: 'OK',
        showCancel: false,
        icon: 'error',
      })
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className={`${sectionClass} flex items-center justify-center p-10 text-gray-500`}>
          Đang tải...
        </div>
      </div>
    )
  }

  const avatarUrl = form.anhDaiDien || ''
  const initials = (form.hoTen || 'U').trim().charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
        <p className="mt-1 text-base text-gray-500">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>

      {/* Profile card */}
      <div className={sectionClass}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8 p-8">
          <AvatarUpload
            value={avatarUrl}
            onChange={(url) => updateField('anhDaiDien', url)}
            userName={form.hoTen}
          />

          <div className="min-w-0 space-y-1.5">
            <div className="text-xl font-bold text-gray-900 truncate">{form.hoTen || '—'}</div>
            <div className="text-base text-gray-500 truncate">{form.email || '—'}</div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 font-semibold text-primary">
                {form.tenVaiTro || 'Nhân viên'}
              </span>
              <span>Tham gia từ {formatDisplayDate(form.ngayTao)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex-1 rounded-lg py-3 text-base font-medium transition ${
            activeTab === 'info'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`flex-1 rounded-lg py-3 text-base font-medium transition ${
            activeTab === 'password'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Tab: Thông tin cá nhân */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveProfile} className={sectionClass}>
          <div className="border-b border-gray-100 px-8 py-5">
            <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
            <p className="mt-1.5 text-base text-gray-500">
              Thông tin này sẽ hiển thị cho quản lý và trong các đơn hàng nội bộ.
            </p>
          </div>

          <div className="grid gap-5 p-8 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelClass}>Họ tên</span>
              <input
                className={inputField}
                value={form.hoTen}
                onChange={(e) => updateField('hoTen', e.target.value)}
                required
              />
            </label>

            <label className="sm:col-span-2">
              <span className={labelClass}>
                Email <span className="text-red-500">*</span>
              </span>
              <input className={`${inputField} bg-gray-50 text-gray-500`} value={form.email} readOnly />
              <p className="mt-1 text-xs text-red-500">Email dùng để đăng nhập, không thể thay đổi.</p>
            </label>

            <label>
              <span className={labelClass}>Số điện thoại</span>
              <input
                className={inputField}
                value={form.soDienThoai}
                onChange={(e) => updateField('soDienThoai', e.target.value)}
              />
            </label>

            <label>
              <span className={labelClass}>Ngày sinh</span>
              <input
                type="date"
                className={inputField}
                value={form.ngaySinh}
                onChange={(e) => updateField('ngaySinh', e.target.value)}
              />
            </label>

            <label className="sm:col-span-2">
              <span className={labelClass}>Địa chỉ</span>
              <input
                className={inputField}
                value={form.diaChi ?? ''}
                onChange={(e) => updateField('diaChi', e.target.value)}
                placeholder="Số nhà, đường, quận, thành phố..."
              />
            </label>
          </div>

          <div className="flex items-center justify-end border-t border-gray-100 px-8 py-5">
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-lg bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      )}

      {/* Tab: Đổi mật khẩu */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className={sectionClass}>
          <div className="border-b border-gray-100 px-8 py-5">
            <h2 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h2>
            <p className="mt-1.5 text-base text-gray-500">
              Nếu bạn quên mật khẩu, hãy dùng trang quên mật khẩu thay vì đặt lại trực tiếp.
            </p>
          </div>

          <div className="space-y-5 p-8">
            <div>
              <label className={labelClass}>Mật khẩu hiện tại</label>
              <input
                type="password"
                className={`${inputField} ${passwordErrors.currentPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Nhập mật khẩu hiện tại"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Mật khẩu mới</label>
              <input
                type="password"
                className={`${inputField} ${passwordErrors.newPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Ít nhất 6 ký tự"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className={`${inputField} ${passwordErrors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Nhập lại mật khẩu mới"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-gray-100 px-8 py-5">
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-lg bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {savingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { btnPrimary, inputField } from '../../../lib/classes'
import AvatarUpload from '../../../components/AvatarUpload'
import { getUser } from '../../../lib/authStorage'
import { getProfile, updateProfile } from '../../../services/authService'

const fieldClass = `${inputField} w-full bg-white text-gray-800`
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500'

function toInputDate(ngaySinh) {
  if (!ngaySinh) return ''
  const parts = ngaySinh.split('/')
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  return ngaySinh
}

const emptyForm = {
  hoTen: '',
  email: '',
  soDienThoai: '',
  ngaySinh: '',
  diaChi: '',
  anhDaiDien: '',
}

export default function ProfilePage() {
  const storedUser = getUser()
  const userId = storedUser?.maNguoiDung
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!userId) return

    getProfile(userId)
      .then((p) => {
        setForm({
          hoTen: p.hoTen ?? '',
          email: p.email ?? '',
          soDienThoai: p.soDienThoai ?? '',
          ngaySinh: toInputDate(p.ngaySinh),
          diaChi: p.diaChi ?? '',
          anhDaiDien: p.anhDaiDien ?? '',
        })
      })
      .catch((err) => {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: err.message, confirmButtonColor: '#1e6b6b' })
      })
      .finally(() => setLoading(false))
  }, [userId])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    try {
      await updateProfile(userId, {
        hoTen: form.hoTen,
        soDienThoai: form.soDienThoai,
        diaChi: form.diaChi || null,
        ngaySinh: form.ngaySinh || null,
        anhDaiDien: form.anhDaiDien || null,
      })

      await Swal.fire({
        icon: 'success',
        title: 'Đã lưu hồ sơ!',
        text: 'Thông tin cá nhân đã được cập nhật.',
        confirmButtonColor: '#1e6b6b',
      })
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Lưu thất bại',
        text: err.message,
        confirmButtonColor: '#1e6b6b',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-cream-dark bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
        Đang tải hồ sơ...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-gray-800">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-gray-500">Cập nhật thông tin liên hệ và địa chỉ giao hàng</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm"
      >
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
          Thông tin có thể chỉnh sửa
        </p>

        <div className="mb-6 border-b border-cream-dark pb-6">
          <AvatarUpload
            value={form.anhDaiDien}
            onChange={(url) => updateField('anhDaiDien', url)}
            userName={form.hoTen}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Họ tên</span>
            <input
              className={fieldClass}
              value={form.hoTen}
              onChange={(e) => updateField('hoTen', e.target.value)}
              required
            />
          </label>

          <label className="sm:col-span-2">
            <span className={labelClass}>
              Email <span className="text-red-500">*</span>
            </span>
            <input className={`${fieldClass} bg-cream/60 text-gray-500`} value={form.email} readOnly />
            <p className="mt-1 text-xs text-red-500">Email dùng để đăng nhập, không thể thay đổi.</p>
          </label>

          <label>
            <span className={labelClass}>Số điện thoại</span>
            <input
              className={fieldClass}
              value={form.soDienThoai}
              onChange={(e) => updateField('soDienThoai', e.target.value)}
              required
            />
          </label>

          <label>
            <span className={labelClass}>Ngày sinh</span>
            <input
              type="date"
              className={fieldClass}
              value={form.ngaySinh}
              onChange={(e) => updateField('ngaySinh', e.target.value)}
            />
          </label>

          <label className="sm:col-span-2">
            <span className={labelClass}>Địa chỉ</span>
            <input
              className={fieldClass}
              value={form.diaChi ?? ''}
              onChange={(e) => updateField('diaChi', e.target.value)}
              placeholder="Số nhà, đường, quận, thành phố..."
              autoComplete="street-address"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className={`${btnPrimary} !w-auto px-8`} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}

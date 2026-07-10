import { useEffect, useState } from 'react'
import PasswordInput from '../../../../components/PasswordInput'
import { showError } from '../../../../lib/swal'
import { getStaffDetail } from '../../../../services/staffAdminService'
import { getRoleLabel } from '../roleLabels'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

const passwordClass =
  'w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-11 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

export default function StaffFormModal({ open, staff, roles, onClose, onSubmit }) {
  const isEdit = Boolean(staff)
  const [form, setForm] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    maVaiTro: '',
    password: '',
    trangThai: true,
  })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    if (!staff) {
      setForm({
        hoTen: '',
        email: '',
        soDienThoai: '',
        maVaiTro: String(roles[0]?.maVaiTro ?? ''),
        password: '',
        trangThai: true,
      })
      setLoading(false)
      return
    }

    setLoading(true)
    getStaffDetail(staff.maNguoiDung)
      .then((data) => {
        setForm({
          hoTen: data.hoTen ?? '',
          email: data.email ?? '',
          soDienThoai: data.soDienThoai ?? '',
          maVaiTro: data.maVaiTro ? String(data.maVaiTro) : String(roles[0]?.maVaiTro ?? ''),
          password: data.matKhau ?? '',
          trangThai: data.trangThai ?? true,
        })
      })
      .catch((err) => {
        showError(err.message)
        setForm({
          hoTen: staff.hoTen ?? '',
          email: staff.email ?? '',
          soDienThoai: staff.soDienThoai ?? '',
          maVaiTro: staff.maVaiTro ? String(staff.maVaiTro) : String(roles[0]?.maVaiTro ?? ''),
          password: staff.matKhau ?? '',
          trangThai: staff.trangThai ?? true,
        })
      })
      .finally(() => setLoading(false))
  }, [open, staff, roles])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (isEdit) {
        await onSubmit({
          hoTen: form.hoTen.trim(),
          soDienThoai: form.soDienThoai.trim(),
          maVaiTro: Number(form.maVaiTro),
          trangThai: form.trangThai,
          password: form.password.trim(),
        })
      } else {
        await onSubmit({
          hoTen: form.hoTen.trim(),
          email: form.email.trim(),
          soDienThoai: form.soDienThoai.trim(),
          maVaiTro: Number(form.maVaiTro),
          password: form.password.trim(),
        })
      }
    } catch (err) {
      await showError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {isEdit ? 'Cập nhật nhân sự' : 'Thêm nhân sự'}
          </p>
          <h3 className="font-display text-xl font-bold text-gray-800">
            {isEdit ? staff.hoTen : 'Tài khoản nội bộ mới'}
          </h3>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Đang tải...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Họ tên *</span>
              <input className={inputClass} value={form.hoTen} onChange={(e) => setForm({ ...form, hoTen: e.target.value })} required />
            </label>

            {!isEdit && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Email *</span>
                <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Số điện thoại *</span>
              <input className={inputClass} value={form.soDienThoai} onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })} required />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Vai trò *</span>
              <select className={inputClass} value={form.maVaiTro} onChange={(e) => setForm({ ...form, maVaiTro: e.target.value })} required>
                {roles.map((role) => (
                  <option key={role.maVaiTro} value={role.maVaiTro}>
                    {getRoleLabel(role.tenVaiTro)}
                  </option>
                ))}
              </select>
            </label>

            <div className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                {isEdit ? 'Mật khẩu' : 'Mật khẩu *'}
              </span>
              <PasswordInput
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={passwordClass}
                placeholder={isEdit ? '' : 'Tối thiểu 6 ký tự'}
                required={!isEdit}
                minLength={6}
              />
              {isEdit && (
                <p className="mt-1.5 text-xs text-gray-400">
                  Bấm icon mắt để xem hoặc sửa mật khẩu trực tiếp tại đây.
                </p>
              )}
            </div>

            {isEdit && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.trangThai}
                  onChange={(e) => setForm({ ...form, trangThai: e.target.checked })}
                  className="size-4 rounded border-gray-300 text-primary"
                />
                Tài khoản đang hoạt động
              </label>
            )}

            <div className="flex gap-3 border-t border-gray-100 pt-4">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Hủy
              </button>
              <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
                {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

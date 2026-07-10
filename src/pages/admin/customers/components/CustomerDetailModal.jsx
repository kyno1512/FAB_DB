import { useEffect, useState } from 'react'
import PasswordInput from '../../../../components/PasswordInput'
import { showError } from '../../../../lib/swal'
import { getCustomerDetail, updateCustomer } from '../../../../services/customerAdminService'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

const passwordClass =
  'w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-11 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

export default function CustomerDetailModal({ customerId, onClose, onSaved }) {
  const [customer, setCustomer] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!customerId) return
    setLoading(true)
    setError('')
    getCustomerDetail(customerId)
      .then((data) => {
        setCustomer(data)
        setForm({
          hoTen: data.hoTen ?? '',
          soDienThoai: data.soDienThoai ?? '',
          email: data.email ?? '',
          diaChi: data.diaChi ?? '',
          diemTichLuy: data.diemTichLuy ?? 0,
          trangThai: data.trangThai ?? true,
          password: data.matKhau ?? '',
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [customerId])

  if (!customerId) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        hoTen: form.hoTen.trim(),
        soDienThoai: form.soDienThoai.trim(),
        email: form.email.trim() || null,
        diaChi: form.diaChi.trim() || null,
        diemTichLuy: Number(form.diemTichLuy) || 0,
        trangThai: form.trangThai,
      }

      if (customer.coTaiKhoan && form.password.trim()) {
        payload.password = form.password.trim()
      }

      const updated = await updateCustomer(customerId, payload)
      await onSaved(updated)
    } catch (err) {
      await showError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Khách hàng</p>
          <h3 className="font-display text-xl font-bold text-gray-800">
            {customer?.hoTen || 'Chi tiết khách hàng'}
          </h3>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Đang tải...</div>
        ) : error ? (
          <div className="px-6 py-8 text-sm text-red-600">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              <p>Mã KH: <strong>#{customer.maKhachHang}</strong></p>
              <p>Số đơn: <strong>{customer.soDonHang}</strong></p>
              <p>
                Tài khoản:{' '}
                <strong>{customer.coTaiKhoan ? 'Có đăng ký web' : 'Chưa có tài khoản'}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Họ tên *</span>
                <input className={inputClass} value={form.hoTen} onChange={(e) => setForm({ ...form, hoTen: e.target.value })} required />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Số điện thoại *</span>
                <input className={inputClass} value={form.soDienThoai} onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })} required />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Email</span>
                <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Điểm tích lũy</span>
                <input type="number" min="0" className={inputClass} value={form.diemTichLuy} onChange={(e) => setForm({ ...form, diemTichLuy: e.target.value })} />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Địa chỉ</span>
                <input className={inputClass} value={form.diaChi} onChange={(e) => setForm({ ...form, diaChi: e.target.value })} />
              </label>

              {customer.coTaiKhoan && (
                <>
                  <div className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Mật khẩu</span>
                    <PasswordInput
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={passwordClass}
                      minLength={6}
                    />
                    <p className="mt-1.5 text-xs text-gray-400">
                      Bấm icon mắt để xem hoặc sửa mật khẩu trực tiếp tại đây.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.trangThai}
                      onChange={(e) => setForm({ ...form, trangThai: e.target.checked })}
                      className="size-4 rounded border-gray-300 text-primary"
                    />
                    Tài khoản đang hoạt động
                  </label>
                </>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-100 pt-4">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Đóng
              </button>
              <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

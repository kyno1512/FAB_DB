import { useEffect, useState } from 'react'

export default function HistoryCreateModal({ open, items, onClose, onSubmit }) {
  const [maNguyenLieu, setMaNguyenLieu] = useState('')
  const [loai, setLoai] = useState('Nhap')
  const [soLuong, setSoLuong] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setMaNguyenLieu('')
    setLoai('Nhap')
    setSoLuong('')
    setGhiChu('')
    setError('')
  }, [open])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    const qty = Number(soLuong)
    if (!maNguyenLieu || !qty || qty <= 0) {
      setError('Chọn nguyên liệu và nhập số lượng dương.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSubmit({
        maNguyenLieu: Number(maNguyenLieu),
        soLuongThayDoi: loai === 'Nhap' ? qty : -qty,
        ghiChu: ghiChu.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="font-display text-xl font-semibold text-gray-800">Ghi nhận biến động</h3>
        <p className="mt-1 text-sm text-gray-500">Thêm dòng lịch sử nhập hoặc xuất kho thủ công.</p>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Nguyên liệu</span>
            <select
              value={maNguyenLieu}
              onChange={(e) => setMaNguyenLieu(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="">Chọn nguyên liệu...</option>
              {items.map((item) => (
                <option key={item.maNguyenLieu} value={item.maNguyenLieu}>
                  {item.tenNguyenLieu} ({Number(item.soLuongTon).toLocaleString('vi-VN')} {item.donVi})
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Loại</span>
              <select
                value={loai}
                onChange={(e) => setLoai(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="Nhap">Nhập</option>
                <option value="Xuat">Xuất</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Số lượng</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={soLuong}
                onChange={(e) => setSoLuong(e.target.value)}
                placeholder="Ví dụ: 10"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Ghi chú</span>
            <input
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Lý do biến động..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Tạo bản ghi'}
          </button>
        </div>
      </form>
    </div>
  )
}

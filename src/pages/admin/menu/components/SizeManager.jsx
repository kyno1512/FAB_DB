import { useEffect, useState } from 'react'
import { getSizes, createSize, updateSize, deleteSize } from '../../../../services/sizeService'
import { confirmAction, showError, showSuccess } from '../../../../lib/swal'
import { formatPrice } from '../../../../lib/formatPrice'

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm'

function SizeForm({ size, onSubmit, onCancel, saving }) {
  const [tenSize, setTenSize] = useState(size?.tenSize || '')
  const [heSoGia, setHeSoGia] = useState(size?.heSoGia != null ? String(size.heSoGia) : '1.0')
  const [thuTu, setThuTu] = useState(size?.thuTu != null ? String(size.thuTu) : '0')
  const [trangThai, setTrangThai] = useState(size?.trangThai ?? true)

  function handleSubmit(e) {
    e.preventDefault()
    if (!tenSize.trim()) return
    const heSo = parseFloat(heSoGia) || 1
    onSubmit({
      tenSize: tenSize.trim(),
      heSoGia: heSo,
      thuTu: parseInt(thuTu) || 0,
      trangThai,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl bg-gray-50 p-4">
      <div className="min-w-[140px] flex-1">
        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên size</label>
        <input
          className={inputClass}
          value={tenSize}
          onChange={(e) => setTenSize(e.target.value)}
          placeholder="S, M, L..."
          required
        />
      </div>
      <div className="w-28">
        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Hệ số giá</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          max="10"
          className={inputClass}
          value={heSoGia}
          onChange={(e) => setHeSoGia(e.target.value)}
          required
        />
      </div>
      <div className="w-20">
        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Thứ tự</label>
        <input
          type="number"
          min="0"
          className={inputClass}
          value={thuTu}
          onChange={(e) => setThuTu(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <input
            type="checkbox"
            checked={trangThai}
            onChange={(e) => setTrangThai(e.target.checked)}
          />
          <span className="text-xs font-medium text-gray-700">Hoạt động</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? '...' : size ? 'Lưu' : 'Thêm'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Hủy
        </button>
      </div>
    </form>
  )
}

export default function SizeManager() {
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSizes()
  }, [])

  async function fetchSizes() {
    setLoading(true)
    try {
      const data = await getSizes()
      setSizes(Array.isArray(data) ? data : [])
    } catch (err) {
      showError('Không thể tải danh sách size')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(formData) {
    setSaving(true)
    try {
      if (editing) {
        await updateSize(editing.maSize, formData)
        await showSuccess('Đã cập nhật size')
      } else {
        await createSize(formData)
        await showSuccess('Đã thêm size mới')
      }
      setEditing(null)
      await fetchSizes()
    } catch (err) {
      showError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(size) {
    const confirmed = await confirmAction({
      icon: 'warning',
      title: 'Xóa size?',
      text: `Size "${size.tenSize}" sẽ bị xóa. Các sản phẩm có giá theo size này có thể bị ảnh hưởng.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    try {
      await deleteSize(size.maSize)
      await showSuccess('Đã xóa size')
      await fetchSizes()
    } catch (err) {
      showError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-800">Quản lý Size</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Size dùng cho đồ uống (Cà phê, Trà...). Hệ số giá nhân với giá gốc.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          + Thêm size
        </button>
      </div>

      {/* Form */}
      {(editing !== undefined || !loading) && (
        <SizeForm
          size={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8 text-sm text-gray-500">Đang tải...</div>
      ) : sizes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-sm text-gray-500">
          Chưa có size nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Hệ số giá</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Giá tham khảo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Thứ tự</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sizes.map((size) => (
                <tr key={size.maSize} className={editing?.maSize === size.maSize ? 'bg-primary/5' : ''}>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800">{size.tenSize}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    ×{Number(size.heSoGia).toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatPrice(Math.round(25000 * size.heSoGia))} <span className="text-xs">(với 25k base)</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {size.thuTu}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      size.trangThai 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {size.trangThai ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(size)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(size)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

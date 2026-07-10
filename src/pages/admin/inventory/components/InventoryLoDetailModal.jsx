import { useEffect, useState } from 'react'
import { getLosByMaterial, updateLo, deleteLo } from '../../../../services/inventoryAdminService'
import { confirmAction, showSuccess, showError } from '../../../../lib/swal'

function formatDateOnly(value) {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

function formatCurrency(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  return `${number.toLocaleString('vi-VN')}đ`
}

function statusBadge(tinhTrang, soNgayConLai) {
  const map = {
    BinhThuong: { class: 'bg-emerald-100 text-emerald-800', label: 'Bình thường' },
    SapHetHan: { class: 'bg-amber-100 text-amber-800', label: 'Sắp hết hạn' },
    DaHetHan: { class: 'bg-red-100 text-red-800', label: 'Đã hết hạn' },
    HetHang: { class: 'bg-gray-100 text-gray-600', label: 'Hết hàng' },
    SapHet: { class: 'bg-orange-100 text-orange-800', label: 'Sắp hết' },
  }
  const info = map[tinhTrang] || { class: 'bg-gray-100 text-gray-800', label: tinhTrang }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${info.class}`}>
      {info.label}
      {soNgayConLai != null && tinhTrang !== 'HetHang' && tinhTrang !== 'DaHetHan' && (
        <span className="font-normal opacity-75">({Math.abs(soNgayConLai)} ngày)</span>
      )}
    </span>
  )
}

function EditLoModal({ open, lo, onClose, onSuccess }) {
  const [form, setForm] = useState({
    ngaySanXuat: '',
    hanSuDung: '',
    donGia: '',
    ghiChu: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !lo) return
    setForm({
      ngaySanXuat: lo.ngaySanXuat || '',
      hanSuDung: lo.hanSuDung || '',
      donGia: lo.donGia ?? '',
      ghiChu: lo.ghiChu || '',
    })
    setError('')
  }, [open, lo])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateLo(lo.maLo, {
        ngaySanXuat: form.ngaySanXuat || null,
        hanSuDung: form.hanSuDung,
        donGia: Number(form.donGia) || 0,
        ghiChu: form.ghiChu || null,
      })
      showSuccess('Đã cập nhật lô thành công.')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[500] grid place-items-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="font-display text-lg font-semibold text-gray-800">Sửa lô #{lo?.maLo}</h3>
        <p className="mt-1 text-sm text-gray-500">{lo?.tenNguyenLieu}</p>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Ngày sản xuất
            </label>
            <input
              type="date"
              value={form.ngaySanXuat}
              onChange={(e) => setForm({ ...form, ngaySanXuat: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Hạn sử dụng <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.hanSuDung}
              onChange={(e) => setForm({ ...form, hanSuDung: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Đơn giá
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={form.donGia}
              onChange={(e) => setForm({ ...form, donGia: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Ghi chú
            </label>
            <textarea
              rows={2}
              value={form.ghiChu}
              onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
              placeholder="Nhập ghi chú..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
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
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function InventoryLoDetailModal({ open, item, onClose }) {
  const [loading, setLoading] = useState(false)
  const [los, setLos] = useState([])
  const [error, setError] = useState('')
  const [editLo, setEditLo] = useState(null)

  useEffect(() => {
    if (!open || !item) return
    let active = true
    setLoading(true)
    setError('')
    setLos([])
    getLosByMaterial(item.maNguyenLieu)
      .then((data) => {
        if (!active) return
        const list = Array.isArray(data) ? data : []
        setLos(list)
      })
      .catch((err) => {
        if (!active) return
        setError(err?.message ?? 'Không tải được danh sách lô.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, item?.maNguyenLieu])

  if (!open) return null
  if (!item) return null

  const conHangLo = los.filter(x => x.trangThai === 'ConHang')
  const hetHangLo = los.filter(x => x.trangThai === 'HetHang')

  async function handleDelete(lo) {
    const confirmed = await confirmAction(
      `Bạn có chắc muốn xóa lô #${lo.maLo} không? Lô này sẽ bị xóa vĩnh viễn và số lượng tồn kho sẽ được cập nhật.`
    )
    if (!confirmed) return

    try {
      await deleteLo(lo.maLo)
      showSuccess('Đã xóa lô thành công.')
      const data = await getLosByMaterial(item.maNguyenLieu)
      setLos(Array.isArray(data) ? data : [])
    } catch (err) {
      showError(err.response?.data?.message || 'Không thể xóa lô.')
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[400] grid place-items-center bg-black/40 p-4">
        <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-gray-800">Quản lý lô nguyên liệu</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {item.tenNguyenLieu} — {item.donVi}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Đóng
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-b border-gray-100 px-6 py-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{conHangLo.length}</p>
              <p className="text-xs text-emerald-700">Lô còn hàng</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {conHangLo.filter(x => x.tinhTrang === 'SapHetHan' || x.tinhTrang === 'DaHetHan').length}
              </p>
              <p className="text-xs text-amber-700">Cần xử lý HSD</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold text-gray-600">{hetHangLo.length}</p>
              <p className="text-xs text-gray-700">Lô đã xuất hết</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {loading ? (
              <p className="py-10 text-center text-sm text-gray-500">Đang tải danh sách lô...</p>
            ) : los.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">Chưa có lô nào cho nguyên liệu này.</p>
            ) : (
              <div className="space-y-4">
                {/* Lô còn hàng */}
                {conHangLo.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">📦 Lô còn hàng (sắp xếp theo HSD - FIFO)</h4>
                    <div className="overflow-x-auto rounded-xl border border-emerald-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-emerald-50 text-left text-xs uppercase text-emerald-700">
                          <tr>
                            <th className="px-3 py-2.5">Mã lô</th>
                            <th className="px-3 py-2.5">NSX</th>
                            <th className="px-3 py-2.5">HSD</th>
                            <th className="px-3 py-2.5 w-28">Còn lại</th>
                            <th className="px-3 py-2.5 w-32">Đơn giá</th>
                            <th className="px-3 py-2.5">Tình trạng</th>
                            <th className="px-3 py-2.5">Ghi chú</th>
                            <th className="px-3 py-2.5 w-24">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100">
                          {conHangLo.map((lo) => (
                            <tr key={lo.maLo} className="hover:bg-emerald-50/50">
                              <td className="px-3 py-2.5 font-medium text-gray-800">#{lo.maLo}</td>
                              <td className="px-3 py-2.5 text-gray-600">{formatDateOnly(lo.ngaySanXuat)}</td>
                              <td className="px-3 py-2.5 font-medium text-gray-800">{formatDateOnly(lo.hanSuDung)}</td>
                              <td className="px-3 py-2.5 font-semibold text-gray-800">
                                {Number(lo.soLuongCon).toLocaleString('vi-VN')} {lo.donVi}
                              </td>
                              <td className="px-3 py-2.5 text-gray-600">{formatCurrency(lo.donGia)}</td>
                              <td className="px-3 py-2.5">{statusBadge(lo.tinhTrang, lo.soNgayConLai)}</td>
                              <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[150px] truncate">
                                {lo.ghiChu || '—'}
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditLo(lo)}
                                    className="rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(lo)}
                                    className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
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
                  </div>
                )}

                {/* Lô hết hàng */}
                {hetHangLo.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-500">📋 Lô đã xuất hết</h4>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 opacity-75">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                          <tr>
                            <th className="px-3 py-2.5">Mã lô</th>
                            <th className="px-3 py-2.5">NSX</th>
                            <th className="px-3 py-2.5">HSD</th>
                            <th className="px-3 py-2.5">Đơn giá</th>
                            <th className="px-3 py-2.5">Tình trạng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-400">
                          {hetHangLo.map((lo) => (
                            <tr key={lo.maLo}>
                              <td className="px-3 py-2.5">#{lo.maLo}</td>
                              <td className="px-3 py-2.5">{formatDateOnly(lo.ngaySanXuat)}</td>
                              <td className="px-3 py-2.5">{formatDateOnly(lo.hanSuDung)}</td>
                              <td className="px-3 py-2.5">{formatCurrency(lo.donGia)}</td>
                              <td className="px-3 py-2.5">{statusBadge(lo.tinhTrang, lo.soNgayConLai)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-3 rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Bình thường
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span> Sắp hết hạn (≤7 ngày)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span> Đã hết hạn
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span> Sắp hết hàng
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditLoModal
        open={!!editLo}
        lo={editLo}
        onClose={() => setEditLo(null)}
        onSuccess={async () => {
          const data = await getLosByMaterial(item.maNguyenLieu)
          setLos(Array.isArray(data) ? data : [])
        }}
      />
    </>
  )
}

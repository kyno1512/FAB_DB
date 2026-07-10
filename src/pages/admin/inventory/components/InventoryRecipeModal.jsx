import { useEffect, useState } from 'react'
import { getRecipesByMaterial } from '../../../../services/inventoryAdminService'

function formatQty(value, unit) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  return `${number.toLocaleString('vi-VN')} ${unit}`
}

const EXPIRY_BADGE = {
  ConHan: { label: 'Còn hạn', className: 'bg-emerald-100 text-emerald-800' },
  SapHetHan: { label: 'Sắp hết hạn', className: 'bg-amber-100 text-amber-800' },
  DaHetHan: { label: 'Đã hết hạn', className: 'bg-red-100 text-red-800' },
}

export default function InventoryRecipeModal({ open, item, onClose }) {
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !item) return
    let active = true
    setLoading(true)
    setError('')
    setRecipes([])
    getRecipesByMaterial(item.maNguyenLieu)
      .then((data) => {
        if (!active) return
        const list = Array.isArray(data) ? data : []
        setRecipes(list)
      })
      .catch((err) => {
        if (!active) return
        setError(err?.message ?? 'Không tải được công thức.')
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

  return (
    <div className="fixed inset-0 z-[400] grid place-items-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nguyên liệu</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-gray-800 break-words">
                {item.tenNguyenLieu}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Dùng trong <span className="font-semibold text-gray-700">{recipes.length}</span> sản phẩm
              </p>
            </div>

            <div className="grid w-full gap-2 text-xs text-gray-600 sm:w-auto sm:min-w-[260px]">
              <InfoChip label="Đơn vị" value={item.donVi} />
              <InfoChip label="Tồn kho" value={item.soLuongTon != null ? formatQty(item.soLuongTon, item.donVi) : null} />
              <InfoChip
                label="Giá nhập"
                value={item.giaNhap != null ? `${Number(item.giaNhap).toLocaleString('vi-VN')}đ` : null}
              />
              <InfoChip
                label="HSD"
                value={
                  item.hanSuDungTu || item.hanSuDungDen
                    ? `${item.hanSuDungTu ?? '...'} → ${item.hanSuDungDen ?? '...'}`
                    : null
                }
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Đóng
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500">Đang tải công thức...</p>
          ) : recipes.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">Chưa có công thức nào dùng nguyên liệu này.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2.5">Sản phẩm</th>
                    <th className="px-3 py-2.5">Đơn vị</th>
                    <th className="px-3 py-2.5 text-right">Số lượng</th>
                    <th className="px-3 py-2.5">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recipes.map((row) => (
                    <tr key={row.maCongThuc} className="hover:bg-gray-50/80">
                      <td className="px-3 py-2 font-medium text-gray-800">{row.tenSanPham ?? `#${row.maSanPham}`}</td>
                      <td className="px-3 py-2 text-gray-600">{row.donVi || '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-800">{formatQty(row.soLuong, row.donVi)}</td>
                      <td className="px-3 py-2 text-gray-600">{row.ghiChu || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
  )
}

function InfoChip({ label, value }) {
  const isEmpty = value === null || value === undefined || value === ''
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${isEmpty ? 'border-gray-100 bg-gray-50 text-gray-400' : 'border-gray-200 bg-white text-gray-700'}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      <span className="truncate text-right text-xs">{isEmpty ? '—' : value}</span>
    </div>
  )
}

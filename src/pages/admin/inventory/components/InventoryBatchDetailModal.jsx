import { useEffect, useState } from 'react'
import { getBatchesByMaterial } from '../../../../services/inventoryAdminService'

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

export default function InventoryBatchDetailModal({ open, item, onClose }) {
  const [loading, setLoading] = useState(false)
  const [batches, setBatches] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !item) return
    let active = true
    setLoading(true)
    setError('')
    setBatches([])
    getBatchesByMaterial(item.maNguyenLieu)
      .then((data) => {
        if (!active) return
        const list = Array.isArray(data) ? data : []
        setBatches(list)
        if (!Array.isArray(data)) {
          setError('API trả về dữ liệu không hợp lệ.')
        }
      })
      .catch((err) => {
        if (!active) return
        setError(err?.message ?? 'Không tải được chi tiết nguyên liệu.')
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

  const totalValue = batches.reduce((sum, b) => sum + (Number(b.soLuongCon) || 0) * (Number(b.donGia) || 0), 0)

  const stockStatus = item.trangThaiTon
  const stockStatusConfig = {
    BinhThuong: { emoji: '🟢', label: 'Bình thường', color: 'text-emerald-600' },
    SapHet: { emoji: '🟡', label: 'Sắp hết', color: 'text-amber-600' },
    HetHang: { emoji: '🔴', label: 'Hết hàng', color: 'text-red-600' },
  }
  const stockInfo = stockStatusConfig[stockStatus] || stockStatusConfig.BinhThuong

  return (
    <div className="fixed inset-0 z-[400] grid place-items-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold text-gray-800">{item.tenNguyenLieu}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                <span>Đơn vị: <strong>{item.donVi}</strong></span>
                <span>Tổng tồn kho: <strong>{Number(item.soLuongTon || 0).toLocaleString('vi-VN')}{item.donVi}</strong></span>
                <span>Mức tồn tối thiểu: <strong>{Number(item.mucTonToiThieu || 0).toLocaleString('vi-VN')}{item.donVi}</strong></span>
                <span className={stockInfo.color}>
                  Trạng thái kho: {stockInfo.emoji} {stockInfo.label}
                </span>
                <span>Số lô: <strong>{batches.length}</strong></span>
              </div>
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

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500">Đang tải chi tiết...</p>
          ) : batches.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">Chưa có lô nhập nào cho nguyên liệu này.</p>
          ) : (
            <div className="space-y-3">
              {batches.map((row, index) => {
                const daysLeft = row.soNgayConLai != null ? Math.max(0, row.soNgayConLai) : 0
                const isExpired = row.trangThaiHSD === 'DaHetHan' || daysLeft <= 0
                const isWarning = row.trangThaiHSD === 'SapHetHan' && daysLeft > 0
                const isGreen = row.trangThaiHSD === 'ConHan' && daysLeft > 0
                
                const dot = isExpired ? '🔴' : isWarning ? '🟡' : '🟢'
                const statusText = isExpired ? 'Hết hạn' : isWarning ? 'Sắp hết hạn' : 'Còn hạn'
                const daysText = ` (Còn ${daysLeft} ngày)`
                
                const batchValue = (Number(row.soLuongCon) || 0) * (Number(row.donGia) || 0)
                
                return (
                  <div key={row.maChiTiet || index}>
                    {/* Lô header */}
                    {index > 0 && (
                      <div className="mb-3 border-t border-gray-200"></div>
                    )}
                    <div className="rounded-xl bg-gray-50/80 border border-gray-200 p-4">
                      {/* Lô title & status */}
                      <div className="mb-3">
                        <span className="font-semibold text-gray-800">Lô #{row.maPhieuNhap}</span>
                      </div>
                      
                      {/* Status badge */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                          isExpired ? 'bg-red-100 text-red-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {dot} {statusText}{isExpired ? '' : daysText}
                        </span>
                      </div>
                      
                      {/* Info grid */}
                      <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Số lượng nhập:</span>
                          <span className="font-medium text-gray-800">{Number(row.soLuong).toLocaleString('vi-VN')}{item.donVi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Số lượng còn:</span>
                          <span className="font-medium text-gray-800">{Number(row.soLuongCon).toLocaleString('vi-VN')}{item.donVi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Đơn giá:</span>
                          <span className="font-medium text-gray-800">{formatCurrency(row.donGia)}/{item.donVi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Giá trị còn:</span>
                          <span className="font-medium text-gray-800">{formatCurrency(batchValue)}</span>
                        </div>
                      </div>
                      
                      {/* Date info */}
                      <div className="border-t border-gray-200/50 pt-3 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <span>Ngày nhập: <strong className="text-gray-800">{formatDateOnly(row.ngayNhap)}</strong></span>
                          <span>Ngày sản xuất: <strong className="text-gray-800">{formatDateOnly(row.hanSuDungTu)}</strong></span>
                          <span>Hạn sử dụng: <strong className="text-gray-800">{formatDateOnly(row.hanSuDungDen)}</strong></span>
                        </div>
                        {row.tenNhaCungCap && (
                          <div className="mt-1">
                            <span>Nhà cung cấp: <strong className="text-gray-800">{row.tenNhaCungCap}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Footer total */}
              <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-sm text-primary/70">Tổng giá trị tồn kho</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
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
  )
}

function formatQty(value, unit) {
  const num = Number(value)
  if (Number.isNaN(num)) return `0 ${unit}`
  return `${num.toLocaleString('vi-VN')} ${unit}`
}

export default function ReceiptDetailModal({ open, receipt, mode = 'import', onClose }) {
  if (!open || !receipt) return null

  const isImport = mode === 'import'
  const lines = receipt.chiTiet ?? []

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative shrink-0 border-b px-6 py-5 ${isImport ? 'bg-emerald-50/80' : 'bg-red-50/80'}`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/90 text-lg text-gray-500 shadow-sm"
            aria-label="Đóng"
          >
            ×
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {isImport ? 'Phiếu nhập kho' : 'Phiếu xuất kho'}
          </p>
          <h3 className="font-display text-xl font-bold text-gray-900">
            #{isImport ? receipt.maPhieuNhap : receipt.maPhieuXuat}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {new Date(isImport ? receipt.ngayNhap : receipt.ngayXuat).toLocaleString('vi-VN')}
          </p>
          {!isImport && receipt.lyDoXuat && (
            <p className="mt-1 text-sm text-gray-600">
              Lý do: <strong>{receipt.lyDoXuat}</strong>
            </p>
          )}
          {isImport && receipt.tenNhaCungCap && (
            <p className="mt-1 text-sm text-gray-600">
              NCC: <strong>{receipt.tenNhaCungCap}</strong>
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Nguyên liệu {isImport ? 'nhập' : 'xuất'} ({lines.length} dòng)
          </p>
          {lines.length === 0 ? (
            <p className="text-sm text-gray-500">Không có chi tiết dòng.</p>
          ) : (
            <ul className="space-y-2">
              {lines.map((line) => (
                <li
                  key={line.maChiTiet}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">{line.tenNguyenLieu}</p>
                    {line.ghiChu && <p className="text-xs text-gray-500">{line.ghiChu}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isImport ? 'text-emerald-700' : 'text-red-600'}`}>
                      {isImport ? '+' : '−'}
                      {formatQty(line.soLuong, line.donVi)}
                    </p>
                    {isImport && line.donGia != null && (
                      <p className="text-xs text-gray-500">
                        {Number(line.donGia).toLocaleString('vi-VN')}đ/{line.donVi}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {receipt.ghiChu && (
            <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Ghi chú: {receipt.ghiChu}
            </p>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export function summarizeReceiptLines(lines, maxItems = 2) {
  if (!lines?.length) return '—'
  const parts = lines.slice(0, maxItems).map((line) => {
    const qty = Number(line.soLuong).toLocaleString('vi-VN')
    return `${line.tenNguyenLieu} ${qty}${line.donVi}`
  })
  if (lines.length > maxItems) parts.push(`+${lines.length - maxItems} NVL khác`)
  return parts.join(' · ')
}

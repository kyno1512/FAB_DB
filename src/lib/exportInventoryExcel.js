import * as XLSX from 'xlsx'

function downloadWorkbook(workbook, filename) {
  XLSX.writeFile(workbook, filename)
}

function buildSummaryRows(stats, typeLabel) {
  const now = new Date()
  const period = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`
  return [
    ['BÁO CÁO KHO HÀNG — FLYGO'],
    ['Loại phiếu', typeLabel],
    ['Kỳ báo cáo', period],
    ['Ngày xuất', now.toLocaleString('vi-VN')],
    [],
    ['Chỉ tiêu', 'Giá trị'],
    ...stats.map((item) => [item.label, item.value]),
    [],
  ]
}

function buildImportDetailRows(receipts) {
  const rows = [['Mã phiếu', 'Ngày nhập', 'NCC', 'Nguyên liệu', 'SL', 'Đơn giá', 'Thành tiền', 'Trạng thái', 'Ghi chú']]
  for (const receipt of receipts) {
    for (const line of receipt.chiTiet || []) {
      rows.push([
        receipt.maPhieuNhap,
        new Date(receipt.ngayNhap).toLocaleString('vi-VN'),
        receipt.tenNhaCungCap || '',
        line.tenNguyenLieu,
        Number(line.soLuong),
        Number(line.donGia),
        Number(line.thanhTien),
        receipt.trangThai,
        receipt.ghiChu || '',
      ])
    }
  }
  return rows
}

function buildExportDetailRows(receipts) {
  const rows = [['Mã phiếu', 'Ngày xuất', 'Lý do', 'Nguyên liệu', 'SL', 'Trạng thái', 'Ghi chú']]
  for (const receipt of receipts) {
    for (const line of receipt.chiTiet || []) {
      rows.push([
        receipt.maPhieuXuat,
        new Date(receipt.ngayXuat).toLocaleString('vi-VN'),
        receipt.lyDoXuat,
        line.tenNguyenLieu,
        Number(line.soLuong),
        receipt.trangThai,
        receipt.ghiChu || line.ghiChu || '',
      ])
    }
  }
  return rows
}

export function exportInventoryTransactionsExcel({ stats, receipts, typeLabel, filenamePrefix, isImport }) {
  const summary = buildSummaryRows(stats, typeLabel)
  const detail = isImport ? buildImportDetailRows(receipts) : buildExportDetailRows(receipts)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), 'Tổng hợp')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(detail), 'Chi tiết')
  const month = new Date().getMonth() + 1
  downloadWorkbook(workbook, `${filenamePrefix}-thang-${month}.xlsx`)
}

import * as XLSX from 'xlsx'
import { formatPrice } from './formatPrice'

function downloadWorkbook(workbook, filename) {
  XLSX.writeFile(workbook, filename)
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('vi-VN')
}

function fmtMoney(n) {
  return Number(n ?? 0)
}

export function exportReportsExcel(report) {
  if (!report) return

  const period = `${fmtDate(report.from)} – ${fmtDate(report.to)}`
  const summary = [
    ['BÁO CÁO TỔNG HỢP — FLYGO'],
    ['Kỳ báo cáo', period],
    ['Nhóm doanh thu', report.groupBy === 'month' ? 'Tháng' : report.groupBy === 'week' ? 'Tuần' : 'Ngày'],
    ['Ngày xuất', new Date().toLocaleString('vi-VN')],
    [],
    ['DOANH THU'],
    ['Tổng (trừ đơn hủy)', fmtMoney(report.revenue?.tongDoanhThu)],
    ['Đã hoàn thành', fmtMoney(report.revenue?.doanhThuHoanThanh)],
    ['Tổng giảm giá', fmtMoney(report.revenue?.tongGiamGia)],
    [],
    ['ĐƠN HÀNG'],
    ['Tổng đơn', report.orders?.tongDon ?? 0],
    ['Hoàn thành', report.orders?.hoanThanh ?? 0],
    ['Đang xử lý', report.orders?.dangXuLy ?? 0],
    ['Đã hủy', report.orders?.daHuy ?? 0],
    ['Tỷ lệ hoàn thành (%)', report.orders?.tyLeHoanThanh ?? 0],
    ['Tỷ lệ hủy (%)', report.orders?.tyLeHuy ?? 0],
    [],
    ['KHO HÀNG'],
    ['Tổng nguyên liệu', report.inventory?.tongNguyenLieu ?? 0],
    ['Sắp hết', report.inventory?.sapHet ?? 0],
    ['Giá trị tồn ước tính', fmtMoney(report.inventory?.giaTriTonUocTinh)],
    ['Phiếu nhập trong kỳ', report.inventory?.phieuNhapTrongKy ?? 0],
    ['Phiếu xuất trong kỳ', report.inventory?.phieuXuatTrongKy ?? 0],
    ['Tổng tiền nhập trong kỳ', fmtMoney(report.inventory?.tongTienNhapTrongKy)],
    [],
    ['CHƯA CÓ TRONG DB / HẠN CHẾ'],
    ...(report.dataGaps ?? []).map((g) => [g]),
  ]

  const revenueRows = [
    ['Kỳ', 'Số đơn', 'Doanh thu'],
    ...(report.revenueSeries ?? []).map((p) => [p.label, p.soDon, fmtMoney(p.doanhThu)]),
  ]

  const categoryRows = [
    ['Danh mục', 'Số lượng bán', 'Doanh thu'],
    ...(report.revenueByCategory ?? []).map((c) => [c.tenDanhMuc, c.soLuong, fmtMoney(c.doanhThu)]),
  ]

  const bestSellerRows = [
    ['Món', 'Danh mục', 'SL bán', 'Doanh thu'],
    ...(report.bestSellers ?? []).map((b) => [
      b.tenSanPham,
      b.tenDanhMuc,
      b.soLuongBan,
      fmtMoney(b.doanhThu),
    ]),
  ]

  const lowStockRows = [
    ['Nguyên liệu', 'Đơn vị', 'Tồn', 'Mức tối thiểu'],
    ...(report.inventory?.nguyenLieuSapHet ?? []).map((m) => [
      m.tenNguyenLieu,
      m.donVi,
      Number(m.soLuongTon),
      Number(m.mucTonToiThieu),
    ]),
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), 'Tổng hợp')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(revenueRows), 'Doanh thu')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(categoryRows), 'Theo danh mục')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(bestSellerRows), 'Bán chạy')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(lowStockRows), 'Kho sắp hết')

  const slug = new Date().toISOString().slice(0, 10)
  downloadWorkbook(workbook, `bao-cao-flygo-${slug}.xlsx`)
}

export function formatReportMoney(value) {
  return formatPrice(value ?? 0)
}

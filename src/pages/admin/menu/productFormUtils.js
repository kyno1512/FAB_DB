export const emptyForm = {
  maDanhMuc: '',
  tenSanPham: '',
  moTa: '',
  giaBan: '',
  giaGoc: '',
  donVi: 'Ly',
  trangThai: true,
  hinhAnhUrl: '',
}

export function buildComboMoTa(items) {
  if (!items.length) return ''
  return items
    .map((item) => `${item.tenSanPham}${item.soLuong > 1 ? ` x${item.soLuong}` : ''}`)
    .join(' + ')
}

export function sumComboGiaLe(items) {
  return items.reduce((total, item) => total + item.giaBan * (item.soLuong || 1), 0)
}

export function comboItemsFromProduct(product) {
  return (product.comboItems ?? []).map((item) => ({
    maSanPhamCon: item.maSanPhamCon,
    tenSanPham: item.tenSanPham,
    tenDanhMuc: item.tenDanhMuc,
    giaBan: item.giaBan,
    hinhAnhChinh: item.hinhAnhChinh,
    soLuong: item.soLuong ?? 1,
  }))
}

export function bomItemsFromProduct(product) {
  return (product.bomItems ?? []).map((item) => ({
    maNguyenLieu: item.maNguyenLieu,
    tenNguyenLieu: item.tenNguyenLieu,
    soLuong: item.soLuong,
    donVi: item.donVi,
    ghiChu: item.ghiChu,
    soLuongTon: item.soLuongTon,
  }))
}

export function toPayload(form, selectedComboItems = [], selectedBomItems = []) {
  const hinhAnhs = form.hinhAnhUrl.trim()
    ? [{ duongDan: form.hinhAnhUrl.trim(), laAnhChinh: true, thuTu: 0 }]
    : []

  const comboItems = selectedComboItems.map((item, index) => ({
    maSanPhamCon: item.maSanPhamCon,
    soLuong: item.soLuong > 0 ? item.soLuong : 1,
    thuTu: index,
  }))

  const bomItems = selectedBomItems
    .filter((item) => item.maNguyenLieu > 0 && item.soLuong > 0)
    .map((item) => ({
      maNguyenLieu: item.maNguyenLieu,
      soLuong: item.soLuong,
      donVi: item.donVi?.trim() || 'kg',
      ghiChu: item.ghiChu?.trim() || null,
    }))

  const giaBan = Number(form.giaBan)
  const isCombo = comboItems.length >= 2
  let giaGoc = null
  if (isCombo) {
    const giaLe = sumComboGiaLe(selectedComboItems)
    giaGoc = giaLe > giaBan ? giaLe : null
  }

  return {
    maDanhMuc: Number(form.maDanhMuc),
    tenSanPham: form.tenSanPham.trim(),
    moTa: form.moTa.trim() || null,
    giaBan,
    giaGoc,
    donVi: form.donVi.trim() || 'Ly',
    trangThai: form.trangThai,
    hinhAnhs,
    toppings: [],
    comboItems,
    bomItems,
  }
}

export function isComboCategory(categories, maDanhMuc) {
  const cat = categories.find((c) => String(c.maDanhMuc) === String(maDanhMuc))
  return cat?.tenDanhMuc === 'Combo'
}

export function getComboCategoryId(categories) {
  return categories.find((c) => c.tenDanhMuc === 'Combo')?.maDanhMuc ?? null
}

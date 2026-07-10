import axiosClient from '../lib/axiosClient'

export function getAdminOrders({ trangThai, trangThaiHuy, loai } = {}) {
  const params = {}
  if (trangThai) params.trangThai = trangThai
  if (trangThaiHuy) params.trangThaiHuy = trangThaiHuy
  if (loai) params.loai = loai
  return axiosClient.get('/orders/admin', { params })
}

export function getInternalShippers() {
  return axiosClient.get('/orders/admin/shippers')
}

export function getAdminOrderDetail(id) {
  return axiosClient.get(`/orders/admin/${id}`)
}

export function updateOrderStatus(id, trangThai, { maShipper, phiGiaoHang, ghiChuGiao } = {}) {
  const body = { trangThai }
  if (maShipper) body.maShipper = maShipper
  if (phiGiaoHang != null) body.phiGiaoHang = phiGiaoHang
  if (ghiChuGiao) body.ghiChuGiao = ghiChuGiao
  return axiosClient.put(`/orders/admin/${id}/status`, body)
}

export function deleteAdminOrders(ids) {
  return axiosClient.delete('/orders/admin/bulk', { data: { ids } })
}

export function confirmVnpayManual(maDonHang) {
  return axiosClient.post('/payments/vnpay/confirm-manual', { maDonHang })
}

export function processRefund(maDonHang, data) {
  return axiosClient.post(`/orders/admin/${maDonHang}/refund`, data)
}

export function getRefundHistory(maDonHang) {
  return axiosClient.get(`/orders/admin/${maDonHang}/refund-history`)
}

export function updateOrderCustomerInfo(maDonHang, data) {
  return axiosClient.put(`/orders/admin/${maDonHang}/customer`, data)
}

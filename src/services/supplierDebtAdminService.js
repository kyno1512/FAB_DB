import axiosClient from '../lib/axiosClient'

export function getSupplierDebtSummary() {
  return axiosClient.get('/admin/supplier-debt/summary')
}

export function getSuppliers({ page = 1, pageSize = 10, search } = {}) {
  const params = { page, pageSize }
  if (search) params.search = search
  return axiosClient.get('/admin/supplier-debt/suppliers', { params })
}

export function createSupplier(payload) {
  return axiosClient.post('/admin/supplier-debt/suppliers', payload)
}

export function updateSupplier(id, payload) {
  return axiosClient.put(`/admin/supplier-debt/suppliers/${id}`, payload)
}

export function deleteSupplier(id) {
  return axiosClient.delete(`/admin/supplier-debt/suppliers/${id}`)
}

export function getSupplierDebts({
  page = 1,
  pageSize = 10,
  search,
  maNhaCungCap,
  trangThaiThanhToan,
} = {}) {
  const params = { page, pageSize }
  if (search) params.search = search
  if (maNhaCungCap) params.maNhaCungCap = maNhaCungCap
  if (trangThaiThanhToan) params.trangThaiThanhToan = trangThaiThanhToan
  return axiosClient.get('/admin/supplier-debt/debts', { params })
}

export function recordSupplierPayment(maPhieuNhap, payload) {
  return axiosClient.post(`/admin/supplier-debt/debts/${maPhieuNhap}/pay`, payload)
}

export function assignSupplierToReceipt(maPhieuNhap, payload) {
  return axiosClient.put(`/admin/supplier-debt/debts/${maPhieuNhap}/assign-supplier`, payload)
}

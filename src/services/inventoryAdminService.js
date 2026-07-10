import axiosClient from '../lib/axiosClient'

export function getInventoryItems(search) {
  const params = {}
  if (search) params.search = search
  return axiosClient.get('/admin/inventory', { params })
}

export function getAllMaterialsForSelect() {
  return axiosClient.get('/admin/inventory/all-for-select')
}

export function getInventoryList({ search, page = 1, pageSize = 10 } = {}) {
  const params = { page, pageSize }
  if (search) params.search = search
  return axiosClient.get('/admin/inventory/list', { params })
}

export function createInventoryItem(payload) {
  return axiosClient.post('/admin/inventory', payload)
}

export function updateInventoryItem(id, payload) {
  return axiosClient.put(`/admin/inventory/${id}`, payload)
}

export function adjustInventoryStock(id, payload) {
  return axiosClient.post(`/admin/inventory/${id}/adjust`, payload)
}

export function deleteInventoryItem(id) {
  return axiosClient.delete(`/admin/inventory/${id}`)
}

export function getInventoryMovements({ limit = 200, from, to, search, loai } = {}) {
  const params = { limit }
  if (from) params.from = from
  if (to) params.to = to
  if (search) params.search = search
  if (loai) params.loai = loai
  return axiosClient.get('/admin/inventory/movements', { params })
}

export function deleteInventoryMovements(ids) {
  return axiosClient.delete('/admin/inventory/movements', { data: { ids } })
}

export function getImportReceipts(limit = 100) {
  return axiosClient.get('/admin/inventory/import-receipts', { params: { limit } })
}

export function getExportReceipts(limit = 100) {
  return axiosClient.get('/admin/inventory/export-receipts', { params: { limit } })
}

export function getBatchesByMaterial(maNguyenLieu) {
  return axiosClient.get(`/admin/inventory/materials/${maNguyenLieu}/batches`)
}

export function getRecipesByMaterial(maNguyenLieu) {
  return axiosClient.get(`/admin/inventory/materials/${maNguyenLieu}/recipes`)
}

export function createImportReceipt(payload) {
  return axiosClient.post('/admin/inventory/import-receipts', payload)
}

export function createExportReceipt(payload) {
  return axiosClient.post('/admin/inventory/export-receipts', payload)
}

// ==================== QUẢN LÝ LÔ ====================

export function getLosByMaterial(maNguyenLieu) {
  return axiosClient.get(`/admin/inventory/materials/${maNguyenLieu}/los`)
}

export function createLo(payload) {
  return axiosClient.post('/admin/inventory/los', payload)
}

export function updateLo(id, payload) {
  return axiosClient.put(`/admin/inventory/los/${id}`, payload)
}

export function deleteLo(id) {
  return axiosClient.delete(`/admin/inventory/los/${id}`)
}

export function createImportReceiptWithBatch(payload) {
  return axiosClient.post('/admin/inventory/import-receipts-with-batch', payload)
}

export function createExportReceiptFIFO(payload) {
  return axiosClient.post('/admin/inventory/export-receipts-fifo', payload)
}

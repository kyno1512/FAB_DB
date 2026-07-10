import axiosClient from '../lib/axiosClient'

export function getVouchers() {
  return axiosClient.get('/vouchers')
}

export function createVoucher(data) {
  return axiosClient.post('/vouchers', data)
}

export function updateVoucher(id, data) {
  return axiosClient.put(`/vouchers/${id}`, data)
}

export function deleteVoucher(id) {
  return axiosClient.delete(`/vouchers/${id}`)
}

export function applyHotDeal(productId, phanTramGiam) {
  return axiosClient.put(`/products/${productId}/hot-deal`, { phanTramGiam })
}

export function removeHotDeal(productId) {
  return axiosClient.delete(`/products/${productId}/hot-deal`)
}

import axiosClient from '../lib/axiosClient'

export async function createOrder(data) {
  return axiosClient.post('/orders', data)
}

export async function getMyOrders() {
  return axiosClient.get('/orders/my')
}

export async function getMyOrderDetail(id) {
  return axiosClient.get(`/orders/my/${id}`)
}

export async function trackOrder(token) {
  return axiosClient.get('/orders/track', { params: { t: token } })
}

export async function cancelOrderByToken(token) {
  return axiosClient.post('/orders/track/cancel', null, { params: { t: token } })
}

export async function cancelMyOrder(maDonHang, lyDoHuy) {
  return axiosClient.post(`/orders/my/${maDonHang}/cancel`, { lyDoHuy })
}

export async function requestCancelOrder(maDonHang, lyDoHuy) {
  return axiosClient.post(`/orders/my/${maDonHang}/cancel`, { lyDoHuy })
}

import axiosClient from '../lib/axiosClient'

export async function getDashboardStats() {
  return axiosClient.get('/admin/stats')
}

export async function getRecentOrders() {
  return axiosClient.get('/admin/orders/recent')
}

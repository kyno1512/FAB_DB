import axiosClient from '../lib/axiosClient'

export async function getSizes() {
  return axiosClient.get('/admin/sizes')
}

export async function createSize(data) {
  return axiosClient.post('/admin/sizes', data)
}

export async function updateSize(id, data) {
  return axiosClient.put(`/admin/sizes/${id}`, data)
}

export async function deleteSize(id) {
  return axiosClient.delete(`/admin/sizes/${id}`)
}

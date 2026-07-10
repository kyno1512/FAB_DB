import axiosClient from '../lib/axiosClient'

export function getAdminNews(search) {
  const params = {}
  if (search) params.search = search
  return axiosClient.get('/admin/news', { params })
}

export function createNews(payload) {
  return axiosClient.post('/admin/news', payload)
}

export function updateNews(id, payload) {
  return axiosClient.put(`/admin/news/${id}`, payload)
}

export function deleteNews(id) {
  return axiosClient.delete(`/admin/news/${id}`)
}

export function deleteManyNews(ids) {
  return axiosClient.delete('/admin/news', { data: { ids } })
}

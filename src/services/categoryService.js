import axiosClient from '../lib/axiosClient'

export async function getCategories(params = {}) {
  return axiosClient.get('/categories', { params })
}

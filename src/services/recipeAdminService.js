import axiosClient from '../lib/axiosClient'

export function getRecipeStats() {
  return axiosClient.get('/admin/recipes/stats')
}

export function getRecipes(params = {}) {
  return axiosClient.get('/admin/recipes', { params })
}

export function getRecipeByProductId(maSanPham) {
  return axiosClient.get(`/admin/recipes/${maSanPham}`)
}

export function updateRecipe(maSanPham, payload) {
  return axiosClient.put(`/admin/recipes/${maSanPham}`, payload)
}

export function deleteRecipe(maSanPham, maCongThuc) {
  return axiosClient.delete(`/admin/recipes/${maSanPham}/${maCongThuc}`)
}

export function deleteMultipleRecipes(maCongThucIds) {
  return axiosClient.delete('/admin/recipes/multiple', { data: { maCongThucIds } })
}

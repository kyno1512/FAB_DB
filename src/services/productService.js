import axiosClient from '../lib/axiosClient'

export async function getProducts(params = {}, config = {}) {
  return axiosClient.get('/products', { params, ...config })
}

export async function getSearchTags() {
  return axiosClient.get('/products/search-tags')
}

export async function getProductById(id) {
  return axiosClient.get(`/products/${id}`)
}

export async function getProductReviews(id, params = {}) {
  return axiosClient.get(`/products/${id}/reviews`, { params })
}

export async function createProductReview(id, data) {
  return axiosClient.post(`/products/${id}/reviews`, data)
}

export async function createProduct(data) {
  return axiosClient.post('/products', data)
}

export async function updateProduct(id, data) {
  return axiosClient.put(`/products/${id}`, data)
}

export async function deleteProduct(id) {
  return axiosClient.delete(`/products/${id}`)
}

export async function checkStock(lines = []) {
  return axiosClient.post('/products/check-stock', { lines })
}

export async function getMaxAvailable(id) {
  return axiosClient.get(`/products/max-available/${id}`)
}

export async function getMaxAvailableBatch(ids = []) {
  return axiosClient.post('/products/max-available/batch', ids)
}

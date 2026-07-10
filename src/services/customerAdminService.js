import axiosClient from '../lib/axiosClient'

export function getCustomers({ page = 1, pageSize = 10, search } = {}) {
  const params = { page, pageSize }
  if (search) params.search = search
  return axiosClient.get('/admin/customers', { params })
}

export function getCustomerDetail(id) {
  return axiosClient.get(`/admin/customers/${id}`)
}

export function updateCustomer(id, payload) {
  return axiosClient.put(`/admin/customers/${id}`, payload)
}

export function deleteCustomer(id) {
  return axiosClient.delete(`/admin/customers/${id}`)
}

export function deleteCustomers(ids) {
  return axiosClient.delete('/admin/customers/bulk', { data: { ids } })
}

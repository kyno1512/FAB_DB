import axiosClient from '../lib/axiosClient'

export function getStaffRoles() {
  return axiosClient.get('/admin/staff/roles')
}

export function getStaffList(search) {
  return axiosClient.get('/admin/staff', { params: search ? { search } : {} })
}

export function getStaffDetail(id) {
  return axiosClient.get(`/admin/staff/${id}`)
}

export function createStaff(payload) {
  return axiosClient.post('/admin/staff', payload)
}

export function updateStaff(id, payload) {
  return axiosClient.put(`/admin/staff/${id}`, payload)
}

export function deleteStaff(id) {
  return axiosClient.delete(`/admin/staff/${id}`)
}

export function getStaffModulePermissions(id) {
  return axiosClient.get(`/admin/staff/${id}/modules`)
}

export function updateStaffModulePermissions(id, payload) {
  return axiosClient.put(`/admin/staff/${id}/modules`, payload)
}

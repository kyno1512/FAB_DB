import axiosClient from '../lib/axiosClient'

export function getReportsOverview(params = {}) {
  return axiosClient.get('/admin/reports/overview', { params })
}

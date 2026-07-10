import axios from 'axios'
import { clearUser, getUser } from './authStorage'

const axiosClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 12000,
})

function resolveErrorMessage(err) {
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'Không kết nối được server. Hãy kiểm tra FAB.Server đã chạy chưa.'
  }

  if (!err.response) {
    return 'Không kết nối được server. Hãy kiểm tra FAB.Server đã chạy chưa.'
  }

  return err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
}

axiosClient.interceptors.request.use((config) => {
  const user = getUser()
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (axios.isCancel(err) || err.code === 'ERR_CANCELED') {
      return Promise.reject(err)
    }

    const status = err.response?.status
    const message = resolveErrorMessage(err)

    if (status === 401) {
      clearUser()
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login?reason=expired'
      }
    }

    return Promise.reject(new Error(message))
  },
)

export default axiosClient

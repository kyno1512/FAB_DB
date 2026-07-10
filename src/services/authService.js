import axiosClient from '../lib/axiosClient'
import { clearUser, patchUser, saveUser } from '../lib/authStorage'
import { paths } from '../routes/paths'

const ADMIN_ROLES = ['Admin', 'QuanLy', 'NhanVien', 'Shipper']

export function getRedirectPath(tenVaiTro) {
  return ADMIN_ROLES.includes(tenVaiTro) ? paths.ADMIN_DASHBOARD : paths.CLIENT_HOME
}

export async function login(email, password) {
  const data = await axiosClient.post('/auth/login', { email, password })
  saveUser(data)
  return data
}

export function loginWithGoogle() {
  window.location.href = '/api/auth/google?returnUrl=/login'
}

export function consumeGoogleLoginResult() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  if (!token) return null
  return {
    maNguoiDung: Number(params.get('maNguoiDung') || 0),
    hoTen: params.get('hoTen') || '',
    email: params.get('email') || '',
    maVaiTro: Number(params.get('maVaiTro') || 0),
    tenVaiTro: params.get('tenVaiTro') || '',
    token,
  }
}

export async function register({ hoTen, email, soDienThoai, password, confirmPassword }) {
  return axiosClient.post('/auth/register', {
    hoTen,
    email,
    soDienThoai,
    password,
    confirmPassword,
  })
}

export async function forgotPassword(email) {
  return axiosClient.post('/auth/forgot-password', { email })
}

export async function resetPassword({ email, token, newPassword, confirmPassword }) {
  return axiosClient.post('/auth/reset-password', {
    email,
    token,
    newPassword,
    confirmPassword,
  })
}

export async function getProfile(maNguoiDung) {
  return axiosClient.get(`/auth/profile/${maNguoiDung}`)
}

export async function updateProfile(maNguoiDung, payload) {
  const data = await axiosClient.put(`/auth/profile/${maNguoiDung}`, payload)
  patchUser({ hoTen: data.hoTen, anhDaiDien: data.anhDaiDien })
  return data
}

export async function changePassword(maNguoiDung, payload) {
  return axiosClient.put(`/auth/profile/${maNguoiDung}/password`, payload)
}

import { clearPermissionsCache } from '../hooks/usePermissions'

export function logout() {
  clearPermissionsCache()
  clearUser()
}

const ROLE_LABELS = {
  Admin: 'Quản trị viên',
  QuanLy: 'Quản lý',
  NhanVien: 'Nhân viên',
  KhachHang: 'Khách hàng',
}

export function getRoleLabel(tenVaiTro) {
  return ROLE_LABELS[tenVaiTro] ?? tenVaiTro
}

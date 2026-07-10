import axiosClient from '../lib/axiosClient'

export async function validateVoucher({ maCode, subtotal, email }) {
  return axiosClient.post('/vouchers/validate', { maCode, subtotal, email })
}

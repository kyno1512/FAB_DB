import axiosClient from '../lib/axiosClient'

export async function createVnpayPayment(maDonHang) {
  return axiosClient.post('/payments/vnpay/create', { maDonHang })
}
